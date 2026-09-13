import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { buildCategoryTree, formatCurrency } from '../lib/finance'
import ProgressBar from '../components/ui/ProgressBar'
import CategoryModal from '../components/modals/CategoryModal'
import type { Category, CategoryWithSpend } from '../types'

export default function Budgets() {
  const { categories, transactions, deleteCategory, loading } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [defaultParent, setDefaultParent] = useState<string | null>(null)

  const tree = useMemo(() => buildCategoryTree(categories, transactions), [categories, transactions])

  const totals = useMemo(() => {
    const planned = categories.reduce((acc, c) => acc + Number(c.monthly_budget), 0)
    const spent = tree.reduce((acc, c) => acc + c.spent, 0)
    return { planned, spent }
  }, [categories, tree])

  const openNew = (parentId: string | null = null) => {
    setEditing(null)
    setDefaultParent(parentId)
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta categoría y sus subcategorías? Las transacciones asociadas quedarán sin categoría.')) {
      await deleteCategory(id)
    }
  }

  if (loading) return <div className="h-64 card animate-pulse" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-paper-100">Presupuesto mensual</h1>
          <p className="text-sm text-paper-500 mt-1">
            Planificado {formatCurrency(totals.planned)} · Ejecutado {formatCurrency(totals.spent)}
          </p>
        </div>
        <button onClick={() => openNew(null)} className="btn-primary">
          <PlusIcon /> Nueva categoría
        </button>
      </div>

      {tree.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-paper-100 font-medium">No tienes categorías de presupuesto todavía.</p>
          <p className="text-sm text-paper-500 mt-1 mb-5">Crea tu primera categoría, por ejemplo "Vivienda" o "Alimentación".</p>
          <button onClick={() => openNew(null)} className="btn-primary mx-auto">
            <PlusIcon /> Crear categoría
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tree.map((cat) => (
            <CategoryRow key={cat.id} node={cat} onAddSub={() => openNew(cat.id)} onEdit={openEdit} onDelete={handleDelete} depth={0} />
          ))}
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        parentOptions={categories.filter((c) => !c.parent_id)}
        defaultParentId={defaultParent}
      />
    </div>
  )
}

function CategoryRow({
  node, onAddSub, onEdit, onDelete, depth,
}: { node: CategoryWithSpend; onAddSub: () => void; onEdit: (c: Category) => void; onDelete: (id: string) => void; depth: number }) {
  return (
    <div className={depth === 0 ? 'card p-4 sm:p-5' : 'border-l-2 border-white/[0.06] pl-4 ml-2 mt-3'}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-[140px]">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: node.color }} />
          <span className="font-medium text-paper-100">{node.name}</span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {depth === 0 && (
            <button onClick={onAddSub} className="icon-btn" title="Añadir subcategoría"><PlusIcon small /></button>
          )}
          <button onClick={() => onEdit(node)} className="icon-btn" title="Editar límite"><EditIcon /></button>
          <button onClick={() => onDelete(node.id)} className="icon-btn hover:!text-loss" title="Eliminar categoría"><TrashIcon /></button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Planificado" value={formatCurrency(node.monthly_budget)} />
        <Stat label="Ejecutado" value={formatCurrency(node.spent)} />
        <Stat label="Restante" value={formatCurrency(node.remaining)} negative={node.remaining < 0} />
      </div>

      <div className="mt-3">
        <ProgressBar percent={node.percent} />
        <p className="mt-1 text-xs text-paper-500">{node.percent.toFixed(0)}% del presupuesto usado</p>
      </div>

      {node.subcategories.map((sub) => (
        <CategoryRow key={sub.id} node={sub} onAddSub={onAddSub} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
      ))}
    </div>
  )
}

function Stat({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-paper-500">{label}</p>
      <p className={`num font-semibold ${negative ? 'text-loss' : 'text-paper-100'}`}>{value}</p>
    </div>
  )
}

function PlusIcon({ small }: { small?: boolean }) {
  const s = small ? 14 : 16
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
