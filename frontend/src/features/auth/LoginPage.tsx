import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse, ValidationErrorResponse } from '@/types/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoggingIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setGeneralError('')

    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      const axiosErr = err as AxiosError<ValidationErrorResponse | ApiErrorResponse>
      if (axiosErr.response?.status === 422 && 'errors' in (axiosErr.response.data ?? {})) {
        setErrors((axiosErr.response.data as ValidationErrorResponse).errors)
      } else if (axiosErr.response?.status === 401) {
        setGeneralError('The provided credentials are incorrect.')
      } else {
        setGeneralError('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
    <div>
      <h1 className="auth-title">Log in to LodgeFlow</h1>
      <p className="auth-subtitle">Welcome back. Manage bookings, rooms and guests from one workspace.</p>

      {generalError && <div className="auth-alert">{generalError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="email" className="auth-label">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" autoComplete="email" placeholder="yourname@example.com" required />
          {errors.email && <p className="auth-error">{errors.email[0]}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="password" className="auth-label">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" autoComplete="current-password" placeholder="Enter your password" required />
          {errors.password && <p className="auth-error">{errors.password[0]}</p>}
        </div>

        <button type="submit" disabled={isLoggingIn} className="auth-submit">
          {isLoggingIn ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="auth-helper">
        Need an account? <Link to="/register" className="auth-link">Create account</Link>
      </p>
    </div>
  )
}
