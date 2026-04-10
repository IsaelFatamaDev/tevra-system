import { Outlet } from 'react-router-dom'
import ClientHeader from './ClientHeader'

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-[#fff8f1]">
      <ClientHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
