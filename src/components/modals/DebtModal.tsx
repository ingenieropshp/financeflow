import { FormEvent, useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useFinance } from '../../context/FinanceContext'
import type { Debt } from '../../types'

interface DebtModalProps {
  open: boolean
  onClose: () => void
  editing?: Debt | null
}

export default function DebtModal({ open, onClose, editing }: DebtModalProps) {
  const { addDebt, updateDebt } = useFinance()
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [minPayment, setMinPayment] = useState('')
  const [rate, setRate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name || '')
      setBalance(editing ? String(editing.total_balance) : '')
      setMinPayment(editing ? String(editing.min_payment) : '')
      setRate(editing ? String(editing.interest_rate) : '')
      setError(null)
    }
  }, [open, editing])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('El nombre de la deuda es obligatorio.')
    const totalBalance = Number(balance)
    if (!totalBalance || totalBalance <= 0) return setError('Ingresa un saldo válido.')

    setLoading(true)
    const result = editing
      ? await updateDebt(editing.id, {
          name: name.trim(),
          total_balance: totalBalance,
          min_payment: Number(minPayment) || 0,
          interest_rate: Number(rate) || 0,
        })
      : await addDebt({
          name: name.trim(),
          total_balance: totalBalance,
          original_balance: totalBalance,
          min_payment: Number(minPayment) || 0,
          interest_rate: Number(rate) || 0,
        })
    setLoading(false)
    if (result.error) setError(result.error)
    else onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar deuda' : 'Nueva deuda'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Nombre de la deuda</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Tarjeta Visa" autoFocus />
        </div>
        <div>
          <label className="label-field">Saldo pendiente</label>
          <input className="input-field num" type="number" min="0" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Pago mínimo mensual</label>
            <input className="input-field num" type="number" min="0" step="0.01" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="label-field">Tasa de interés (%)</label>
            <input className="input-field num" type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.00" />
          </div>
        </div>

        {error && <p className="text-sm text-loss">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Guardando…' : editing ? 'Guardar cambios' : 'Añadir deuda'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
