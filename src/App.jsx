import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './core/contexts/AuthContext'
import Navbar from './core/components/Navbar'
import Footer from './core/components/Footer'
import WhatsAppButton from './core/components/WhatsAppButton'
import SplashScreen from './core/components/SplashScreen'
import ScrollToTop from './core/components/ScrollToTop'
import { getDashboardPath } from './core/utils/roles'

// Public pages
import HomePage from './modules/public/pages/HomePage'
import LoginPage from './modules/public/pages/LoginPage'
import AgentesPage from './modules/public/pages/AgentesPage'
import CatalogoPage from './modules/public/pages/CatalogoPage'
import EmpresaPage from './modules/public/pages/EmpresaPage'
import TrackingPage from './modules/public/pages/TrackingPage'

// Admin module
import AdminLayout from './modules/admin/layout/AdminLayout'
import AdminDashboard from './modules/admin/pages/Dashboard'
import AdminUsers from './modules/admin/pages/Users'
import AdminAgents from './modules/admin/pages/Agents'
import AdminProducts from './modules/admin/pages/Products'
import AdminOrders from './modules/admin/pages/Orders'
import AdminReviews from './modules/admin/pages/Reviews'
import AdminReports from './modules/admin/pages/Reports'
import AdminCommunications from './modules/admin/pages/Communications'
import AdminSettings from './modules/admin/pages/Settings'
import AdminCategories from './modules/admin/pages/Categories'
import AdminBrands from './modules/admin/pages/Brands'

// Client module
import ClientLayout from './modules/client/layout/ClientLayout'
import ClientDashboard from './modules/client/pages/Dashboard'

// Agent module
import AgentLayout from './modules/agent/layout/AgentLayout'
import AgentDashboard from './modules/agent/pages/Dashboard'

function ProtectedRoute({ roles, children }) {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to={getDashboardPath(user?.role)} replace />
  return children
}

/* ---------- layouts ---------- */
function PublicLayout() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login'
  return (
    <>
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/agentes" element={<AgentesPage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/empresa" element={<EmpresaPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
      </Routes>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <WhatsAppButton />}
    </>
  )
}

function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['super_admin', 'admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="communications" element={<AdminCommunications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Client routes */}
        <Route path="/mi-cuenta" element={
          <ProtectedRoute roles={['customer']}>
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ClientDashboard />} />
        </Route>

        {/* Agent routes */}
        <Route path="/agente" element={
          <ProtectedRoute roles={['agent']}>
            <AgentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AgentDashboard />} />
        </Route>

        {/* Public routes */}
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashFinish = useCallback(() => setShowSplash(false), [])

  return (
    <BrowserRouter>
      <AuthProvider>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}
