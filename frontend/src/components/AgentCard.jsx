import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const COLOR_MAP = {
  cyan: 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan',
  blue: 'bg-blue-500/20 border-blue-400 text-blue-400',
  green: 'bg-brand-green/20 border-brand-green text-brand-green',
  rose: 'bg-brand-rose/20 border-brand-rose text-brand-rose',
  violet: 'bg-brand-violet/20 border-brand-violet text-brand-violet',
}

const STATUS_STYLES = {
  standby: 'bg-brand-border/40 text-brand-muted',
  activating: 'bg-brand-amber/20 text-brand-amber',
  active: 'bg-brand-green/20 text-brand-green',
  done: 'bg-brand-cyan/20 text-brand-cyan',
}

const STATUS_TEXT = {
  standby: 'Standby',
  activating: 'Activating',
  active: 'Active',
  done: 'Done',
}

export default function AgentCard({ agent, status = 'standby', delay = 0 }) {
  const Icon = agent.icon
  const colorClass = COLOR_MAP[agent.color] || COLOR_MAP.cyan
  const borderClass = status === 'active' || status === 'done' ? 'border-brand-cyan/50' : 'border-brand-border'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass rounded-2xl p-6 border ${borderClass} transition-all duration-300`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`w-14 h-14 rounded-xl border flex items-center justify-center ${colorClass}`}>
          <Icon size={28} />
        </div>
        <div className={`px-3 py-1 rounded-full text-xs inline-flex items-center gap-2 ${STATUS_STYLES[status]}`}>
          <AnimatePresence mode="wait">
            {status === 'activating' ? (
              <motion.span
                key="pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-2 h-2 rounded-full bg-brand-amber pulse-dot"
              />
            ) : null}
            {status === 'active' ? (
              <motion.span
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-2 h-2 rounded-full bg-brand-green"
              />
            ) : null}
            {status === 'done' ? (
              <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CheckCircle2 size={14} />
              </motion.span>
            ) : null}
          </AnimatePresence>
          {STATUS_TEXT[status]}
        </div>
      </div>

      <h3 className="mt-5 text-lg font-heading font-bold text-brand-text">{agent.name}</h3>
      <p className="text-sm text-brand-muted mt-1">{agent.role}</p>

      <div className="mt-6 h-1 rounded-full bg-brand-border overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-cyan to-brand-violet transition-all duration-[1200ms] ease-out"
          style={{ width: status === 'standby' ? '0%' : '100%' }}
        />
      </div>
    </motion.div>
  )
}
