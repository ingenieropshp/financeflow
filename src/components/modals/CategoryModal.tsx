import { FormEvent, useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useFinance } from '../../context/FinanceContext'
import { CATEGORY_COLOR_PALETTE } from '../../lib/finance'
import type { Category } from '../../types'

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  editing?: Category | null
  parentOptions: Category[]
  defaultParentId?: string | null
}

export default function CategoryModal({ open, onClose, editing, parentOptions, defaultParentId = null }: CategoryModalProps) {
  const { addCategory, updateCategory } = useFinance()
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState<string | null>(defaultParentId)
  const [budget, setBudget] = useState('')
  const [color, setColor] = useState(CATEGORY_COLOR_PALETTE[0])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name || '')
      setParentId(editing?.parent_id ?? defaultParentId)
      setBudget(editing ? String(editing.monthly_budget) : '')
      setColor(editing?.color || CATEGORY_COLOR_PALETTE[Math.floor(Math.random() * CATEGORY_COLOR_PALETTE.length)])
      setError(null)
    }
  }, [open, editing, defaultParentId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('El nombre es obligatorio.')
    setLoading(true)
    const monthlyBudget = Number(budget) || 0
    const result = editing
      ? await updateCategory(editing.id, { name: name.trim(), monthly_budget: monthlyBudget, color })
      : await addCategory(name.trim(), parentId, monthlyBudget, color)
    setLoading(false)
    if (result.error) setError(result.error)
    else onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar categoría' : 'Nueva categoría / subcategoría'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Nombre</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Vivienda" autoFocus />
        </div>

        {!editing && (
          <div>
            <label className="label-field">Categoría padre (opcional)</label>
            <select
              className="input-field"
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
            >
              <option value="">Ninguna — categoría principal</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label-field">Monto planificado mensual</label>
          <input
            className="input-field"
            type="number"
            min="0"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="label-field">Color</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLOR_PALETTE.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-offset-ink-800 ring-white' : ''}`}
                style={{ background: c }}
                aria-label={`Elegir color ${c}`}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-loss">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
