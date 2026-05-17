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
      <h2 style={headingStyle}>Welcome back</h2>
      <p style={subheadingStyle}>Sign in to your LodgeFlow account</p>

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
            placeholder="you@example.com"
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
            placeholder="••••••••"
            required
          />
          {errors.password && <p style={errorStyle}>{errors.password[0]}</p>}
        </div>

        <button type="submit" disabled={isLoggingIn} style={submitBtnStyle}>
          {isLoggingIn ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={switchStyle}>
        Don't have an account? <Link to="/register" style={linkStyle}>Create one</Link>
      </p>
    </div>
  )
}

const headingStyle: React.CSSProperties = { margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e' }
const subheadingStyle: React.CSSProperties = { margin: '0 0 1.75rem', fontSize: '0.9rem', color: '#666' }
const fieldStyle: React.CSSProperties = { marginBottom: '1.25rem' }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: '#333' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }
const errorStyle: React.CSSProperties = { color: '#dc3545', fontSize: '0.8rem', margin: '0.3rem 0 0' }
const alertStyle: React.CSSProperties = { backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', border: '1px solid #fecaca' }
const submitBtnStyle: React.CSSProperties = { width: '100%', padding: '0.7rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }
const switchStyle: React.CSSProperties = { marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#666' }
const linkStyle: React.CSSProperties = { color: '#1a1a2e', fontWeight: 600, textDecoration: 'none' }
