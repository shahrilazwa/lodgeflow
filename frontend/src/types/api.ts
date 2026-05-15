/**
 * Standard API response types for LodgeFlow backend.
 */

/** Successful API response wrapper */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

/** Validation error response (HTTP 422) */
export interface ValidationErrorResponse {
  message: string
  errors: Record<string, string[]>
}

/** General API error response (HTTP 4xx/5xx) */
export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}

/** Auth token response from login/register */
export interface AuthTokenResponse {
  token: string
  owner: {
    id: number
    name: string
    email: string
  }
}
