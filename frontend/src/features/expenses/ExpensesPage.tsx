import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useExpenses, useDeleteExpense } from './api'
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from './types'
import type { Expense } from './types'

export default function ExpensesPage() {
  const [filters, setFilters] = useState<{ category?: string; from_date?: string; to_date?: string }>({})
  const { data: expenses, isLoading, error } = useExpenses(filters)
  const deleteMutation = useDeleteExpense()

  if (error) return <div style={{ color: 'red' }}>Error loading expenses.</div>

  function handleDelete(id: number) {
    if (confirm('Delete this expense?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Expenses</h2>
        <Link to="/expenses/create" style={linkButtonStyle}>+ New Expense</Link>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
          style={selectStyle}
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <input type="date" value={filters.from_date || ''} onChange={(e) => setFilters({ ...filters, from_date: e.target.value || undefined })} style={selectStyle} />
        <input type="date" value={filters.to_date || ''} onChange={(e) => setFilters({ ...filters, to_date: e.target.value || undefined })} style={selectStyle} />
      </div>

      {isLoading && <div>Loading expenses...</div>}

      {expenses && expenses.length === 0 && <p style={{ color: '#666' }}>No expenses found.</p>}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {expenses?.map((expense: Expense) => (
          <div key={expense.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={categoryBadge}>{EXPENSE_CATEGORY_LABELS[expense.category]}</span>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 500 }}>RM {Number(expense.amount).toFixed(2)}</p>
                <p style={{ margin: '0.15rem 0 0', color: '#777', fontSize: '0.8rem' }}>{expense.date}</p>
                {expense.description && <p style={{ margin: '0.15rem 0 0', color: '#666', fontSize: '0.8rem' }}>{expense.description}</p>}
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <Link to={`/expenses/${expense.id}/edit`} style={smallBtnStyle}>Edit</Link>
              <button type="button" onClick={() => handleDelete(expense.id)} style={smallBtnDanger}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fff' }
const linkButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem' }
const smallBtnStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'none', color: '#333', backgroundColor: '#fff' }
const smallBtnDanger: React.CSSProperties = { ...smallBtnStyle, color: '#dc3545', borderColor: '#dc3545' }
const selectStyle: React.CSSProperties = { padding: '0.4rem', border: '1px solid #ccc', borderRadius: '0.375rem', fontSize: '0.875rem' }
const categoryBadge: React.CSSProperties = { backgroundColor: '#e8f4fd', color: '#0c5460', padding: '0.15rem 0.4rem', borderRadius: '0.2rem', fontSize: '0.7rem', fontWeight: 500 }
