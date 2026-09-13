import { FormEvent, useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useFinance } from '../../context/FinanceContext'

export default function PotModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addPot } = useFinance()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) { setName(''); setTarget(''); setError(null) }
  }, [open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('El nombre de la meta es obligatorio.')
    const value = Number(target)
    if (!value || value <= 0) return setError('Ingresa un monto objetivo válido.')
    setLoading(true)
    const result = await addPot(name.trim(), value)
    setLoading(false)
    if (result.error) setError(result.error)
    else onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva meta de ahorro">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Nombre de la meta</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Fondo de emergencia" autoFocus />
        </div>
        <div>
          <label className="label-field">Monto objetivo</label>
          <input className="input-field num" type="number" min="0" step="1000" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0" />
        </div>
        {error && <p className="text-sm text-loss">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creando…' : 'Crear meta'}</button>
        </div>
      </form>
    </Modal>
  )
}
