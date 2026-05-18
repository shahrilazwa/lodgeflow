import { useState } from 'react'
import { Button, ButtonLink, ContentCard, EmptyState, PageHeader, PageLayout, StatusBadge, TextInput } from '@/components/ui/Page'
import { useExpenses, useDeleteExpense } from './api'
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from './types'
import type { Expense } from './types'

type Tone = 'success' | 'danger' | 'warning' | 'neutral' | 'info'

export default function ExpensesPage() {
  const [filters, setFilters] = useState<{ category?: string; from_date?: string; to_date?: string }>({})
  const { data: expenses, isLoading, error } = useExpenses(filters)
  const deleteMutation = useDeleteExpense()

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Expenses" description="Track operational spending across properties." />
        <ContentCard><p style={{ margin: 0, color: '#dc2626' }}>Error loading expenses.</p></ContentCard>
      </PageLayout>
    )
  }

  function handleDelete(id: number) {
    if (confirm('Delete this expense?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <PageLayout>
      <PageHeader eyebrow="Expenses" title="Expenses" description="Track property costs, service provider charges and operational expenses." action={<ButtonLink to="/expenses/create" variant="primary">+ New Expense</ButtonLink>} />

      <ContentCard>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={filters.category || ''} onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })} className="ui-input" style={{ maxWidth: '240px' }}>
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((category) => <option key={category} value={category}>{EXPENSE_CATEGORY_LABELS[category]}</option>)}
          </select>
          <TextInput type="date" value={filters.from_date || ''} onChange={(e) => setFilters({ ...filters, from_date: e.target.value || undefined })} style={{ maxWidth: '180px' }} />
          <TextInput type="date" value={filters.to_date || ''} onChange={(e) => setFilters({ ...filters, to_date: e.target.value || undefined })} style={{ maxWidth: '180px' }} />
        </div>
      </ContentCard>

      {isLoading && <ContentCard>Loading expenses...</ContentCard>}
      {expenses && expenses.length === 0 && <EmptyState title="No expenses found" description="Create a new expense or adjust the filters to review other records." action={<ButtonLink to="/expenses/create" variant="primary">+ New Expense</ButtonLink>} />}

      <div style={{ display: 'grid', gap: '14px', marginTop: '14px' }}>
        {expenses?.map((expense: Expense) => (
          <ContentCard key={expense.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <StatusBadge tone={categoryTone(expense.category)}>{EXPENSE_CATEGORY_LABELS[expense.category]}</StatusBadge>
                <h2 style={{ margin: '10px 0 4px', color: '#18181b', fontSize: '1rem', fontWeight: 800 }}>RM {Number(expense.amount).toFixed(2)}</h2>
                <p style={{ margin: 0, color: '#52525b', fontSize: '0.86rem' }}>{expense.date}</p>
                {expense.description && <p style={{ margin: '6px 0 0', color: '#71717a', fontSize: '0.8rem' }}>{expense.description}</p>}
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ButtonLink to={`/expenses/${expense.id}/edit`} size="sm">Edit</ButtonLink>
              <Button type="button" size="sm" variant="danger" onClick={() => handleDelete(expense.id)}>Delete</Button>
            </div>
          </ContentCard>
        ))}
      </div>
    </PageLayout>
  )
}

function categoryTone(category: string): Tone {
  const tones: Record<string, Tone> = {
    cleaning: 'info',
    maintenance: 'warning',
    supplies: 'success',
    utilities: 'neutral',
    other: 'neutral',
  }
  return tones[category] ?? 'neutral'
}
