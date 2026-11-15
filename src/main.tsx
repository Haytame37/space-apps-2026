import '@fontsource-variable/inter'
import '@fontsource-variable/noto-kufi-arabic'
import '@fontsource-variable/space-grotesk'
// Unbounded is only used for the name AYYUR: latin letters, weight 700.
import '@fontsource/unbounded/latin-700.css'
// Kids' corner: Fredoka for titles, Nunito for text.
import '@fontsource-variable/fredoka'
import '@fontsource-variable/nunito'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import './styles/interaction.css'
import './styles/motion.css'
import './styles/compact.css'
import './styles/timeline-dock.css'
import './styles/views.css'
import './styles/ayyur.css'
import './styles/kids.css'
import './styles/shop.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
