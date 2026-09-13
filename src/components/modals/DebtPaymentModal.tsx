import { FormEvent, useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useFinance } from '../../context/FinanceContext'
import { formatCurrency } from '../../lib/finance'
import type { Debt } from '../../types'

export default function DebtPaymentModal({ open, onClose, debt }: { open: boolean; onClose: () => void; debt: Debt | null }) {
  const { makeDebtPayment } = useFinance()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) { setAmount(debt ? String(debt.min_payment || '') : ''); setError(null) }
  }, [open, debt])

  if (!debt) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return setError('Ingresa un monto de pago válido.')
    if (value > debt.total_balance) return setError('El pago no puede superar el saldo pendiente.')
    setLoading(true)
    const result = await makeDebtPayment(debt.id, value)
    setLoading(false)
    if (result.error) setError(result.error)
    else onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Registrar pago — ${debt.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-paper-500">Saldo pendiente actual: <span className="num text-paper-100 font-semibold">{formatCurrency(debt.total_balance)}</span></p>
        <div>
          <label className="label-field">Monto del pago</label>
          <input className="input-field num" type="number" min="0" step="50" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" autoFocus />
        </div>
        {error && <p className="text-sm text-loss">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Registrando…' : 'Registrar pago'}</button>
        </div>
      </form>
    </Modal>
  )
}
