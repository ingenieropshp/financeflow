import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency } from '../lib/finance'
import ProgressBar from '../components/ui/ProgressBar'
import DebtModal from '../components/modals/DebtModal'
import DebtPaymentModal from '../components/modals/DebtPaymentModal'
import PotModal from '../components/modals/PotModal'
import PotFundsModal from '../components/modals/PotFundsModal'
import type { Debt, Pot } from '../types'

export default function DebtsAndPots() {
  const { debts, pots, deleteDebt, deletePot, loading } = useFinance()

  const [debtModalOpen, setDebtModalOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null)

  const [potModalOpen, setPotModalOpen] = useState(false)
  const [fundsModal, setFundsModal] = useState<{ pot: Pot; mode: 'add' | 'withdraw' } | null>(null)

  const sortedDebts = [...debts].sort((a, b) => a.total_balance - b.total_balance)
  const targetDebtId = sortedDebts.find((d) => d.total_balance > 0)?.id

  if (loading) return <div className="h-64 card animate-pulse" />

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-paper-100">Bola de nieve de deudas</h1>
            <p className="text-sm text-paper-500 mt-1">Ordenadas de menor a mayor saldo — método Dave Ramsey.</p>
          </div>
          <button onClick={() => { setEditingDebt(null); setDebtModalOpen(true) }} className="btn-primary">
            <PlusIcon /> Nueva deuda
          </button>
        </div>

        {sortedDebts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-paper-100 font-medium">No tienes deudas registradas.</p>
            <p className="text-sm text-paper-500 mt-1">Añade tus deudas para trazar tu plan de pago.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {sortedDebts.map((debt) => {
              const isTarget = debt.id === targetDebtId
              const paidOff = Math.max(0, debt.original_balance - debt.total_balance)
              const percentPaid = debt.original_balance > 0 ? (paidOff / debt.original_balance) * 100 : 0
              const isCleared = debt.total_balance <= 0
              return (
                <div key={debt.id} className={`card p-5 ${isTarget ? 'ring-1 ring-gain/50' : ''}`}>
                  {isTarget && (
                    <span className="inline-block mb-3 rounded-sm bg-gain/10 px-2 py-1 text-[11px] font-semibold text-gain">
                      Deuda objetivo actual
                    </span>
                  )}
                  {isCleared && (
                    <span className="inline-block mb-3 rounded-sm bg-gain/10 px-2 py-1 text-[11px] font-semibold text-gain">
                      Liquidada 🎉
                    </span>
                  )}
                  <div className="flex items-start justify-between">
                    <h3 className="font-display font-bold text-paper-100">{debt.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingDebt(debt); setDebtModalOpen(true) }} className="icon-btn" title="Editar"><EditIcon /></button>
                      <button
                        onClick={() => { if (confirm('¿Eliminar esta deuda?')) deleteDebt(debt.id) }}
                        className="icon-btn hover:!text-loss" title="Eliminar"
                      ><TrashIcon /></button>
                    </div>
                  </div>

                  <p className="num text-2xl font-display font-extrabold text-paper-100 mt-2 break-words">{formatCurrency(debt.total_balance)}</p>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-[11px] text-paper-500">Pago mínimo</p>
                      <p className="num text-paper-100">{formatCurrency(debt.min_payment)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-paper-500">Tasa de interés</p>
                      <p className="num text-paper-100">{debt.interest_rate}%</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ProgressBar percent={percentPaid} />
                    <p className="mt-1 text-xs text-paper-500">{percentPaid.toFixed(0)}% pagado de {formatCurrency(debt.original_balance)}</p>
                  </div>

                  {!isCleared && (
                    <button onClick={() => setPayingDebt(debt)} className="btn-secondary w-full mt-4">Registrar pago</button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-paper-100">Metas de ahorro</h1>
            <p className="text-sm text-paper-500 mt-1">Tus huchas para objetivos específicos.</p>
          </div>
          <button onClick={() => setPotModalOpen(true)} className="btn-primary">
            <PlusIcon /> Nueva meta
          </button>
        </div>

        {pots.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-paper-100 font-medium">Aún no tienes metas de ahorro.</p>
            <p className="text-sm text-paper-500 mt-1">Crea una meta como "Fondo de emergencia" o "Vacaciones".</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pots.map((pot) => {
              const percent = pot.target_amount > 0 ? (pot.current_amount / pot.target_amount) * 100 : 0
              return (
                <div key={pot.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display font-bold text-paper-100">{pot.name}</h3>
                    <button
                      onClick={() => { if (confirm('¿Eliminar esta meta de ahorro?')) deletePot(pot.id) }}
                      className="icon-btn hover:!text-loss" title="Eliminar"
                    ><TrashIcon /></button>
                  </div>
                  <p className="num text-2xl font-display font-extrabold text-gain mt-2 break-words">{formatCurrency(pot.current_amount)}</p>
                  <p className="text-xs text-paper-500">de {formatCurrency(pot.target_amount)} objetivo</p>
                  <div className="mt-3">
                    <ProgressBar percent={percent} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button onClick={() => setFundsModal({ pot, mode: 'add' })} className="btn-primary !py-2 text-sm">+ Añadir</button>
                    <button onClick={() => setFundsModal({ pot, mode: 'withdraw' })} className="btn-secondary !py-2 text-sm">- Retirar</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <DebtModal open={debtModalOpen} onClose={() => setDebtModalOpen(false)} editing={editingDebt} />
      <DebtPaymentModal open={!!payingDebt} onClose={() => setPayingDebt(null)} debt={payingDebt} />
      <PotModal open={potModalOpen} onClose={() => setPotModalOpen(false)} />
      <PotFundsModal
        open={!!fundsModal}
        onClose={() => setFundsModal(null)}
        pot={fundsModal?.pot || null}
        mode={fundsModal?.mode || 'add'}
      />
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
