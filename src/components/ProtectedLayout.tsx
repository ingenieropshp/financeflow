import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FinanceProvider } from '../context/FinanceContext'
import Header from './Header'

export default function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gain border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-ink-900">
        <Header />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-24 md:pb-10">
          <Outlet />
        </main>
      </div>
    </FinanceProvider>
  )
}
