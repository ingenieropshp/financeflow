import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const TABS = [
  { to: '/', label: 'Resumen', icon: IconGrid },
  { to: '/presupuesto', label: 'Presupuesto', icon: IconPie },
  { to: '/transacciones', label: 'Transacciones', icon: IconList },
  { to: '/deudas-metas', label: 'Deudas y metas', icon: IconTarget },
]

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-900/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo size={32} />

            <nav className="hidden md:flex items-center gap-1">
              {TABS.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.to === '/'}
                  className={({ isActive }) =>
                    `rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-white/[0.06] text-paper-100' : 'text-paper-500 hover:text-paper-100'
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-paper-500 max-w-[180px] truncate">
                {user?.email}
              </span>
              <button onClick={signOut} className="btn-secondary !px-3 !py-2 text-xs sm:text-sm">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden border-t border-white/[0.06] bg-ink-900/95 backdrop-blur">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-gain' : 'text-paper-500'
              }`
            }
          >
            <tab.icon />
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

function IconGrid() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  )
}
function IconPie() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  )
}
function IconList() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
  )
}
function IconTarget() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  )
}
