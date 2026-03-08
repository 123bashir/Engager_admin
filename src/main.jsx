import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContextProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <AuthContextProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </AuthContextProvider>,
)
