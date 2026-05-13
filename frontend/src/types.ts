export interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
}

export type NewTransaction = Omit<Transaction, 'id'>

export const CATEGORIES = [
  'food',
  'housing',
  'utilities',
  'transport',
  'entertainment',
  'salary',
  'other',
] as const

export type Category = (typeof CATEGORIES)[number]
