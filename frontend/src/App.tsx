import { useState } from 'react'
import './App.css'
import Summary from './components/Summary'
import SpendingByCategory from './components/SpendingByCategory'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import Clock from './components/Clock'
import { Transaction, NewTransaction, CATEGORIES } from './types'
import HealthStatus from './components/HealthStatus'

let nextId = 9

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, description: 'Salary', amount: 5000, type: 'income', category: 'salary', date: '2025-01-01' },
  { id: 2, description: 'Rent', amount: 1200, type: 'expense', category: 'housing', date: '2025-01-02' },
  { id: 3, description: 'Groceries', amount: 150, type: 'expense', category: 'food', date: '2025-01-03' },
  { id: 4, description: 'Freelance Work', amount: 800, type: 'income', category: 'salary', date: '2025-01-05' },
  { id: 5, description: 'Electric Bill', amount: 95, type: 'expense', category: 'utilities', date: '2025-01-06' },
  { id: 6, description: 'Dinner Out', amount: 65, type: 'expense', category: 'food', date: '2025-01-07' },
  { id: 7, description: 'Gas', amount: 45, type: 'expense', category: 'transport', date: '2025-01-08' },
  { id: 8, description: 'Netflix', amount: 15, type: 'expense', category: 'entertainment', date: '2025-01-10' },
]

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)

  const addTransaction = (transaction: NewTransaction) => {
    setTransactions(prev => [...prev, { ...transaction, id: nextId++ }])
  }

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const today = new Date()
  const stardate = `FY26.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead-cluster">
          <span className="masthead-tag">BR-04</span>
          <span className="masthead-link">
            <span className="dot" /> SECURE CHANNEL
          </span>
          <Clock />
        </div>
        <div className="masthead-sector">
          OPERATOR <span className="accent">// ALEXANDRU B.</span> · {stardate}
        </div>
      </header>

      <Summary transactions={transactions} />

      <section className="section">
        <div className="section-head">
          <span className="section-eyebrow">02 / 04</span>
          <h2 className="section-title">Expenditure Distribution</h2>
          <span className="section-status"><span className="dot" /> LIVE</span>
        </div>
        <SpendingByCategory transactions={transactions} />
      </section>

      <section className="section">
        <div className="section-head">
          <span className="section-eyebrow">03 / 04</span>
          <h2 className="section-title">Manual Log Entry</h2>
          <span className="section-status">INPUT READY</span>
        </div>
        <TransactionForm categories={[...CATEGORIES]} onAdd={addTransaction} />
      </section>

      <section className="section">
        <div className="section-head">
          <span className="section-eyebrow">04 / 04</span>
          <h2 className="section-title">Transaction Archive</h2>
          <span className="section-status">
            <span className="dot" />
            {transactions.length} REC
          </span>
        </div>
        <TransactionList
          transactions={transactions}
          categories={[...CATEGORIES]}
          onDelete={deleteTransaction}
        />
      </section>

      <HealthStatus />
    </div>
  )
}

export default App
