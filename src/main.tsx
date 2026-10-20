import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { addFlashPacks, migrateToSoftwareSamples } from './Utils/softwareMigration'

// Old school-themed sample data becomes software-themed (runs once).
migrateToSoftwareSamples()
addFlashPacks()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
