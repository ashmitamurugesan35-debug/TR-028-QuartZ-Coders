import { motion, AnimatePresence } from 'framer-motion'

const COLOR_MAP = {
  cyan: {
    icon: 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan',
    text: 'text-brand-cyan',
    border: 'border-brand-cyan',
  },
  blue: {
    icon: 'bg-blue-500/20 border-blue-400 text-blue-400',
    text: 'text-blue-400',
    border: 'border-blue-400',
  },
  green: {
    icon: 'bg-brand-green/20 border-brand-green text-brand-green',
    text: 'text-brand-green',
    border: 'border-brand-green',
  },
  rose: {
    icon: 'bg-brand-rose/20 border-brand-rose text-brand-rose',
    text: 'text-brand-rose',
    border: 'border-brand-rose',
  },
  violet: {
    icon: 'bg-brand-violet/20 border-brand-violet text-brand-violet',
    text: 'text-brand-violet',
    border: 'border-brand-violet',
  },
}

export default function AgentChat({ messages = [], visibleCount = 0 }) {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <AnimatePresence>
        {messages.slice(0, visibleCount).map((message, index) => {
          const Icon = message.icon
          const tone = COLOR_MAP[message.agentColor] || COLOR_MAP.cyan

          return (
            <motion.div
              key={`${message.agentId}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="flex gap-3"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${tone.icon}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${tone.text}`}>{message.agentName}</p>
                  <p className="text-xs text-brand-muted ml-auto">{message.time}</p>
                </div>
                <div className={`mt-1 p-4 rounded-2xl rounded-tl-none glass border-l-4 ${tone.border}`}>
                  <p className="text-sm text-brand-text leading-relaxed">{message.text}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
