import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import WhatsAppButton from './components/layout/WhatsAppButton'
import SplashScreen from './components/layout/SplashScreen'
import ScrollToTop from './components/layout/ScrollToTop'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AgentesPage from './pages/AgentesPage'

function AppLayout() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login'

  return (
    <>
      <ScrollToTop />
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/agentes" element={<AgentesPage />} />
      </Routes>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <WhatsAppButton />}
    </>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashFinish = useCallback(() => setShowSplash(false), [])

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <AppLayout />
    </BrowserRouter>
  )
}
