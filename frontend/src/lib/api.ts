import axios from 'axios'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/api'

const AUTH_TOKEN_KEY = 'lodgeflow_token'

/**
 * Shared Axios instance for all API calls.
 * Base URL reads from VITE_API_URL environment variable.
 * Falls back to '/api' which works with the Vite proxy in development.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Request interceptor: inject Bearer token from localStorage.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

/**
 * Response interceptor: catch 401 responses, clear token, redirect to /login.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      // Redirect to login page — only if not already on login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/**
 * Helper to store auth token after login/register.
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

/**
 * Helper to clear auth token on logout.
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

/**
 * Helper to check if a token exists in localStorage.
 */
export function hasAuthToken(): boolean {
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null
}

export default api
