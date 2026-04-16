import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Compass, Lightbulb } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StepIndicator from '../components/StepIndicator'

export default function IdeaSelect() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen py-12 px-4 max-w-5xl mx-auto">
      <button
        type="button"
        onClick={() => navigate('/mode')}
        className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-cyan transition-colors"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <StepIndicator current={1} total={3} />

      <div className="text-center mt-8">
        <h1 className="text-4xl font-heading font-bold">How do you want to begin?</h1>
        <p className="text-brand-muted mt-2">Choose your starting point - AI adapts to both</p>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-10">
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="gradient-border rounded-2xl p-10 cursor-pointer hover:glow-cyan"
            onClick={() => navigate('/form', { state: { mode: 'has-idea' } })}
          >
            <div className="bg-gradient-to-br from-brand-cyan/20 to-brand-violet/20 rounded-2xl p-4 inline-block">
              <Lightbulb size={64} className="text-brand-cyan" />
            </div>
            <h2 className="text-2xl font-heading font-bold mt-4">I Have an Idea</h2>
            <p className="text-brand-muted mt-2">
              You've got a concept. Let AI validate, analyze, and build the full plan.
            </p>
            <span className="inline-flex mt-6 text-xs bg-brand-cyan/10 text-brand-cyan px-3 py-1 rounded-full">
              Recommended
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-10 cursor-pointer hover:gradient-border hover:glow-violet"
            onClick={() => navigate('/form', { state: { mode: 'need-idea' } })}
          >
            <div className="bg-gradient-to-br from-brand-violet/20 to-brand-rose/20 rounded-2xl p-4 inline-block">
              <Compass size={64} className="text-brand-violet" />
            </div>
            <h2 className="text-2xl font-heading font-bold mt-4">I Need an Idea</h2>
            <p className="text-brand-muted mt-2">
              Tell us your interests and budget - AI will discover the right opportunity for you.
            </p>
            <span className="inline-flex mt-6 text-xs bg-brand-violet/10 text-brand-violet px-3 py-1 rounded-full">
              Exploratory
            </span>
          </motion.div>
        </div>
      </AnimatePresence>
    </main>
  )
}
