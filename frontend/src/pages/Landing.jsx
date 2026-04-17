import { motion, AnimatePresence } from 'framer-motion'
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
              <span className="text-brand-text">Build Smarter !</span>
              <br />
              <span className="gradient-text">Launch Faster !</span>
            </h1>
          </motion.div>

          <motion.div variants={item} className="mt-8 flex gap-4 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => navigate('/idea')}
              className="bg-brand-cyan text-brand-bg font-semibold px-8 py-3 rounded-full hover:scale-105 glow-cyan transition-all"
            >
              Get Started →
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
