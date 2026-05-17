import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CreatePaymentData, Payment } from './types'

const PAYMENTS_KEY = ['payments']

export function usePaymentsForBooking(bookingId: number) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, 'booking', bookingId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Payment[] }>(`/bookings/${bookingId}/payments`)
      return data.data
    },
    enabled: !!bookingId,
  })
}

export function useCreatePayment(bookingId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreatePaymentData) => {
      const { data } = await api.post<{ data: Payment }>(`/bookings/${bookingId}/payments`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYMENTS_KEY, 'booking', bookingId] })
      queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useDeletePayment(bookingId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (paymentId: number) => {
      await api.delete(`/bookings/${bookingId}/payments/${paymentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYMENTS_KEY, 'booking', bookingId] })
      queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
