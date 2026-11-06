import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// O painel só é carregado quando alguém acessa /admin (não pesa no site público)
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
const ehAdmin = window.location.pathname.replace(/\/+$/, '').startsWith('/admin')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {ehAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
