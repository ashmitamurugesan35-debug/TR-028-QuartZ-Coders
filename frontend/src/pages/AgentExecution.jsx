import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  DollarSign,
  Lightbulb,
  Loader2,
  ShieldAlert,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AgentCard from '../components/AgentCard'
import AgentChat from '../components/AgentChat'
import OutputPanel from '../components/OutputPanel'

const AGENTS = [
  { id: 'idea', name: 'Idea Agent', role: 'Conceptualization', icon: Lightbulb, color: 'cyan' },
  { id: 'market', name: 'Market Agent', role: 'Market Analysis', icon: TrendingUp, color: 'blue' },
  { id: 'finance', name: 'Finance Agent', role: 'Budget Planning', icon: DollarSign, color: 'green' },
  { id: 'risk', name: 'Risk Agent', role: 'Risk Evaluation', icon: ShieldAlert, color: 'rose' },
  { id: 'strategy', name: 'Strategy Agent', role: 'Go-to-Market', icon: Target, color: 'violet' },
]

const INIT_LINES = [
  { icon: '⚙', text: 'Receiving input parameters...', color: 'muted' },
  { icon: '⚙', text: 'Validating startup context...', color: 'muted' },
  { icon: '⚙', text: 'Calibrating agent specializations...', color: 'muted' },
  { icon: '⚙', text: 'Assembling collaborative AI team...', color: 'muted' },
  { icon: '✓', text: 'Team ready. Initiating analysis...', color: 'cyan' },
]

const buildTime = (step) => `00:${String(12 + step).padStart(2, '0')}`

export default function AgentExecution() {
  const navigate = useNavigate()
  const { state: formState = {} } = useLocation()

  const { industry = 'General', location = 'your market', description = '', budget = '50,000', teamSize = 3 } = formState

  const [phase, setPhase] = useState('init')
  const [revealedInitCount, setRevealedInitCount] = useState(0)
  const [agentStatuses, setAgentStatuses] = useState(() =>
    AGENTS.reduce((acc, agent) => ({ ...acc, [agent.id]: 'standby' }), {}),
  )
  const [visibleMessages, setVisibleMessages] = useState(0)
  const [showOutput, setShowOutput] = useState(false)
  const [showCompiling, setShowCompiling] = useState(false)
  const outputRef = useRef(null)

  const messages = useMemo(
    () => [
      {
        agentId: 'idea',
        agentName: 'Idea Agent',
        agentColor: 'cyan',
        icon: Lightbulb,
        text: `Core concept identified: ${industry} startup in ${location}. MVP scope defined around ${description?.slice(0, 60) || 'the target problem'}. Concept viability: High. Proceeding with full analysis.`,
        time: buildTime(1),
      },
      {
        agentId: 'market',
        agentName: 'Market Agent',
        agentColor: 'blue',
        icon: TrendingUp,
        text: `Market scan complete for ${industry} sector. Demand index: Strong. Primary audience segment identified and mapped. Competition density: Moderate. Window of opportunity: Open.`,
        time: buildTime(2),
      },
      {
        agentId: 'finance',
        agentName: 'Finance Agent',
        agentColor: 'green',
        icon: DollarSign,
        text: `Budget of ₹${budget || '50,000'} analyzed. Recommended allocation ready: Product 40% · Marketing 25% · Operations 20% · Reserve 15%. Team of ${teamSize || 3} can execute Phase 1 within budget.`,
        time: buildTime(3),
      },
      {
        agentId: 'risk',
        agentName: 'Risk Agent',
        agentColor: 'rose',
        icon: ShieldAlert,
        text: 'Risk assessment complete. Entry barrier: Low. Regulatory exposure: Minimal. Market timing: Favorable. Competition risk: Moderate. Overall risk level: Medium. Mitigation playbook prepared.',
        time: buildTime(4),
      },
      {
        agentId: 'strategy',
        agentName: 'Strategy Agent',
        agentColor: 'violet',
        icon: Target,
        text: 'Go-to-market strategy drafted. Phase 1: Validate with 10 early users (Month 1-2). Phase 2: Build MVP (Month 3-5). Phase 3: Scale with paid channels (Month 6+). Execution plan ready.',
        time: buildTime(5),
      },
    ],
    [industry, location, description, budget, teamSize],
  )

  useEffect(() => {
    const timers = []

    for (let i = 0; i < INIT_LINES.length; i += 1) {
      timers.push(
        setTimeout(() => {
          setRevealedInitCount(i + 1)
        }, i * 600),
      )
    }

    timers.push(
      setTimeout(() => {
        setPhase('activation')
        setAgentStatuses(AGENTS.reduce((acc, agent) => ({ ...acc, [agent.id]: 'standby' }), {}))
      }, 3200),
    )

    AGENTS.forEach((agent, index) => {
      const activationAt = 3400 + index * 800
      timers.push(
        setTimeout(() => {
          setAgentStatuses((prev) => ({ ...prev, [agent.id]: 'activating' }))
        }, activationAt),
      )
      timers.push(
        setTimeout(() => {
          setAgentStatuses((prev) => ({ ...prev, [agent.id]: 'active' }))
        }, activationAt + 200),
      )
    })

    timers.push(
      setTimeout(() => {
        setPhase('conversation')
      }, 7600),
    )

    for (let i = 0; i < 5; i += 1) {
      timers.push(
        setTimeout(() => {
          setVisibleMessages(i + 1)
          if (i === 4) {
            setAgentStatuses((prev) =>
              AGENTS.reduce((acc, agent) => ({ ...acc, [agent.id]: 'done' }), { ...prev }),
            )
          }
        }, 8000 + i * 1200),
      )
    }

    timers.push(
      setTimeout(() => {
        setShowCompiling(true)
      }, 13500),
    )

    timers.push(
      setTimeout(() => {
        setShowCompiling(false)
        setShowOutput(true)
        setPhase('output')
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 14500),
    )

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  return (
    <main className="min-h-screen py-12 px-4 max-w-3xl mx-auto">
      {phase === 'init' ? (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-cyan transition-colors"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      ) : null}

      {phase === 'init' ? (
        <div className="glass rounded-2xl p-6 font-mono text-sm space-y-2 max-w-xl mx-auto mt-16">
          {INIT_LINES.slice(0, revealedInitCount).map((line, index) => {
            const highlighted = index === INIT_LINES.length - 1
            return (
              <motion.div
                key={line.text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <span className={highlighted ? 'text-brand-cyan' : 'text-brand-muted'}>{line.icon}</span>
                <span className={highlighted ? 'text-brand-cyan' : 'text-brand-muted'}>{line.text}</span>
              </motion.div>
            )
          })}
          {revealedInitCount === INIT_LINES.length ? (
            <span className="w-2 h-4 bg-brand-cyan rounded inline-block animate-pulse" />
          ) : null}
        </div>
      ) : null}

      {phase === 'activation' || phase === 'conversation' || phase === 'output' ? (
        <div className="mt-8">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">Assembling Your AI Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {AGENTS.slice(0, 4).map((agent, index) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                status={agentStatuses[agent.id] || 'standby'}
                delay={index * 0.08}
              />
            ))}
          </div>
          <div className="mt-4 sm:w-1/2 md:w-1/3 mx-auto">
            <AgentCard
              agent={AGENTS[4]}
              status={agentStatuses[AGENTS[4].id] || 'standby'}
              delay={0.4}
            />
          </div>
        </div>
      ) : null}

      {phase === 'conversation' || phase === 'output' ? (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading font-semibold">Agent Analysis Feed</h3>
            {visibleMessages < 5 ? <Loader2 size={18} className="text-brand-cyan animate-spin" /> : null}
          </div>
          <AgentChat messages={messages} visibleCount={visibleMessages} />
        </div>
      ) : null}

      <AnimatePresence>
        {showCompiling ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-bg/80 backdrop-blur flex flex-col items-center justify-center z-50"
          >
            <div className="w-12 h-12 rounded-full border-2 border-brand-border border-t-brand-cyan animate-spin" />
            <p className="text-brand-muted mt-4">Compiling final report...</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showOutput ? (
        <div ref={outputRef}>
          <OutputPanel data={{ ...formState }} />
        </div>
      ) : null}
    </main>
  )
}
