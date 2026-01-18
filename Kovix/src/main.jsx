import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { PresenceProvider } from './contexts/PresenceContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PresenceProvider>
        <App />
      </PresenceProvider>
    </AuthProvider>
  </StrictMode>
)