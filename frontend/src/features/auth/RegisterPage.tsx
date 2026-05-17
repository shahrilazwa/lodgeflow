import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isRegistering } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setGeneralError('')

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/dashboard')
    } catch (err) {
      const axiosErr = err as AxiosError<ValidationErrorResponse>
      if (axiosErr.response?.status === 422 && axiosErr.response.data?.errors) {
        setErrors(axiosErr.response.data.errors)
      } else {
        setGeneralError('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
    <div>
      <h2 style={headingStyle}>Create your account</h2>
      <p style={subheadingStyle}>Start managing your lodging business</p>

      {generalError && (
        <div style={alertStyle}>{generalError}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="name" style={labelStyle}>Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            autoComplete="name"
            placeholder="Your full name"
            required
          />
          {errors.name && <p style={errorStyle}>{errors.name[0]}</p>}
        </div>

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
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            required
            minLength={8}
          />
          {errors.password && <p style={errorStyle}>{errors.password[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="password_confirmation" style={labelStyle}>Confirm Password</label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            style={inputStyle}
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        <button type="submit" disabled={isRegistering} style={submitBtnStyle}>
          {isRegistering ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={switchStyle}>
        Already have an account? <Link to="/login" style={linkStyle}>Sign in</Link>
      </p>
    </div>
  )
}

const headingStyle: React.CSSProperties = { margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e' }
const subheadingStyle: React.CSSProperties = { margin: '0 0 1.75rem', fontSize: '0.9rem', color: '#666' }
const fieldStyle: React.CSSProperties = { marginBottom: '1.1rem' }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: '#333' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }
const errorStyle: React.CSSProperties = { color: '#dc3545', fontSize: '0.8rem', margin: '0.3rem 0 0' }
const alertStyle: React.CSSProperties = { backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', border: '1px solid #fecaca' }
const submitBtnStyle: React.CSSProperties = { width: '100%', padding: '0.7rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }
const switchStyle: React.CSSProperties = { marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#666' }
const linkStyle: React.CSSProperties = { color: '#1a1a2e', fontWeight: 600, textDecoration: 'none' }
