import { FormEvent, useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useFinance } from '../../context/FinanceContext'
import type { PaymentMethod, Transaction, TransactionType } from '../../types'

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  editing?: Transaction | null
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
}

export default function TransactionModal({ open, onClose, editing }: TransactionModalProps) {
  const { categories, addTransaction, updateTransaction } = useFinance()
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setType(editing?.type || 'expense')
      setAmount(editing ? String(editing.amount) : '')
      setCategoryId(editing?.category_id || '')
      setDate(editing?.date || new Date().toISOString().slice(0, 10))
      setPaymentMethod(editing?.payment_method || 'card')
      setNotes(editing?.notes || '')
      setError(null)
    }
  }, [open, editing])

  const parentCategories = categories.filter((c) => !c.parent_id)
  const subcategoriesOf = (parentId: string) => categories.filter((c) => c.parent_id === parentId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) return setError('Ingresa un monto válido mayor a cero.')
    if (!date) return setError('Selecciona una fecha.')

    setLoading(true)
    const payload = {
      type,
      amount: numAmount,
      category_id: categoryId || null,
      date,
      payment_method: paymentMethod,
      notes: notes.trim() || null,
    }
    const result = editing ? await updateTransaction(editing.id, payload) : await addTransaction(payload)
    setLoading(false)
    if (result.error) setError(result.error)
    else onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar transacción' : 'Nueva transacción'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`rounded-sm border py-2.5 text-sm font-semibold transition-colors ${
              type === 'income' ? 'border-gain bg-gain/10 text-gain' : 'border-white/10 text-paper-500'
            }`}
          >
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`rounded-sm border py-2.5 text-sm font-semibold transition-colors ${
              type === 'expense' ? 'border-loss bg-loss/10 text-loss' : 'border-white/10 text-paper-500'
            }`}
          >
            Gasto
          </button>
        </div>

        <div>
          <label className="label-field">Monto</label>
          <input
            className="input-field num"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Categoría</label>
            <select className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sin categoría</option>
              {parentCategories.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  <option value={c.id}>{c.name}</option>
                  {subcategoriesOf(c.id).map((sub) => (
                    <option key={sub.id} value={sub.id}>&nbsp;&nbsp;— {sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Fecha</label>
            <input className="input-field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label-field">Método de pago</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`rounded-sm border py-2 text-xs font-medium transition-colors ${
                  paymentMethod === m ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 text-paper-500'
                }`}
              >
                {PAYMENT_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-field">Notas (opcional)</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Mercado de la quincena"
          />
        </div>

        {error && <p className="text-sm text-loss">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Guardando…' : editing ? 'Guardar cambios' : 'Añadir transacción'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
