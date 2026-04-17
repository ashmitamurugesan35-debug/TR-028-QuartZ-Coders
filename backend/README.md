# Backend

This folder now includes a Python LangGraph service for startup analysis.

## New AI Orchestrator API

- Endpoint: `POST /analyze`
- Runtime: Flask + LangGraph
- LLMs:
	- Architect + Auditor: Google Gemini (`gemini-1.5-flash`)
	- Specialist formatter: Groq (`llama-3.1-70b-versatile`)
- Search tool: Tavily (`TavilySearchResults`)

### 1) Create env file

Use `.env` in this folder with:

```env
GROQ_API_KEY=...
TAVILY_API_KEY=...
GOOGLE_API_KEY=...
LOGIC_FALLBACK_MODEL=gemini-2.0-flash
PORT=3000
LOG_LEVEL=DEBUG
```

### 2) Install dependencies

```bash
pip install -r requirements.txt
```

### 3) Run server

```bash
python app.py
```

### 4) Test endpoint

```bash
curl -X POST http://localhost:3000/analyze \
	-H "Content-Type: application/json" \
	-d '{"goal":"Launch a premium cloud kitchen startup in Chennai"}'
```

The response includes:

- `final_report_markdown`
- `usage_metrics`
- `iteration_count`
- `audit_summary`

## Legacy Node Stub

The original Express stub remains in `src/index.js` and can still be used independently.
