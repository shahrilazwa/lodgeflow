import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div>
      <h2>Login</h2>
      <p style={{ color: '#666' }}>Auth form will be implemented in Task 2.10.</p>
      <p>
        <Link to="/register">Don't have an account? Register</Link>
      </p>
    </div>
  )
}
