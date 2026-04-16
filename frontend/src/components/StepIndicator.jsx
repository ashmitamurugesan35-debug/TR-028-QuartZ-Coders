import { Check } from 'lucide-react'

const LABELS = ['Choose Mode', 'Select Type', 'Enter Details']

export default function StepIndicator({ current = 1, total = 3 }) {
  return (
    <div className="mt-8 w-full max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1
          const isDone = step < current
          const isActive = step === current

          return (
            <div key={step} className="flex-1">
              <div className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm font-semibold transition-all ${
                    isDone || isActive
                      ? 'bg-brand-cyan border-brand-cyan text-white'
                      : 'border-brand-muted text-brand-muted bg-transparent'
                  }`}
                >
                  {isDone ? <Check size={16} /> : step}
                </div>
                {index < total - 1 ? (
                  <div className="flex-1 h-px bg-brand-border mx-2 sm:mx-3" />
                ) : null}
              </div>
              <p
                className={`mt-3 text-xs sm:text-sm ${
                  isDone || isActive ? 'text-brand-text' : 'text-brand-muted'
                }`}
              >
                {LABELS[index]}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
