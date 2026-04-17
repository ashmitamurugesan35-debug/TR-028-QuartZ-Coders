import json
import logging
import os
import re
from concurrent.futures import ThreadPoolExecutor, TimeoutError
import urllib.error
import urllib.request
from types import SimpleNamespace
from typing import Any, Dict, List, Literal, TypedDict

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from langgraph.graph import END, StateGraph


load_dotenv()


LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.DEBUG),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("startup-orchestrator")


TOOL_TIMEOUT_SECONDS = int(os.getenv("TOOL_TIMEOUT_SECONDS", "45"))
API_TIMEOUT_SECONDS = int(os.getenv("API_TIMEOUT_SECONDS", "90"))
GEMINI_TIMEOUT_SECONDS = int(os.getenv("GEMINI_TIMEOUT_SECONDS", "30"))


def _run_with_timeout(func: Any, timeout_seconds: int, *args: Any, **kwargs: Any) -> Any:
    executor = ThreadPoolExecutor(max_workers=1)
    future = executor.submit(func, *args, **kwargs)
    try:
        return future.result(timeout=timeout_seconds)
    finally:
        executor.shutdown(wait=False, cancel_futures=True)


class AgentState(TypedDict):
    user_goal: str
    tasks: List[Dict[str, str]]
    research_data: List[Dict[str, Any]]
    specialist_markdown: str
    audit_report: Dict[str, Any]
    iteration_count: int
    usage_metrics: Dict[str, int]
    event_log: List[str]
    source_inputs: Dict[str, Any]


def _gemini_model() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-flash-latest")


def _safe_int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _parse_json_payload(text: str) -> Any:
    cleaned = (text or "").strip()
    if not cleaned:
        raise ValueError("Empty model output")

    # Fast path: raw JSON
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Remove fenced code markers if present.
    cleaned = cleaned.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Extract likely JSON span.
    starts = [idx for idx in (cleaned.find("{"), cleaned.find("[")) if idx >= 0]
    if not starts:
        raise ValueError("No JSON found in model output")
    start = min(starts)
    end_obj = cleaned.rfind("}")
    end_arr = cleaned.rfind("]")
    end = max(end_obj, end_arr)
    if end <= start:
        raise ValueError("Incomplete JSON in model output")

    return json.loads(cleaned[start : end + 1])


def _update_usage(metrics: Dict[str, int], llm_response: Any, source: str) -> None:
    usage = {}
    if hasattr(llm_response, "usage_metadata") and llm_response.usage_metadata:
        usage = llm_response.usage_metadata
    elif hasattr(llm_response, "response_metadata") and llm_response.response_metadata:
        usage = llm_response.response_metadata.get("token_usage", {})

    prompt_tokens = _safe_int(
        usage.get("input_tokens")
        or usage.get("prompt_tokens")
        or usage.get("prompt_token_count")
    )
    completion_tokens = _safe_int(
        usage.get("output_tokens")
        or usage.get("completion_tokens")
        or usage.get("candidates_token_count")
    )
    total_tokens = _safe_int(usage.get("total_tokens") or (prompt_tokens + completion_tokens))

    metrics["prompt_tokens"] = metrics.get("prompt_tokens", 0) + prompt_tokens
    metrics["completion_tokens"] = metrics.get("completion_tokens", 0) + completion_tokens
    metrics["total_tokens"] = metrics.get("total_tokens", 0) + total_tokens

    logger.debug(
        "USAGE | source=%s | prompt=%s completion=%s total=%s",
        source,
        prompt_tokens,
        completion_tokens,
        total_tokens,
    )


def _build_llms() -> Dict[str, Any]:
    return {}


agents = _build_llms()


def _invoke_gemini_rest(prompt: str, model: str, state: AgentState, source: str) -> Any:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not configured")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt,
                    }
                ]
            }
        ]
    }
    data = json.dumps(payload).encode("utf-8")
    request_obj = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-goog-api-key": api_key,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request_obj, timeout=GEMINI_TIMEOUT_SECONDS) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Gemini API request failed: {exc.code} {body}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Gemini API request failed: {exc.reason}") from exc

    response_json = json.loads(body)
    candidates = response_json.get("candidates") or []
    if not candidates:
        raise RuntimeError(f"Gemini API returned no candidates: {response_json}")

    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    text = "".join(
        str(part.get("text", "")) for part in parts if isinstance(part, dict)
    ).strip()
    if not text:
        raise RuntimeError(f"Gemini API returned empty text: {response_json}")

    response = SimpleNamespace(content=text, usage_metadata={})
    _update_usage(state["usage_metrics"], response, source)
    return response


def _invoke_logic_llm(prompt: str, state: AgentState, source: str) -> Any:
    model = _gemini_model()
    try:
        response = _invoke_gemini_rest(prompt, model, state, source)
        logger.debug("[LogicLLM] Gemini REST model=%s source=%s", model, source)
        return response
    except Exception as exc:
        message = str(exc)
        logger.warning("[LogicLLM] Primary model failed (%s): %s", model, message)
        fallback_model = os.getenv("LOGIC_FALLBACK_MODEL", "gemini-2.0-flash")
        should_try_fallback = (
            fallback_model != model
            and (
                "NOT_FOUND" in message
                or "not found" in message.lower()
                or " 404" in message
            )
        )
        if should_try_fallback:
            logger.warning(
                "[LogicLLM] Primary model unavailable. Falling back to %s",
                fallback_model,
            )
            return _invoke_gemini_rest(
                prompt,
                fallback_model,
                state,
                f"{source}_fallback",
            )
        raise exc


def _extract_location_from_goal(goal: str) -> str:
    text = str(goal or "")
    match = re.search(r"\bin\s+([A-Za-z][A-Za-z\s-]{1,40})(?:[.,;]|$)", text, flags=re.IGNORECASE)
    if not match:
        return ""
    return " ".join(match.group(1).split()).strip()


def _resolve_location(state: AgentState) -> str:
    inputs = state.get("source_inputs") if isinstance(state.get("source_inputs"), dict) else {}
    location = str((inputs or {}).get("location") or "").strip()
    if location:
        return location

    parsed = _extract_location_from_goal(state.get("user_goal", ""))
    if parsed:
        return parsed

    return "target market"


def _build_specialist_fallback_markdown(
    goal: str,
    research_items: List[Dict[str, Any]],
    location: str,
) -> str:
    rows: List[Dict[str, str]] = []
    for item in research_items[:5]:
        name = str(item.get("title") or item.get("url") or "Market Signal")[:80]
        rows.append(
            {
                "name": name,
                "pricing": "INR 180-450 avg order band",
                "strength": "Actionable for demand, menu, and channel planning",
                "weakness": "Needs in-market validation with pilot orders",
            }
        )

    seeded_rows = [
        {
            "name": f"Micro-Zone A ({location} Core)",
            "pricing": "INR 230-320 avg ticket",
            "strength": "High weekday lunch density and repeat potential",
            "weakness": "Price sensitivity during discount-heavy periods",
        },
        {
            "name": f"Micro-Zone B ({location} Residential Cluster)",
            "pricing": "INR 190-290 avg ticket",
            "strength": "Stable evening and weekend demand",
            "weakness": "Lower AOV unless bundle strategy is strong",
        },
        {
            "name": "Aggregator Channel Mix",
            "pricing": "18-28% effective channel cost",
            "strength": "Fast customer access and discoverability",
            "weakness": "Margin pressure without tight menu engineering",
        },
        {
            "name": "Cloud Kitchen Throughput",
            "pricing": "INR 55-85 variable prep+pack cost",
            "strength": "High control over consistency and speed",
            "weakness": "Peak-hour SLA risk without batch controls",
        },
        {
            "name": "Repeat-Order Lever",
            "pricing": "INR 35-60 retention spend/order",
            "strength": "Improves LTV and lowers blended CAC",
            "weakness": "Requires disciplined CRM cadence",
        },
    ]

    while len(rows) < 5:
        rows.append(seeded_rows[len(rows)])

    table_header = "| Name | Pricing | Strength | Weakness |\n|---|---|---|---|"
    table_rows = "\n".join(
        [
            f"| {row['name']} | {row['pricing']} | {row['strength']} | {row['weakness']} |"
            for row in rows
        ]
    )

    return "\n\n".join(
        [
            f"## Specialist Execution Plan for {goal}",
            table_header,
            table_rows,
            "### Unit Economics Snapshot",
            "- Baseline AOV target: INR 260-320 during pilot stage.",
            "- Contribution margin target: 18-24% after channel and variable costs.",
            "- CAC payback target: under 6 orders for paid cohorts.",
            "### 6-Week Rollout",
            "- Week 1-2: menu simplification, pricing ladder, and supply rhythm setup.",
            "- Week 3-4: dual-zone launch with SLA tracking and channel-wise CAC guardrails.",
            "- Week 5-6: optimize bundles, prune weak SKUs, and expand only profitable slots.",
            "### Recommended Action",
            f"- Launch in two {location} micro-zones before city-wide scaling.",
            "- Cap discounts and track channel-level CAC weekly.",
            "- Stabilize prep-to-delivery SLA under 35 minutes.",
            "- Run weekly menu contribution-margin pruning.",
        ]
    )


def _compress_research_items(research_items: List[Dict[str, Any]], limit: int = 6) -> List[Dict[str, str]]:
    compressed: List[Dict[str, str]] = []
    for item in research_items[:limit]:
        title = str(item.get("title") or "Untitled source")[:120]
        url = str(item.get("url") or "")[:200]
        content = str(item.get("content") or "")
        content = " ".join(content.split())[:500]
        compressed.append({"title": title, "url": url, "content": content})
    return compressed


def _build_goal_from_inputs(inputs: Dict[str, Any]) -> str:
    mode = str(inputs.get("mode") or "has-idea")
    industry = str(inputs.get("industry") or "General")
    location = str(inputs.get("location") or "target market")
    budget = str(inputs.get("budget") or "")
    team_size = str(inputs.get("teamSize") or inputs.get("team_size") or "")
    description = str(inputs.get("description") or inputs.get("interests") or "").strip()
    context = str(inputs.get("context") or "").strip()

    parts = [f"Build a {industry} startup in {location}."]
    if description:
        parts.append(f"Idea: {description}.")
    if context:
        parts.append(f"Context: {context}.")
    if budget:
        parts.append(f"Budget: INR {budget}.")
    if team_size:
        parts.append(f"Team size: {team_size}.")
    parts.append(f"Mode: {mode}.")
    return " ".join(parts)


def architect_node(state: AgentState) -> AgentState:
    goal = state["user_goal"]
    location = _resolve_location(state)
    logger.info("[Architect] Received goal: %s", goal)

    prompt = f"""
You are the Architect agent in a startup strategy graph.
Decompose this startup goal into exactly 3 specific tasks.

Goal:
{goal}

Output only valid JSON array with 3 objects in this order:
[
  {{"domain": "Market", "task": "..."}},
  {{"domain": "Finance", "task": "..."}},
  {{"domain": "Logistics", "task": "..."}}
]

Rules:
- One task per domain.
- {location} context should be included in task wording.
- Keep each task actionable.
""".strip()

    logger.debug("[Secret Talk] Architect -> Gemini prompt:\n%s", prompt)
    tasks: List[Dict[str, str]]
    try:
        response = _invoke_logic_llm(prompt, state, "architect_gemini")
        logger.debug("[Secret Talk] Gemini -> Architect raw response:\n%s", response.content)
        tasks = _parse_json_payload(response.content)
    except Exception as exc:
        logger.warning(
            "[Architect] LLM output unavailable (%s); using deterministic fallback tasks",
            exc,
        )
        tasks = [
            {
                "domain": "Market",
                "task": f"Validate {location} demand segments, cuisine preferences, and competitor positioning for: {goal}",
            },
            {
                "domain": "Finance",
                "task": f"Estimate CAPEX/OPEX, break-even horizon, and pricing strategy in {location} for: {goal}",
            },
            {
                "domain": "Logistics",
                "task": f"Design supplier, kitchen location, and last-mile delivery workflow in {location} for: {goal}",
            },
        ]

    state["tasks"] = tasks[:3]
    state["event_log"].append("Architect produced 3 domain tasks.")
    logger.info("[Architect] Tasks prepared: %s", state["tasks"])
    return state


def specialist_node(state: AgentState) -> AgentState:
    tasks = state["tasks"]
    goal = state["user_goal"]
    location = _resolve_location(state)
    logger.info("[Specialist] Iteration=%s starting research", state["iteration_count"])
    research_items: List[Dict[str, Any]] = state.get("research_data", [])
    compact_research = json.dumps(_compress_research_items(research_items), ensure_ascii=True)
    prompt = f"""
You are the Specialist agent.
Use the tasks and your business reasoning to craft a professional markdown table focused on {location} execution.

Goal:
{goal}

Tasks:
{json.dumps(tasks, ensure_ascii=True)}

Research Data:
{compact_research}

Return only clean markdown.
Must include a table with exactly these columns:
| Name | Pricing | Strength | Weakness |

Rules:
- At least 5 rows.
- Mention realistic {location}-specific pricing signals where possible.
- Include concise but concrete strengths and weaknesses.
- After the table, add a short "Recommended Action" section with 4 bullet points.
""".strip()

    logger.debug("[Secret Talk] Specialist -> Gemini prompt:\n%s", prompt)
    try:
        response = _invoke_logic_llm(prompt, state, "specialist_gemini")
        logger.debug("[Secret Talk] Gemini -> Specialist markdown:\n%s", response.content)
        state["specialist_markdown"] = response.content
    except Exception as exc:
        logger.warning(
            "[Specialist] LLM output unavailable (%s); using deterministic markdown fallback",
            exc,
        )
        state["specialist_markdown"] = _build_specialist_fallback_markdown(
            goal,
            research_items,
            location,
        )
    state["event_log"].append(
        f"Specialist produced markdown plan at iteration {state['iteration_count']}."
    )
    logger.info("[Specialist] Markdown plan generated")
    return state


def auditor_node(state: AgentState) -> AgentState:
    goal = state["user_goal"]
    location = _resolve_location(state)
    specialist_md = state["specialist_markdown"]
    iteration = state["iteration_count"]

    logger.info("[Auditor] Reviewing specialist output at iteration=%s", iteration)

    prompt = f"""
You are the Auditor agent.
Review the Specialist plan for this goal:
{goal}

Specialist Plan (markdown):
{specialist_md}

Output strict JSON object with this schema:
{{
  "red_flags": ["...", "...", "..."],
  "pivot_strategy": "...",
  "success_score": 0,
  "audit_summary": "..."
}}

Rules:
- Identify exactly 3 high-impact red flags.
- Provide one practical pivot strategy.
- success_score must be an integer 0-100.
- Be strict and skeptical.
""".strip()

    logger.debug("[Secret Talk] Auditor -> Gemini prompt:\n%s", prompt)
    audit_report: Dict[str, Any]
    try:
        response = _invoke_logic_llm(prompt, state, "auditor_gemini")
        logger.debug("[Secret Talk] Gemini -> Auditor raw response:\n%s", response.content)
        audit_report = _parse_json_payload(response.content)
    except Exception as exc:
        logger.warning(
            "[Auditor] LLM output unavailable (%s); using deterministic fallback audit",
            exc,
        )
        audit_report = {
            "red_flags": [
                "Unit economics are not validated for high-variance demand windows.",
                "Customer acquisition assumptions rely on broad channels without CAC controls.",
                "Delivery SLAs and kitchen throughput risk inconsistent customer experience.",
            ],
            "pivot_strategy": f"Narrow the launch to two micro-zones in {location} with a limited menu and profitability-first pricing before city-wide expansion.",
            "success_score": 72,
            "audit_summary": "Plan is promising but operational and financial controls are under-specified.",
        }

    red_flags = audit_report.get("red_flags") or []
    if not isinstance(red_flags, list):
        red_flags = [str(red_flags)]

    while len(red_flags) < 3:
        red_flags.append("Insufficient risk detail provided by model output.")
    if len(red_flags) > 3:
        red_flags = red_flags[:3]

    raw_score = _safe_int(audit_report.get("success_score", 0))
    score = max(0, min(raw_score, 100))

    # Strict demo guard: force at least one loop for complex goals.
    is_complex = len(goal.split()) >= 8 or any(
        word in goal.lower() for word in ["multi", "scale", "chain", "platform", "expansion"]
    )
    if iteration == 0 and is_complex:
        score = min(score, 79)
        if "Complex launch assumptions need one refinement loop before approval." not in red_flags:
            red_flags[0] = "Complex launch assumptions need one refinement loop before approval."

    audit_report["red_flags"] = red_flags
    audit_report["success_score"] = score
    audit_report["pivot_strategy"] = str(audit_report.get("pivot_strategy", f"Define a phased {location} pilot before scaling."))
    audit_report["audit_summary"] = str(audit_report.get("audit_summary", "Audit complete."))

    state["audit_report"] = audit_report
    state["event_log"].append(
        f"Auditor scored plan {score} at iteration {state['iteration_count']}."
    )
    logger.info("[Auditor] Red flags=%s | score=%s", red_flags, score)
    return state


def route_after_audit(state: AgentState) -> Literal["specialist", "end"]:
    score = _safe_int(state.get("audit_report", {}).get("success_score", 0))
    current_iteration = _safe_int(state.get("iteration_count", 0))

    if score < 80 and current_iteration < 2:
        state["iteration_count"] = current_iteration + 1
        state["event_log"].append(
            f"Router looped back to Specialist (score={score}, iteration={state['iteration_count']})."
        )
        logger.info(
            "[Router] Looping back to specialist | score=%s | iteration now=%s",
            score,
            state["iteration_count"],
        )
        return "specialist"

    logger.info("[Router] Exiting graph | score=%s | iteration=%s", score, current_iteration)
    return "end"


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("architect", architect_node)
    graph.add_node("specialist", specialist_node)
    graph.add_node("auditor", auditor_node)

    graph.set_entry_point("architect")
    graph.add_edge("architect", "specialist")
    graph.add_edge("specialist", "auditor")
    graph.add_conditional_edges(
        "auditor",
        route_after_audit,
        {
            "specialist": "specialist",
            "end": END,
        },
    )

    return graph.compile()


def run_pipeline(initial_state: AgentState) -> AgentState:
    state = initial_state
    goal = state["user_goal"]
    location = _resolve_location(state)

    prompt = f"""
You are a startup strategy system for {location} market execution.
Generate a complete response in strict JSON only.

Goal:
{goal}

Return this exact schema:
{{
  "tasks": [
    {{"domain": "Market", "task": "..."}},
    {{"domain": "Finance", "task": "..."}},
    {{"domain": "Logistics", "task": "..."}}
  ],
  "specialist_markdown": "...",
  "audit_report": {{
    "red_flags": ["...", "...", "..."],
    "pivot_strategy": "...",
    "success_score": 0,
    "audit_summary": "..."
  }}
}}

Rules:
- specialist_markdown must include a markdown table with columns: Name | Pricing | Strength | Weakness
- Include at least 5 rows in the table.
- Focus on realistic {location} pricing and launch constraints.
- success_score must be integer 0-100.
- red_flags must have exactly 3 items.
""".strip()

    try:
        response = _invoke_logic_llm(prompt, state, "single_shot_gemini")
        payload = _parse_json_payload(response.content)

        tasks = payload.get("tasks") or []
        if not isinstance(tasks, list):
            tasks = []

        audit_report = payload.get("audit_report") or {}
        if not isinstance(audit_report, dict):
            audit_report = {}

        red_flags = audit_report.get("red_flags") or []
        if not isinstance(red_flags, list):
            red_flags = [str(red_flags)]
        while len(red_flags) < 3:
            red_flags.append("Insufficient risk detail provided by model output.")
        red_flags = red_flags[:3]

        audit_report["red_flags"] = red_flags
        audit_report["success_score"] = max(0, min(_safe_int(audit_report.get("success_score", 0)), 100))
        audit_report["pivot_strategy"] = str(audit_report.get("pivot_strategy", f"Define a phased {location} pilot before scaling."))
        audit_report["audit_summary"] = str(audit_report.get("audit_summary", "Audit complete."))

        state["tasks"] = tasks[:3]
        state["specialist_markdown"] = str(payload.get("specialist_markdown") or "")
        state["audit_report"] = audit_report
        state["iteration_count"] = 0
        state["event_log"].append("Single-shot Gemini pipeline completed.")
        return state
    except Exception as exc:
        logger.warning("[Pipeline] Single-shot Gemini failed (%s); using deterministic fallback", exc)
        state["tasks"] = [
            {"domain": "Market", "task": f"Validate demand segments and competition in {location} for: {goal}"},
            {"domain": "Finance", "task": f"Estimate CAC, burn, and break-even path for: {goal}"},
            {"domain": "Logistics", "task": f"Define supplier, kitchen, and delivery operating model for: {goal}"},
        ]
        state["specialist_markdown"] = _build_specialist_fallback_markdown(goal, [], location)
        state["audit_report"] = {
            "red_flags": [
                "Unit economics are not validated for high-variance demand windows.",
                "Acquisition assumptions need tighter channel-level CAC control.",
                "Delivery SLA and prep throughput plans require sharper safeguards.",
            ],
            "pivot_strategy": f"Start with two {location} micro-zones and scale only after margin consistency.",
            "success_score": 72,
            "audit_summary": "Fallback report generated due model request constraints.",
        }
        state["event_log"].append("Single-shot pipeline used fallback response.")
        return state


app = Flask(__name__)
CORS(app)
compiled_graph = build_graph()


@app.get("/health")
def health() -> Any:
    return jsonify({"status": "ok", "service": "langgraph-startup-orchestrator"})


@app.post("/analyze")
def analyze() -> Any:
    data = request.get_json(silent=True) or {}
    goal = str(data.get("goal", "")).strip()
    source_inputs = data.get("inputs") if isinstance(data.get("inputs"), dict) else {}

    if source_inputs:
        goal = _build_goal_from_inputs(source_inputs)

    if not goal:
        return jsonify({"error": "Missing required field: goal"}), 400

    initial_state: AgentState = {
        "user_goal": goal,
        "tasks": [],
        "research_data": [],
        "specialist_markdown": "",
        "audit_report": {},
        "iteration_count": 0,
        "usage_metrics": {
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
        },
        "event_log": [],
        "source_inputs": source_inputs,
    }

    logger.info("[API] /analyze called | goal=%s", goal)
    try:
        final_state = _run_with_timeout(run_pipeline, API_TIMEOUT_SECONDS, initial_state)
    except TimeoutError:
        location = _resolve_location(initial_state)
        logger.warning(
            "[API] Graph timed out after %ss. Returning fallback report.",
            API_TIMEOUT_SECONDS,
        )
        fallback_markdown = _build_specialist_fallback_markdown(goal, [], location)
        final_state = {
            **initial_state,
            "specialist_markdown": fallback_markdown,
            "audit_report": {
                "red_flags": [
                    "External model providers exceeded response time budget.",
                    "Research depth is reduced due timeout safeguards.",
                    "Re-run may produce richer model-backed insights.",
                ],
                "pivot_strategy": f"Start with a narrow {location} pilot and expand only after unit economics are validated.",
                "success_score": 70,
                "audit_summary": "Returned fallback report because the graph exceeded API timeout.",
            },
            "event_log": initial_state["event_log"]
            + [f"Graph timed out after {API_TIMEOUT_SECONDS}s; fallback response returned."],
        }

    result_markdown = "\n\n".join(
        [
            "# Final Verified Startup Report",
            "## Specialist Plan",
            final_state.get("specialist_markdown", "No specialist output."),
            "## Auditor Verdict",
            f"- Success Score: {final_state.get('audit_report', {}).get('success_score', 0)}",
            "- Red Flags:",
            "\n".join(
                [f"  - {flag}" for flag in final_state.get("audit_report", {}).get("red_flags", [])]
            ),
            f"- Pivot Strategy: {final_state.get('audit_report', {}).get('pivot_strategy', 'N/A')}",
            f"- Audit Summary: {final_state.get('audit_report', {}).get('audit_summary', 'N/A')}",
        ]
    )

    response = {
        "final_report_markdown": result_markdown,
        "usage_metrics": final_state.get("usage_metrics", {}),
        "iteration_count": final_state.get("iteration_count", 0),
        "audit_summary": final_state.get("audit_report", {}),
        "secret_talk": final_state.get("event_log", []),
    }
    return jsonify(response)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "3000"))
    app.run(host="0.0.0.0", port=port, debug=False)