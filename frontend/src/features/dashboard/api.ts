import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface FrontDeskOverview {
  date: string
  active_units: number
  occupied_units: number
  occupancy_rate: number
  check_ins_today: number
  check_outs_today: number
  pending_payments: number
  pending_cleaning: number
  open_maintenance: number
}

export function useDashboardFrontDeskOverview() {
  return useQuery({
    queryKey: ['dashboard', 'front-desk-overview'],
    queryFn: async () => {
      const { data } = await api.get<{ data: FrontDeskOverview }>('/dashboard/front-desk-overview')
      return data.data
    },
  })
}

export function useDashboardIncome() {
  return useQuery({
    queryKey: ['dashboard', 'income'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { total: number } }>('/dashboard/income')
      return data.data.total
    },
  })
}

export function useDashboardExpenses() {
  return useQuery({
    queryKey: ['dashboard', 'expenses'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { total: number } }>('/dashboard/expenses')
      return data.data.total
    },
  })
}

export function useDashboardNetProfit() {
  return useQuery({
    queryKey: ['dashboard', 'net-profit'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { total: number } }>('/dashboard/net-profit')
      return data.data.total
    },
  })
}

export function useDashboardOutstanding() {
  return useQuery({
    queryKey: ['dashboard', 'outstanding'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { total: number } }>('/dashboard/outstanding')
      return data.data.total
    },
  })
}

interface BookingCounts {
  confirmed: number
  checked_in: number
  checked_out: number
  cancelled: number
}

export function useDashboardBookingCounts() {
  return useQuery({
    queryKey: ['dashboard', 'booking-counts'],
    queryFn: async () => {
      const { data } = await api.get<{ data: BookingCounts }>('/dashboard/booking-counts')
      return data.data
    },
  })
}

interface CleaningTaskItem {
  id: number
  status: string
  unit?: { id: number; name: string }
}

export function useDashboardPendingCleaning() {
  return useQuery({
    queryKey: ['dashboard', 'pending-cleaning'],
    queryFn: async () => {
      const { data } = await api.get<{ data: CleaningTaskItem[] }>('/dashboard/pending-cleaning')
      return data.data
    },
  })
}

interface MaintenanceTaskItem {
  id: number
  title: string
  status: string
  priority: string
  property?: { id: number; name: string } | null
}

export function useDashboardPendingMaintenance() {
  return useQuery({
    queryKey: ['dashboard', 'pending-maintenance'],
    queryFn: async () => {
      const { data } = await api.get<{ data: MaintenanceTaskItem[] }>('/dashboard/pending-maintenance')
      return data.data
    },
  })
}
