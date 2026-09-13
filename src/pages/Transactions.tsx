import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, formatDate } from '../lib/finance'
import TransactionModal from '../components/modals/TransactionModal'
import type { Transaction } from '../types'

const PAGE_SIZE = 10
const PAYMENT_LABELS: Record<string, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' }

export default function Transactions() {
  const { transactions, categories, deleteTransaction, loading } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name || 'Sin categoría'

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false
      if (fromDate && t.date < fromDate) return false
      if (toDate && t.date > toDate) return false
      if (search) {
        const haystack = `${categoryName(t.category_id)} ${t.notes || ''} ${PAYMENT_LABELS[t.payment_method]}`.toLowerCase()
        if (!haystack.includes(search.toLowerCase())) return false
      }
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, typeFilter, categoryFilter, fromDate, toDate, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const resetFilters = () => {
    setSearch(''); setTypeFilter('all'); setCategoryFilter('all'); setFromDate(''); setToDate(''); setPage(1)
  }

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (t: Transaction) => { setEditing(t); setModalOpen(true) }
  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta transacción?')) await deleteTransaction(id)
  }

  if (loading) return <div className="h-64 card animate-pulse" />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-paper-100">Transacciones</h1>
        <button onClick={openNew} className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Nueva transacción
        </button>
      </div>

      <div className="card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          className="input-field lg:col-span-2"
          placeholder="Buscar por nota, categoría o método…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <select className="input-field" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1) }}>
          <option value="all">Todos los tipos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Gastos</option>
        </select>
        <select className="input-field" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}>
          <option value="all">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="input-field" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1) }} />
          <input type="date" className="input-field" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1) }} />
        </div>
        {(search || typeFilter !== 'all' || categoryFilter !== 'all' || fromDate || toDate) && (
          <button onClick={resetFilters} className="text-xs text-paper-500 hover:text-paper-100 text-left lg:col-span-5">
            Limpiar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-paper-100 font-medium">
            {transactions.length === 0 ? 'Aún no has registrado transacciones.' : 'No hay resultados para estos filtros.'}
          </p>
          {transactions.length === 0 && (
            <button onClick={openNew} className="btn-primary mx-auto mt-4">Registrar la primera</button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-paper-500">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Método</th>
                  <th className="px-4 py-3 font-medium">Notas</th>
                  <th className="px-4 py-3 font-medium text-right">Monto</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t) => (
                  <tr key={t.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-paper-300 whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-4 py-3 text-paper-100">{categoryName(t.category_id)}</td>
                    <td className="px-4 py-3 text-paper-300 hidden sm:table-cell">{PAYMENT_LABELS[t.payment_method]}</td>
                    <td className="px-4 py-3 text-paper-500 max-w-[160px] truncate">{t.notes || '—'}</td>
                    <td className={`px-4 py-3 text-right num font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-gain' : 'text-loss'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="icon-btn" title="Editar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="icon-btn hover:!text-loss" title="Eliminar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] text-sm">
            <span className="text-paper-500">
              {filtered.length} transacción{filtered.length !== 1 ? 'es' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-paper-500 text-xs">{currentPage} / {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  )
}
