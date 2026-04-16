import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import ModeSelect from './pages/ModeSelect'
import IdeaSelect from './pages/IdeaSelect'
import InputForm from './pages/InputForm'
import AgentExecution from './pages/AgentExecution'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/mode" element={<ModeSelect />} />
        <Route path="/idea" element={<IdeaSelect />} />
        <Route path="/form" element={<InputForm />} />
        <Route path="/run" element={<AgentExecution />} />
      </Routes>
    </BrowserRouter>
  )
}
