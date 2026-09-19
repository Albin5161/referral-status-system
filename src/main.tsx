import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './context/AppContext'
import { TourProvider } from './context/TourContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <TourProvider>
          <App />
        </TourProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
