import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CreateExpenseData, Expense, UpdateExpenseData } from './types'

const EXPENSES_KEY = ['expenses']

interface ExpenseFilters {
  category?: string
  property_id?: string
  from_date?: string
  to_date?: string
}

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters?.category) params.category = filters.category
      if (filters?.property_id) params.property_id = filters.property_id
      if (filters?.from_date) params.from_date = filters.from_date
      if (filters?.to_date) params.to_date = filters.to_date
      const { data } = await api.get<{ data: Expense[] }>('/expenses', { params })
      return data.data
    },
  })
}

export function useExpense(id: number) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Expense }>(`/expenses/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateExpenseData) => {
      const { data } = await api.post<{ data: Expense }>('/expenses', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
    },
  })
}

export function useUpdateExpense(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateExpenseData) => {
      const { data } = await api.put<{ data: Expense }>(`/expenses/${id}`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/expenses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
    },
  })
}
