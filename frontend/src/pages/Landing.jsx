import { motion, AnimatePresence } from 'framer-motion'
import { Activity, FileText, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Starfield from '../components/Starfield'

const container = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.12,
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Landing() {
  const navigate = useNavigate()

  const handleHow = () => {
    const el = document.getElementById('how')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden py-12 px-4">
      <Starfield />

      <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-cyan-400 blur-[120px] opacity-15 z-0" />
      <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-violet-500 blur-[120px] opacity-15 z-0" />
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(30,45,107,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,107,0.2) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <AnimatePresence>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 min-h-[72vh] flex flex-col items-center justify-center text-center"
        >
          <motion.div variants={item} className="glass rounded-full px-4 py-2 inline-flex items-center gap-2">
            <span className="pulse-dot w-2 h-2 rounded-full bg-brand-cyan" />
            <span className="text-brand-cyan text-sm font-medium">✦ Multi-Agent AI Platform</span>
          </motion.div>

          <motion.div variants={item}>
            <h1 className="font-heading text-5xl sm:text-7xl font-extrabold leading-tight mt-6">
              <span className="text-brand-text">Build Smarter.</span>
              <br />
              <span className="gradient-text">Launch Faster.</span>
            </h1>
          </motion.div>

          <motion.div variants={item}>
            <p className="text-lg text-brand-muted max-w-lg text-center mt-4 leading-relaxed">
              Five specialized AI agents collaborate in real-time to plan, validate, and launch your startup idea.
            </p>
          </motion.div>

          <motion.div variants={item} className="mt-8 flex gap-4 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => navigate('/mode')}
              className="bg-brand-cyan text-brand-bg font-semibold px-8 py-3 rounded-full hover:scale-105 glow-cyan transition-all"
            >
              Get Started →
            </button>
            <button
              type="button"
              onClick={handleHow}
              className="border border-brand-cyan text-brand-cyan px-8 py-3 rounded-full hover:bg-brand-cyan/10 transition-all"
            >
              See How It Works
            </button>
          </motion.div>

          <motion.div variants={item} className="mt-12 flex gap-4 sm:gap-8 text-sm text-brand-muted items-center flex-wrap justify-center">
            <div className="inline-flex items-center gap-2">
              <Zap size={16} className="text-brand-cyan" />
              <span>5 AI Agents</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-brand-muted" />
            <div className="inline-flex items-center gap-2">
              <Activity size={16} className="text-brand-cyan" />
              <span>Real-time Analysis</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-brand-muted" />
            <div className="inline-flex items-center gap-2">
              <FileText size={16} className="text-brand-cyan" />
              <span>Instant Report</span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <section id="how" className="relative z-10 max-w-4xl mx-auto mt-12 mb-8 px-2">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold">How LaunchMind AI Works</h2>
          <p className="text-brand-muted mt-3 leading-relaxed">
            Idea, market, finance, risk, and strategy agents work in sequence and cross-check each other to produce a practical launch roadmap in minutes.
          </p>
        </div>
      </section>
    </main>
  )
}
