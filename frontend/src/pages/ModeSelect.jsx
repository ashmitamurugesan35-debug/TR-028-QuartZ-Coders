import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  Lock,
  Rocket,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StepIndicator from '../components/StepIndicator'

export default function ModeSelect() {
  const navigate = useNavigate()

  const startupFeatures = [
    'AI-powered market research',
    'Smart budget allocation',
    'Full launch strategy',
  ]

  const enterpriseFeatures = [
    'Operational optimization insights',
    'Workflow automation opportunities',
    'Org-level strategic guidance',
  ]

  return (
    <main className="min-h-screen py-12 px-4 max-w-5xl mx-auto">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-cyan transition-colors"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <StepIndicator current={1} total={3} />

      <div className="text-center mt-8">
        <h1 className="text-4xl font-heading font-bold">Choose Your Mode</h1>
        <p className="text-brand-muted mt-2">Select how you want to work with LaunchMind AI</p>
      </div>

      <AnimatePresence>
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.35 }}
            onClick={() => navigate('/idea')}
            className="gradient-border rounded-2xl p-8 cursor-pointer hover:glow-cyan transition-all"
          >
            <div className="flex justify-end">
              <span className="bg-brand-green/20 text-brand-green text-xs px-3 py-1 rounded-full">Available</span>
            </div>
            <Rocket size={48} className="text-brand-cyan mb-4" />
            <h2 className="text-2xl font-heading font-bold">Startup Mode</h2>
            <p className="text-brand-muted mt-2">
              Ideal for founders, students, and builders with a new venture idea.
            </p>
            <ul className="mt-4 space-y-2">
              {startupFeatures.map((feature) => (
                <li key={feature} className="inline-flex items-center gap-2 text-sm text-brand-text w-full">
                  <CheckCircle2 size={16} className="text-brand-green" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative glass rounded-2xl p-8 opacity-60 cursor-not-allowed"
          >
            <div className="absolute top-4 right-4">
              <Lock size={16} className="text-brand-muted" />
            </div>
            <div className="flex justify-end">
              <span className="bg-brand-amber/20 text-brand-amber text-xs px-3 py-1 rounded-full">Coming Soon</span>
            </div>
            <Building2 size={48} className="text-brand-muted mb-4" />
            <h2 className="text-2xl font-heading font-bold text-brand-muted">Enterprise Mode</h2>
            <p className="text-brand-muted mt-2">
              For scaling companies optimizing internal operations and processes.
            </p>
            <ul className="mt-4 space-y-2">
              {enterpriseFeatures.map((feature) => (
                <li key={feature} className="inline-flex items-center gap-2 text-sm text-brand-muted w-full">
                  <CheckCircle2 size={16} className="text-brand-muted" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
