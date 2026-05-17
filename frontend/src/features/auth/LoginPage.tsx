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
      <h2 style={{ marginBottom: '1.5rem' }}>Login to LodgeFlow</h2>

      {generalError && (
        <div style={alertStyle}>{generalError}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            autoComplete="email"
            required
          />
          {errors.email && <p style={errorStyle}>{errors.email[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="password" style={labelStyle}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="current-password"
            required
          />
          {errors.password && <p style={errorStyle}>{errors.password[0]}</p>}
        </div>

        <button type="submit" disabled={isLoggingIn} style={submitBtnStyle}>
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}

const fieldStyle: React.CSSProperties = { marginBottom: '1rem' }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box' }
const errorStyle: React.CSSProperties = { color: '#dc3545', fontSize: '0.8rem', margin: '0.25rem 0 0' }
const alertStyle: React.CSSProperties = { backgroundColor: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }
const submitBtnStyle: React.CSSProperties = { width: '100%', padding: '0.625rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }
