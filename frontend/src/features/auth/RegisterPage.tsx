import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div>
      <h2>Register</h2>
      <p style={{ color: '#666' }}>Registration form will be implemented in Task 2.10.</p>
      <p>
        <Link to="/login">Already have an account? Login</Link>
      </p>
    </div>
  )
}
