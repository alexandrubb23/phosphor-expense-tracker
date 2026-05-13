import { Transaction } from '../types'

interface SummaryProps {
  transactions: Transaction[]
}

function Summary({ transactions }: SummaryProps) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses
  const isNegative = balance < 0

  const fmt = (n: number) =>
    Math.abs(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  return (
    <section className="hero">
      <div className="hud-frame">
        <span className="bracket-bl" />
        <span className="bracket-br" />

        <div className="hero-meta">
          <span className="hero-meta-label">
            {isNegative ? 'NET / DEFICIT' : 'NET / POSITION'}
          </span>
          <span className="hero-meta-id">
            CH·01 <span className="accent">// REAL-TIME</span>
          </span>
        </div>

        <div className="hero-balance-wrap">
          <div className={`hero-balance ${isNegative ? 'negative' : ''}`}>
            <span className="hero-currency">{isNegative ? '−$' : '$'}</span>
            {fmt(balance)}
          </div>
        </div>

        <div className="hero-readout">
          <div className="hero-readout-cell">
            <span className="channel">CH·02</span>
            <span className="hero-readout-label">Inflow</span>
            <span className="hero-readout-value income">
              <span className="glyph">▲</span>${fmt(totalIncome)}
            </span>
          </div>
          <div className="hero-readout-cell">
            <span className="channel">CH·03</span>
            <span className="hero-readout-label">Outflow</span>
            <span className="hero-readout-value expense">
              <span className="glyph">▼</span>${fmt(totalExpenses)}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Summary
