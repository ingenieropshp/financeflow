import type { Category, CategoryWithSpend, Transaction } from '../types'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export function isSameMonth(dateStr: string, ref: Date): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

export function currentMonthTransactions(transactions: Transaction[], ref: Date = new Date()): Transaction[] {
  return transactions.filter((t) => isSameMonth(t.date, ref))
}

export function sumByType(transactions: Transaction[], type: 'income' | 'expense'): number {
  return transactions.filter((t) => t.type === type).reduce((acc, t) => acc + Number(t.amount), 0)
}

export function buildCategoryTree(categories: Category[], transactions: Transaction[], ref: Date = new Date()): CategoryWithSpend[] {
  const monthTx = currentMonthTransactions(transactions, ref).filter((t) => t.type === 'expense')
  const spendByCategory = new Map<string, number>()
  monthTx.forEach((t) => {
    if (!t.category_id) return
    spendByCategory.set(t.category_id, (spendByCategory.get(t.category_id) || 0) + Number(t.amount))
  })

  const toNode = (cat: Category): CategoryWithSpend => {
    const children = categories.filter((c) => c.parent_id === cat.id).map(toNode)
    const ownSpent = spendByCategory.get(cat.id) || 0
    const spent = ownSpent + children.reduce((acc, c) => acc + c.spent, 0)
    const remaining = Number(cat.monthly_budget) - spent
    const percent = Number(cat.monthly_budget) > 0 ? (spent / Number(cat.monthly_budget)) * 100 : 0
    return { ...cat, spent, remaining, percent, subcategories: children }
  }

  return categories.filter((c) => !c.parent_id).map(toNode)
}

export function flattenCategories(categories: Category[]): Category[] {
  return categories
}

export function monthlySeries(transactions: Transaction[], months = 6): { label: string; ingresos: number; gastos: number }[] {
  const now = new Date()
  const result: { label: string; ingresos: number; gastos: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthTx = currentMonthTransactions(transactions, ref)
    result.push({
      label: new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(ref),
      ingresos: sumByType(monthTx, 'income'),
      gastos: sumByType(monthTx, 'expense'),
    })
  }
  return result
}

export const CATEGORY_COLOR_PALETTE = [
  '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#3B82F6',
  '#EC4899', '#14B8A6', '#A855F7', '#F97316', '#84CC16',
]

export const DEFAULT_CATEGORIES = [
  'Vivienda', 'Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 'Ahorro', 'Otros',
]
