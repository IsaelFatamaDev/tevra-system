import { Outlet } from 'react-router-dom'
import ClientHeader from './ClientHeader'

export default function ClientLayout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EEF4ED20', background: 'linear-gradient(160deg, #EEF4ED22 0%, #ffffff 50%)' }}>
      <ClientHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
