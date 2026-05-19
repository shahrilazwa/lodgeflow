import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Booking, BookingFilters, CreateBookingData, UpdateBookingData } from './types'

const BOOKINGS_KEY = ['bookings']

export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters?.status) params.status = filters.status
      if (filters?.unit_id) params.unit_id = filters.unit_id
      if (filters?.from_date) params.from_date = filters.from_date
      if (filters?.to_date) params.to_date = filters.to_date
      const { data } = await api.get<{ data: Booking[] }>('/bookings', { params })
      return data.data
    },
  })
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Booking }>(`/bookings/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBookingData) => {
      const { data } = await api.post<{ data: Booking }>('/bookings', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
    },
  })
}

export function useUpdateBooking(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateBookingData) => {
      const { data } = await api.put<{ data: Booking }>(`/bookings/${id}`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
    },
  })
}

export function useConfirmBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<{ data: Booking }>(`/bookings/${id}/confirm`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
    },
  })
}

export function useCheckInBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<{ data: Booking }>(`/bookings/${id}/check-in`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
    },
  })
}

export function useCheckOutBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<{ data: Booking }>(`/bookings/${id}/check-out`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<{ data: Booking }>(`/bookings/${id}/cancel`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
    },
  })
}
