import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  MapPin,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const industries = [
  'Textile',
  'Food & Beverage',
  'Healthcare',
  'EdTech',
  'FinTech',
  'AgriTech',
  'Logistics',
  'Retail',
  'SaaS',
  'Clean Energy',
  'Real Estate',
  'Travel & Tourism',
  'Social Impact',
  'Other',
]

const locations = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Chandigarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Pune',
  'Kolkata',
  'Jaipur',
  'Ahmedabad',
  'Kochi',
  'Indore',
  'Surat',
  'Ludhiana',
  'Tamil Nadu',
  'Chennai',
  'Coimbatore',
  'Salem',
  'Bhavani',
  'Mettur',
  'Sankari',
  'Attur',
  'Edappadi',
  'Yercaud',
  'Trichy',
  'Tiruchirapalli',
  'Srirangam',
  'Lalgudi',
  'Manapparai',
  'Madurai',
  'Thiruparankundram',
  'Melur',
  'Usilampatti',
  'Erode',
  'Gobichettipalayam',
  'Perundurai',
  'Tiruppur',
  'Avinashi',
  'Palladam',
  'Udumalaipettai',
  'Pollachi',
  'Mettupalayam',
  'Nagercoil',
  'Kanyakumari',
  'Marthandam',
  'Kulasekaram',
  'Padmanabhapuram',
  'Theni',
  'Periyakulam',
  'Bodinayakanur',
  'Cumbum',
  'Dindigul',
  'Palani',
  'Oddanchatram',
  'Batlagundu',
  'Kallakurichi',
  'Ulundurpet',
  'Chinnasalem',
  'Ariyalur',
  'Jayankondam',
  'Chengalpattu',
  'Tambaram',
  'Madurantakam',
  'Kanchipuram',
  'Sriperumbudur',
  'Kundrathur',
  'Ranipet',
  'Arakkonam',
  'Walajapet',
  'Vellore',
  'Katpadi',
  'Gudiyatham',
  'Ambur',
  'Vaniyambadi',
  'Tirupattur',
  'Hosur',
  'Denkanikottai',
  'Karur',
  'Kulithalai',
  'Namakkal',
  'Rasipuram',
  'Tiruchengode',
  'Villupuram',
  'Tindivanam',
  'Kallakkurichi',
  'Cuddalore',
  'Neyveli',
  'Panruti',
  'Chidambaram',
  'Vriddachalam',
  'Perambalur',
  'Kunnam',
  'Sivagangai',
  'Karaikudi',
  'Devakottai',
  'Ramanathapuram',
  'Paramakudi',
  'Rameswaram',
  'Pudukkottai',
  'Aranthangi',
  'Alangudi',
  'Tenkasi',
  'Sankarankovil',
  'Courtallam',
  'Virudunagar',
  'Sivakasi',
  'Srivilliputhur',
  'Aruppukkottai',
  'Krishnagiri',
  'Dharmapuri',
  'Harur',
  'Pennagaram',
  'Thanjavur',
  'Kumbakonam',
  'Pattukkottai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Sirkazhi',
  'Thiruvarur',
  'Mannargudi',
  'Nagore',
  'Thoothukudi',
  'Tirunelveli',
  'Ambasamudram',
  'Vikramasingapuram',
  'Rajapalayam',
  'Udhagamandalam',
  'Ooty',
  'Coonoor',
  'Kotagiri',
  'Kodaikanal',
  'Puducherry',
  'Yanam',
  'Karaikal',
  'Mahe',
]

const inputClass =
  'w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/40 transition-all'

export default function InputForm() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const mode = state?.mode
  const isHasIdea = mode === 'has-idea'

  const [industry, setIndustry] = useState('')
  const [budget, setBudget] = useState('')
  const [locationValue, setLocationValue] = useState('')
  const [locationOpen, setLocationOpen] = useState(false)
  const [teamSize, setTeamSize] = useState(3)
  const [description, setDescription] = useState('')
  const [interests, setInterests] = useState('')
  const [context, setContext] = useState('')
  const [errors, setErrors] = useState({})

  const filteredLocations = locationValue
    ? locations.filter((loc) => loc.toLowerCase().includes(locationValue.toLowerCase()))
    : []

  const heading = isHasIdea ? 'Tell us about your idea' : 'Help us find your idea'
  const subtitle = isHasIdea
    ? 'The more detail you provide, the smarter the analysis'
    : "Share your interests and we'll do the rest"

  useMemo(() => {
    if (!mode) {
      navigate('/idea')
    }
  }, [mode, navigate])

  const setTeam = (next) => {
    const clamped = Math.min(50, Math.max(1, next))
    setTeamSize(clamped)
  }

  const validate = () => {
    const nextErrors = {}

    if (isHasIdea && !industry.trim()) nextErrors.industry = 'Industry is required.'
    if (!budget.trim()) nextErrors.budget = 'Budget is required.'
    if (!locationValue.trim()) nextErrors.location = 'Location is required.'
    if (!teamSize) nextErrors.teamSize = 'Team size is required.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return

    navigate('/run', {
      state: {
        mode,
        industry,
        budget,
        location: locationValue,
        teamSize,
        description: isHasIdea ? description : interests,
        interests,
        context,
      },
    })
  }

  const fieldVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <main className="min-h-screen py-12 px-4 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => navigate('/idea')}
        className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-cyan transition-colors"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <div className="text-center mt-8">
        <h1 className="text-4xl font-heading font-bold">{heading}</h1>
        <p className="text-brand-muted mt-2">{subtitle}</p>
      </div>

      <motion.form
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-8 max-w-2xl mx-auto mt-8"
      >
        {isHasIdea ? (
          <>
            <motion.div variants={fieldVariants} transition={{ duration: 0.25 }} className="mb-5">
              <label className="text-sm font-medium text-brand-muted mb-1 block">Industry</label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select your industry...</option>
                  {industries.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              </div>
              <AnimatePresence>
                {errors.industry ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-brand-rose mt-1">
                    {errors.industry}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </motion.div>

            <CommonFields
              budget={budget}
              setBudget={setBudget}
              locationValue={locationValue}
              setLocationValue={setLocationValue}
              locationOpen={locationOpen}
              setLocationOpen={setLocationOpen}
              filteredLocations={filteredLocations}
              teamSize={teamSize}
              setTeam={setTeam}
              errors={errors}
              variants={fieldVariants}
            />

            <motion.div variants={fieldVariants} transition={{ duration: 0.25 }} className="mb-1">
              <label className="text-sm font-medium text-brand-muted mb-1 block">Describe your idea <span className="text-brand-muted text-xs">(Optional)</span></label>
              <div className="relative">
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value.slice(0, 500))}
                  placeholder="What problem does it solve? Who is your target customer? What makes it unique?"
                  className={inputClass}
                />
                <span className="absolute bottom-3 right-4 text-xs text-brand-muted">
                  {description.length} / 500 chars
                </span>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div variants={fieldVariants} transition={{ duration: 0.25 }} className="mb-5">
              <label className="text-sm font-medium text-brand-muted mb-1 block">Your Interests & Passions <span className="text-brand-muted text-xs">(Optional)</span></label>
              <textarea
                rows={3}
                value={interests}
                onChange={(event) => setInterests(event.target.value)}
                placeholder="e.g. sustainability, cooking, tech, education, fitness..."
                className={inputClass}
              />
            </motion.div>

            <CommonFields
              budget={budget}
              setBudget={setBudget}
              locationValue={locationValue}
              setLocationValue={setLocationValue}
              locationOpen={locationOpen}
              setLocationOpen={setLocationOpen}
              filteredLocations={filteredLocations}
              teamSize={teamSize}
              setTeam={setTeam}
              errors={errors}
              variants={fieldVariants}
            />

            <motion.div variants={fieldVariants} transition={{ duration: 0.25 }} className="mb-1">
              <label className="text-sm font-medium text-brand-muted mb-1 block">Anything else to consider? <span className="text-brand-muted text-xs">(Optional)</span></label>
              <textarea
                rows={3}
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder="Skills your team has, constraints, preferences, or industries to avoid."
                className={inputClass}
              />
            </motion.div>
          </>
        )}

        <motion.button
          variants={fieldVariants}
          transition={{ duration: 0.25 }}
          type="submit"
          className="w-full mt-8 h-14 rounded-xl font-semibold text-lg text-brand-bg bg-gradient-to-r from-brand-cyan to-brand-violet hover:opacity-90 hover:scale-[1.01] glow-cyan transition-all inline-flex items-center justify-center gap-3"
        >
          <Sparkles size={18} />
          Analyze with AI Agents
          <ArrowRight size={18} />
        </motion.button>
      </motion.form>
    </main>
  )
}

function CommonFields({
  budget,
  setBudget,
  locationValue,
  setLocationValue,
  locationOpen,
  setLocationOpen,
  filteredLocations,
  teamSize,
  setTeam,
  errors,
  variants,
}) {
  return (
    <>
      <motion.div variants={variants} transition={{ duration: 0.25 }} className="mb-5">
        <label className="text-sm font-medium text-brand-muted mb-1 block">Startup Budget</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">₹</span>
          <input
            type="text"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="50,000"
            className={`${inputClass} pl-8`}
          />
        </div>
        {errors.budget ? <p className="text-xs text-brand-rose mt-1">{errors.budget}</p> : null}
      </motion.div>

      <motion.div variants={variants} transition={{ duration: 0.25 }} className="mb-5">
        <label className="text-sm font-medium text-brand-muted mb-1 block">Location</label>
        <div className="relative">
          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
          <input
            type="text"
            value={locationValue}
            onChange={(event) => {
              setLocationValue(event.target.value)
              setLocationOpen(true)
            }}
            onFocus={() => setLocationOpen(true)}
            placeholder="Start typing location (e.g. Ch...)"
            className={`${inputClass} pl-10`}
          />
          <AnimatePresence>
            {locationOpen && locationValue && filteredLocations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-1 glass rounded-xl border border-brand-border max-h-48 overflow-y-auto z-20"
              >
                {filteredLocations.map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => {
                      setLocationValue(location)
                      setLocationOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-cyan/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    {location}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-xs text-brand-muted mt-1">Type any city/town even if it is not in suggestions.</p>
        {errors.location ? <p className="text-xs text-brand-rose mt-1">{errors.location}</p> : null}
      </motion.div>

      <motion.div variants={variants} transition={{ duration: 0.25 }} className="mb-5">
        <label className="text-sm font-medium text-brand-muted mb-1 block">Team Size</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTeam(teamSize - 1)}
            className="w-10 h-10 rounded-lg border border-brand-border hover:border-brand-cyan hover:text-brand-cyan flex items-center justify-center transition-colors"
          >
            <Minus size={16} />
          </button>
          <div className="min-w-12 text-center text-lg font-semibold">{teamSize}</div>
          <button
            type="button"
            onClick={() => setTeam(teamSize + 1)}
            className="w-10 h-10 rounded-lg border border-brand-border hover:border-brand-cyan hover:text-brand-cyan flex items-center justify-center transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <p className="text-sm text-brand-muted mt-2">{teamSize} members</p>
        {errors.teamSize ? <p className="text-xs text-brand-rose mt-1">{errors.teamSize}</p> : null}
      </motion.div>
    </>
  )
}
