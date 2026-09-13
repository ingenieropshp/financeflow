import { FormEvent, useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useFinance } from '../../context/FinanceContext'
import { formatCurrency } from '../../lib/finance'
import type { Pot } from '../../types'

interface PotFundsModalProps {
  open: boolean
  onClose: () => void
  pot: Pot | null
  mode: 'add' | 'withdraw'
}

export default function PotFundsModal({ open, onClose, pot, mode }: PotFundsModalProps) {
  const { moveMoneyToPot, withdrawMoneyFromPot } = useFinance()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) { setAmount(''); setError(null) }
  }, [open, mode])

  if (!pot) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return setError('Ingresa un monto válido mayor a cero.')
    if (mode === 'withdraw' && value > pot.current_amount) return setError('No puedes retirar más de lo acumulado.')

    setLoading(true)
    const result = mode === 'add' ? await moveMoneyToPot(pot, value) : await withdrawMoneyFromPot(pot, value)
    setLoading(false)
    if (result.error) setError(result.error)
    else onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`${mode === 'add' ? 'Añadir dinero a' : 'Retirar dinero de'} "${pot.name}"`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-paper-500">
          Acumulado actual: <span className="num text-paper-100 font-semibold">{formatCurrency(pot.current_amount)}</span> de {formatCurrency(pot.target_amount)}
        </p>
        <div>
          <label className="label-field">Monto a {mode === 'add' ? 'añadir' : 'retirar'}</label>
          <input className="input-field num" type="number" min="0" step="50" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" autoFocus />
        </div>
        {mode === 'add' && (
          <p className="text-xs text-paper-500">Este monto se descontará de tu saldo disponible como un aporte a la meta.</p>
        )}
        {mode === 'withdraw' && (
          <p className="text-xs text-paper-500">Este monto se sumará a tu saldo disponible como un retiro de la meta.</p>
        )}
        {error && <p className="text-sm text-loss">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading} className={`flex-1 ${mode === 'add' ? 'btn-primary' : 'btn-secondary'}`}>
            {loading ? 'Procesando…' : mode === 'add' ? 'Añadir dinero' : 'Retirar dinero'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
