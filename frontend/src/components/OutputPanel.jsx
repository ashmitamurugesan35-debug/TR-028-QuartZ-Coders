import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Lightbulb,
  PieChart,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const audienceMap = {
  EdTech: 'Students aged 16-30, working professionals seeking upskilling',
  'Food & Beverage': 'Urban millennials, health-conscious consumers aged 22-40',
  FinTech: 'Young professionals, first-time investors aged 23-35',
  Healthcare: 'Patients, caregivers, and health-conscious adults 30-60',
  AgriTech: 'Small and medium farmers, agricultural cooperatives',
}

export default function OutputPanel({ data = {} }) {
  const navigate = useNavigate()
  const {
    industry = 'Emerging',
    budget = '50,000',
    location = 'your city',
    teamSize = 3,
    description = '',
    mode,
  } = data

  const audience = audienceMap[industry] || `Early adopters aged 20-40 in ${location} and surrounding regions`
  const summary =
    mode === 'need-idea'
      ? `Based on your interests and constraints, this opportunity aligns with market momentum in ${location}. The concept is tuned for a lean team of ${teamSize} and early traction potential.`
      : `${description || 'Your concept'} can be shaped into a focused MVP with a clear customer problem, strong differentiation, and immediate testability in ${location}.`

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18, duration: 0.8 }}
      className="glass rounded-3xl p-8 max-w-3xl mx-auto mt-8 glow-cyan border border-brand-cyan/30"
    >
      <AnimatePresence>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="gradient-text font-heading text-2xl font-bold">Final Report</h2>
          <span className="glass px-3 py-1 rounded-full text-xs text-brand-cyan border border-brand-cyan/30">
            LaunchMind AI
          </span>
        </div>
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <section className="md:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-brand-muted text-xs uppercase tracking-wider">
            <Lightbulb size={20} className="text-brand-cyan" />
            <span>Business Idea</span>
          </div>
          <h3 className="text-xl font-heading font-bold mt-2">{industry} Startup, {location}</h3>
          <p className="text-sm text-brand-muted mt-1 leading-relaxed">{summary}</p>
        </section>

        <section className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-brand-muted text-xs uppercase tracking-wider">
            <Users size={20} className="text-brand-cyan" />
            <span>Target Audience</span>
          </div>
          <p className="text-sm text-brand-text mt-3 leading-relaxed">{audience}</p>
        </section>

        <section className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-brand-muted text-xs uppercase tracking-wider">
            <PieChart size={20} className="text-brand-cyan" />
            <span>Budget Allocation</span>
          </div>
          <p className="text-2xl font-heading font-bold gradient-text mt-2">₹{budget}</p>
          <div className="space-y-3 mt-3">
            {[
              { label: 'Product Dev', width: '40%', tone: 'bg-brand-cyan' },
              { label: 'Marketing', width: '25%', tone: 'bg-brand-violet' },
              { label: 'Operations', width: '20%', tone: 'bg-blue-400' },
              { label: 'Reserve', width: '15%', tone: 'bg-brand-muted' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-24 sm:w-32 text-sm">{row.label}</span>
                <div className="flex-1 h-2 rounded-full bg-brand-border relative overflow-hidden">
                  <div
                    className={`h-full rounded-full fill-bar ${row.tone}`}
                    style={{ '--target-width': row.width }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-brand-muted">{row.width}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-brand-muted text-xs uppercase tracking-wider">
            <ShieldCheck size={20} className="text-brand-cyan" />
            <span>Risk Assessment</span>
          </div>
          <span className="inline-block mt-2 bg-brand-amber/20 text-brand-amber border border-brand-amber/40 rounded-xl px-4 py-2 text-sm font-bold">
            MEDIUM RISK
          </span>
          <div className="mt-3 flex gap-2 flex-wrap text-xs">
            <span className="px-2 py-1 rounded-full bg-brand-green/20 text-brand-green">Entry Barrier: Low</span>
            <span className="px-2 py-1 rounded-full bg-brand-amber/20 text-brand-amber">Competition: Moderate</span>
            <span className="px-2 py-1 rounded-full bg-brand-green/20 text-brand-green">Regulatory: Low</span>
          </div>
        </section>

        <section className="md:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-brand-muted text-xs uppercase tracking-wider">
            <Target size={20} className="text-brand-cyan" />
            <span>Launch Strategy</span>
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {[
              {
                title: 'Validate',
                desc: 'Test with 10 early customers. Gather feedback. Confirm demand.',
              },
              {
                title: 'Build',
                desc: 'Develop MVP. Ship fast. Iterate weekly.',
              },
              {
                title: 'Scale',
                desc: 'Launch paid channels. Expand team. Enter new markets.',
              },
            ].map((step, index) => (
              <div key={step.title} className="contents">
                <div className="flex-1 glass rounded-xl p-4 text-center">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-brand-violet text-brand-bg font-bold text-sm flex items-center justify-center mx-auto">
                    {index + 1}
                  </span>
                  <p className="font-semibold mt-2">{step.title}</p>
                  <p className="text-xs text-brand-muted mt-1">{step.desc}</p>
                </div>
                {index < 2 ? (
                  <ArrowRight size={18} className="text-brand-cyan self-center mx-2 hidden md:block" />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 flex gap-4 justify-center flex-wrap">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="border border-brand-violet text-brand-violet px-8 py-3 rounded-full hover:bg-brand-violet/10 transition-all"
        >
          Start Over
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-brand-cyan text-brand-bg font-semibold px-8 py-3 rounded-full hover:opacity-90 glow-cyan transition-all"
        >
          Download Report
        </button>
      </div>
    </motion.div>
  )
}
