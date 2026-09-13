export type TransactionType = 'income' | 'expense'
export type PaymentMethod = 'cash' | 'card' | 'transfer'

export interface Category {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  monthly_budget: number
  color: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category_id: string | null
  date: string
  payment_method: PaymentMethod
  notes: string | null
  created_at: string
}

export interface Debt {
  id: string
  user_id: string
  name: string
  total_balance: number
  original_balance: number
  min_payment: number
  interest_rate: number
  created_at: string
}

export interface Pot {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  created_at: string
}

export interface CategoryWithSpend extends Category {
  spent: number
  remaining: number
  percent: number
  subcategories: CategoryWithSpend[]
}
