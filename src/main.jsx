import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LabProvider } from './context/LabContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LabProvider>
      <App />
    </LabProvider>
  </React.StrictMode>,
)
