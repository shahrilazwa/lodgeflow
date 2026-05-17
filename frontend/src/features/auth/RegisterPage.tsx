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
      await register({ name, email, password, password_confirmation: passwordConfirmation })
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
      <h1 className="auth-title">Create your LodgeFlow account</h1>
      <p className="auth-subtitle">Set up your workspace and start managing bookings more clearly.</p>

      {generalError && <div className="auth-alert">{generalError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="name" className="auth-label">Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="auth-input" autoComplete="name" placeholder="Enter your name" required />
          {errors.name && <p className="auth-error">{errors.name[0]}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="email" className="auth-label">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" autoComplete="email" placeholder="yourname@example.com" required />
          {errors.email && <p className="auth-error">{errors.email[0]}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="password" className="auth-label">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" autoComplete="new-password" placeholder="Enter password" required minLength={8} />
          {errors.password && <p className="auth-error">{errors.password[0]}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="password_confirmation" className="auth-label">Confirm password</label>
          <input id="password_confirmation" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="auth-input" autoComplete="new-password" placeholder="Confirm password" required minLength={8} />
        </div>

        <button type="submit" disabled={isRegistering} className="auth-submit">
          {isRegistering ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="auth-helper">
        Already have an account? <Link to="/login" className="auth-link">Log in</Link>
      </p>
    </div>
  )
}
