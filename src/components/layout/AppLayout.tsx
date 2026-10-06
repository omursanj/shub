import { Outlet } from 'react-router'

import { MobileNavigation } from './MobileNavigation'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar />

      <div className="lg:pl-72">
        <main className="min-h-screen px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  )
}