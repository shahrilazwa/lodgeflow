import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { setAuthToken, clearAuthToken, hasAuthToken } from '@/lib/api'

interface Owner {
  id: number
  name: string
  email: string
}

interface AuthResponse {
  data: {
    owner: Owner
    token: string
  }
}

interface MeResponse {
  data: Owner
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

const AUTH_KEY = ['auth', 'me']

export function useAuth() {
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: AUTH_KEY,
    queryFn: async () => {
      const { data } = await api.get<MeResponse>('/auth/me')
      return data.data
    },
    enabled: hasAuthToken(),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginData) => {
      const { data } = await api.post<AuthResponse>('/auth/login', payload)
      return data.data
    },
    onSuccess: (data) => {
      setAuthToken(data.token)
      queryClient.setQueryData(AUTH_KEY, data.owner)
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterData) => {
      const { data } = await api.post<AuthResponse>('/auth/register', payload)
      return data.data
    },
    onSuccess: (data) => {
      setAuthToken(data.token)
      queryClient.setQueryData(AUTH_KEY, data.owner)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => {
      clearAuthToken()
      queryClient.clear()
    },
    onError: () => {
      // Even if logout API fails, clear local state
      clearAuthToken()
      queryClient.clear()
    },
  })

  return {
    owner: meQuery.data ?? null,
    isAuthenticated: hasAuthToken(),
    isLoading: meQuery.isLoading,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
  }
}
