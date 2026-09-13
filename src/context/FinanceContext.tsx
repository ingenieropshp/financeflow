import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import type { Category, Transaction, Debt, Pot, TransactionType, PaymentMethod } from '../types'

interface NewTransactionInput {
  type: TransactionType
  amount: number
  category_id: string | null
  date: string
  payment_method: PaymentMethod
  notes: string | null
}

interface FinanceContextValue {
  loading: boolean
  categories: Category[]
  transactions: Transaction[]
  debts: Debt[]
  pots: Pot[]
  refreshAll: () => Promise<void>
  addTransaction: (input: NewTransactionInput) => Promise<{ error: string | null }>
  updateTransaction: (id: string, input: Partial<NewTransactionInput>) => Promise<{ error: string | null }>
  deleteTransaction: (id: string) => Promise<{ error: string | null }>
  addCategory: (name: string, parent_id: string | null, monthly_budget: number, color: string) => Promise<{ error: string | null }>
  updateCategory: (id: string, fields: Partial<Pick<Category, 'name' | 'monthly_budget' | 'color'>>) => Promise<{ error: string | null }>
  deleteCategory: (id: string) => Promise<{ error: string | null }>
  addDebt: (debt: Omit<Debt, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  updateDebt: (id: string, fields: Partial<Debt>) => Promise<{ error: string | null }>
  deleteDebt: (id: string) => Promise<{ error: string | null }>
  makeDebtPayment: (id: string, amount: number) => Promise<{ error: string | null }>
  addPot: (name: string, target_amount: number) => Promise<{ error: string | null }>
  deletePot: (id: string) => Promise<{ error: string | null }>
  moveMoneyToPot: (pot: Pot, amount: number) => Promise<{ error: string | null }>
  withdrawMoneyFromPot: (pot: Pot, amount: number) => Promise<{ error: string | null }>
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [pots, setPots] = useState<Pot[]>([])

  const refreshAll = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [c, t, d, p] = await Promise.all([
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('debts').select('*').order('total_balance', { ascending: true }),
      supabase.from('pots').select('*').order('created_at', { ascending: true }),
    ])
    setCategories((c.data as Category[]) || [])
    setTransactions((t.data as Transaction[]) || [])
    setDebts((d.data as Debt[]) || [])
    setPots((p.data as Pot[]) || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (user) refreshAll()
    else {
      setCategories([])
      setTransactions([])
      setDebts([])
      setPots([])
      setLoading(false)
    }
  }, [user, refreshAll])

  const addTransaction = async (input: NewTransactionInput) => {
    if (!user) return { error: 'No autenticado' }
    const { error } = await supabase.from('transactions').insert({ ...input, user_id: user.id })
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const updateTransaction = async (id: string, input: Partial<NewTransactionInput>) => {
    const { error } = await supabase.from('transactions').update(input).eq('id', id)
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const addCategory = async (name: string, parent_id: string | null, monthly_budget: number, color: string) => {
    if (!user) return { error: 'No autenticado' }
    const { error } = await supabase
      .from('categories')
      .insert({ name, parent_id, monthly_budget, color, user_id: user.id })
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const updateCategory = async (id: string, fields: Partial<Pick<Category, 'name' | 'monthly_budget' | 'color'>>) => {
    const { error } = await supabase.from('categories').update(fields).eq('id', id)
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const addDebt = async (debt: Omit<Debt, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'No autenticado' }
    const { error } = await supabase.from('debts').insert({ ...debt, user_id: user.id })
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const updateDebt = async (id: string, fields: Partial<Debt>) => {
    const { error } = await supabase.from('debts').update(fields).eq('id', id)
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const deleteDebt = async (id: string) => {
    const { error } = await supabase.from('debts').delete().eq('id', id)
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const makeDebtPayment = async (id: string, amount: number) => {
    const debt = debts.find((d) => d.id === id)
    if (!debt) return { error: 'Deuda no encontrada' }
    const newBalance = Math.max(0, debt.total_balance - amount)
    const { error } = await supabase.from('debts').update({ total_balance: newBalance }).eq('id', id)
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const addPot = async (name: string, target_amount: number) => {
    if (!user) return { error: 'No autenticado' }
    const { error } = await supabase
      .from('pots')
      .insert({ name, target_amount, current_amount: 0, user_id: user.id })
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const deletePot = async (id: string) => {
    const { error } = await supabase.from('pots').delete().eq('id', id)
    if (!error) await refreshAll()
    return { error: error?.message || null }
  }

  const moveMoneyToPot = async (pot: Pot, amount: number) => {
    if (!user || amount <= 0) return { error: 'Monto inválido' }
    const { error: e1 } = await supabase
      .from('pots')
      .update({ current_amount: pot.current_amount + amount })
      .eq('id', pot.id)
    if (e1) return { error: e1.message }
    const { error: e2 } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'expense',
      amount,
      category_id: null,
      date: new Date().toISOString().slice(0, 10),
      payment_method: 'transfer',
      notes: `Aporte a meta de ahorro: ${pot.name}`,
    })
    await refreshAll()
    return { error: e2?.message || null }
  }

  const withdrawMoneyFromPot = async (pot: Pot, amount: number) => {
    if (!user || amount <= 0) return { error: 'Monto inválido' }
    const nuevoMonto = Math.max(0, pot.current_amount - amount)
    const { error: e1 } = await supabase.from('pots').update({ current_amount: nuevoMonto }).eq('id', pot.id)
    if (e1) return { error: e1.message }
    const { error: e2 } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'income',
      amount,
      category_id: null,
      date: new Date().toISOString().slice(0, 10),
      payment_method: 'transfer',
      notes: `Retiro de meta de ahorro: ${pot.name}`,
    })
    await refreshAll()
    return { error: e2?.message || null }
  }

  const value = useMemo(
    () => ({
      loading,
      categories,
      transactions,
      debts,
      pots,
      refreshAll,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      addDebt,
      updateDebt,
      deleteDebt,
      makeDebtPayment,
      addPot,
      deletePot,
      moveMoneyToPot,
      withdrawMoneyFromPot,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, categories, transactions, debts, pots]
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance debe usarse dentro de FinanceProvider')
  return ctx
}
