import { FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthShell } from './Login'

export default function Signup() {
  const { signUp, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)
    if (error) setError(error)
    else setSuccess(true)
  }

  if (success) {
    return (
      <AuthShell>
        <h1 className="font-display text-xl font-bold text-paper-100">Revisa tu correo</h1>
        <p className="mt-2 text-sm text-paper-500">
          Te enviamos un enlace de confirmación a <span className="text-paper-100">{email}</span>. Confírmalo
          para poder iniciar sesión y comenzar a registrar tus finanzas desde cero.
        </p>
        <Link to="/login" className="btn-primary mt-6 w-full inline-flex">Ir a iniciar sesión</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <h1 className="font-display text-2xl font-extrabold text-paper-100">Crea tu cuenta</h1>
      <p className="mt-1.5 text-sm text-paper-500">Empieza a organizar tus finanzas desde $0.00.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label-field" htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label-field" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="label-field" htmlFor="confirm">Confirmar contraseña</label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-field"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
          />
        </div>

        {error && <p className="text-sm text-loss">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-paper-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-gain hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  )
}
