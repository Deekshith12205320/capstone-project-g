import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { AmbienceProvider } from './context/AmbienceContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AmbienceProvider>
      <App />
    </AmbienceProvider>
  </StrictMode>,
)
