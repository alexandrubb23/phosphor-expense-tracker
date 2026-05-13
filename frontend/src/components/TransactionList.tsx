import { useState } from 'react'
import { Transaction } from '../types'
import { CATEGORY_COLORS } from '../categoryColors'

interface TransactionListProps {
  transactions: Transaction[]
  categories: string[]
  onDelete: (id: number) => void
}

function TransactionList({ transactions, categories, onDelete }: TransactionListProps) {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm(`Delete "${transaction.description}"?`)) {
      onDelete(transaction.id)
    }
  }

  let filtered = transactions
  if (filterType !== 'all') filtered = filtered.filter(t => t.type === filterType)
  if (filterCategory !== 'all') filtered = filtered.filter(t => t.category === filterCategory)

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const shortHash = (id: number) => {
    const hex = (id ^ 0xa3f5).toString(16).toUpperCase().padStart(4, '0').slice(-4)
    return `TX-${hex}`
  }

  return (
    <div className="transactions">
      <div className="filters">
        <span className="filters-label">FILTER</span>
        <select value={filterType} onChange={e => setFilterType(e.target.value as 'all' | 'income' | 'expense')}>
          <option value="all">All Flows</option>
          <option value="income">Inflow</option>
          <option value="expense">Outflow</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>T·STAMP</th>
            <th>DESCRIPTOR</th>
            <th>CHANNEL</th>
            <th className="col-amount">DELTA</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(t => (
            <tr key={t.id}>
              <td className="col-id">{shortHash(t.id)}</td>
              <td className="col-date">{t.date}</td>
              <td className="col-description">{t.description}</td>
              <td className="col-category">
                <span className="tag">
                  <span
                    className="dot"
                    style={{ background: CATEGORY_COLORS[t.category] ?? '#5a7080' }}
                  />
                  {t.category}
                </span>
              </td>
              <td className={`col-amount ${t.type === 'income' ? 'income' : 'expense'}`}>
                {t.type === 'income' ? '+' : '−'}${fmt(t.amount)}
              </td>
              <td className="col-action">
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(t)}
                  aria-label={`Delete ${t.description}`}
                  title="Purge"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionList
