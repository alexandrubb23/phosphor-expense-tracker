import { useState } from 'react'
import { NewTransaction } from '../types'

interface TransactionFormProps {
  categories: string[]
  onAdd: (transaction: NewTransaction) => void
}

interface FormErrors {
  description?: string
  amount?: string
}

function TransactionForm({ categories, onAdd }: TransactionFormProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState('food')
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    const trimmedDescription = description.trim()

    if (!trimmedDescription) {
      next.description = 'Description is required'
    } else if (trimmedDescription.length > 80) {
      next.description = 'Description must be 80 characters or fewer'
    }

    const parsedAmount = Number(amount)
    if (amount.trim() === '') {
      next.amount = 'Amount is required'
    } else if (!Number.isFinite(parsedAmount)) {
      next.amount = 'Amount must be a number'
    } else if (parsedAmount <= 0) {
      next.amount = 'Amount must be greater than 0'
    }

    return next
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onAdd({
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      date: new Date().toISOString().split('T')[0],
    })

    setDescription('')
    setAmount('')
    setType('expense')
    setCategory('food')
    setErrors({})
  }

  const clearError = (field: keyof FormErrors) => {
    if (!errors[field]) return
    setErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="add-transaction">
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          placeholder="▸ describe entry"
          value={description}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'error-description' : undefined}
          onChange={e => {
            setDescription(e.target.value)
            clearError('description')
          }}
        />
        <input
          type="number"
          placeholder="▸ amount"
          value={amount}
          min="0.01"
          step="0.01"
          aria-invalid={!!errors.amount}
          aria-describedby={errors.amount ? 'error-amount' : undefined}
          onChange={e => {
            setAmount(e.target.value)
            clearError('amount')
          }}
        />
        <select value={type} onChange={e => setType(e.target.value as 'income' | 'expense')}>
          <option value="income">Inflow</option>
          <option value="expense">Outflow</option>
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button type="submit">▸ Transmit</button>
      </form>

      {hasErrors && (
        <div className="form-errors" role="alert" aria-live="polite">
          {errors.description && (
            <div id="error-description" className="form-error">
              ▸ {errors.description}
            </div>
          )}
          {errors.amount && (
            <div id="error-amount" className="form-error">
              ▸ {errors.amount}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TransactionForm
