import '@fontsource-variable/inter'
import '@fontsource-variable/noto-kufi-arabic'
import '@fontsource-variable/space-grotesk'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import './styles/interaction.css'
import './styles/motion.css'
import './styles/compact.css'
import './styles/timeline-dock.css'
import './styles/views.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
