import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

interface Credentials {
  username: string
  password: string
}

const DUMMY_CREDENTIALS = {
  students: [
    { username: 'student1', password: '123456' },
    { username: 'student2', password: '123456' },
    { username: 'student3', password: '123456' },
    { username: 'student4', password: '123456' },
    { username: 'student5', password: '123456' },
    { username: 'student6', password: '123456' },
    { username: 'student7', password: '123456' },
    { username: 'student8', password: '123456' },
    { username: 'student9', password: '123456' },
    { username: 'student10', password: '123456' },
  ],
  teacher: {
    username: 'teacher',
    password: '123456',
  },
}

function Login() {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<Credentials>({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if it's a student login
    const isStudent = DUMMY_CREDENTIALS.students.some(
      (student) =>
        student.username === credentials.username &&
        student.password === credentials.password
    )

    // Check credentials
    if (isStudent) {
      navigate('/student', { state: { username: credentials.username } })
    } else if (
      credentials.username === DUMMY_CREDENTIALS.teacher.username &&
      credentials.password === DUMMY_CREDENTIALS.teacher.password
    ) {
      navigate('/teacher')
    } else {
      setError('Invalid credentials. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="ai-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="20" r="2" fill="currentColor" />
              <circle cx="30" cy="20" r="2" fill="currentColor" />
              <path
                d="M16 28C16 28 18 32 24 32C30 32 32 28 32 28"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect x="10" y="10" width="6" height="6" stroke="currentColor" strokeWidth="2" />
              <rect x="32" y="10" width="6" height="6" stroke="currentColor" strokeWidth="2" />
              <rect x="10" y="32" width="6" height="6" stroke="currentColor" strokeWidth="2" />
              <rect x="32" y="32" width="6" height="6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <h1>Online Platform Monitoring Portal</h1>
          <p className="subtitle">AI-Powered Brand Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              placeholder="Enter your username"
              required
              className={error ? 'input-error' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              placeholder="Enter your password"
              required
              className={error ? 'input-error' : ''}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="powered-by">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z"
                fill="currentColor"
              />
            </svg>
            Powered by AI
          </div>
        </form>

        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Student: student1 / 123456</p>
          <p>Teacher: teacher / 123456</p>
        </div>
      </div>

      <div className="background-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
  )
}

export default Login
