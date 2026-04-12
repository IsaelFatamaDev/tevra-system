import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './core/contexts/AuthContext'
import { CartProvider } from './core/contexts/CartContext'
import { ToastProvider } from './core/contexts/ToastContext'
import Navbar from './core/components/Navbar'
import Footer from './core/components/Footer'
import WhatsAppButton from './core/components/WhatsAppButton'
import ScrollToTop from './core/components/ScrollToTop'
import { getDashboardPath } from './core/utils/roles'

// Public pages
import HomePage from './modules/public/pages/HomePage'
import LoginPage from './modules/public/pages/LoginPage'
import AgentesPage from './modules/public/pages/AgentesPage'
import CatalogoPage from './modules/public/pages/CatalogoPage'
import ProductDetailPage from './modules/public/pages/ProductDetailPage'
import AgentRegistrationPage from './modules/public/pages/AgentRegistrationPage'
import EmpresaPage from './modules/public/pages/EmpresaPage'
import TrackingPage from './modules/public/pages/TrackingPage'
import CartPage from './modules/public/pages/CartPage'
import AgentDirectoryPage from './modules/public/pages/AgentDirectoryPage'
import AgentProfilePage from './modules/public/pages/AgentProfilePage'
import QuotePage from './modules/public/pages/QuotePage'

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
import ClientOrders from './modules/client/pages/Orders'
import ClientAddresses from './modules/client/pages/Addresses'
import ClientSecurity from './modules/client/pages/Security'

// Agent module
import AgentLayout from './modules/agent/layout/AgentLayout'
import AgentDashboard from './modules/agent/pages/Dashboard'
import AgentOrders from './modules/agent/pages/Orders'
import AgentCommissions from './modules/agent/pages/Commissions'
import AgentClients from './modules/agent/pages/Clients'
import AgentSecurity from './modules/agent/pages/Security'

function ProtectedRoute({ roles, children }) {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to={getDashboardPath(user?.role)} replace />
  return children
}

function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to={getDashboardPath(user?.role)} replace />
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
        <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
        <Route path="/agentes" element={<AgentesPage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/catalogo/:slug" element={<ProductDetailPage />} />
        <Route path="/empresa" element={<EmpresaPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/directorio-agentes" element={<AgentDirectoryPage />} />
        <Route path="/agente/:code" element={<AgentProfilePage />} />
        <Route path="/cotizar" element={<QuotePage />} />
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
          <Route path="pedidos" element={<ClientOrders />} />
          <Route path="direcciones" element={<ClientAddresses />} />
          <Route path="seguridad" element={<ClientSecurity />} />
        </Route>

        {/* Agent routes */}
        <Route path="/agente" element={
          <ProtectedRoute roles={['agent']}>
            <AgentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AgentDashboard />} />
          <Route path="pedidos" element={<AgentOrders />} />
          <Route path="comisiones" element={<AgentCommissions />} />
          <Route path="clientes" element={<AgentClients />} />
          <Route path="seguridad" element={<AgentSecurity />} />
        </Route>

        {/* Agent Registration (standalone layout) */}
        <Route path="/registro-agente" element={<AgentRegistrationPage />} />

        {/* Public routes */}
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <AppLayout />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
