import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

function TeacherDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  const handleStudentAchievements = () => {
    navigate('/student-achievements')
  }

  const handleStudentSegmentation = () => {
    navigate('/student-segmentation')
  }

  const handleAlertManagement = () => {
    navigate('/alert-management')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="ai-icon-small">
              <svg
                width="32"
                height="32"
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
              </svg>
            </div>
            <div>
              <h1>Teacher Dashboard</h1>
              <p className="user-email">teacher.bitsathy.ac.in</p>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="16 17 21 12 16 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome, Teacher</h2>
          <p>
            Manage your college's marketing campaigns, approve student submissions, and
            monitor performance across all channels from this central dashboard.
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={handleStudentAchievements} style={{ cursor: 'pointer' }}>
            <div className="card-icon" style={{ background: 'rgba(0, 212, 255, 0.1)' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15l-2 2-2-2m4-6l2-2 2 2"
                  stroke="var(--color-cyan)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 2a3 3 0 0 0-3 3v1a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2V5a3 3 0 0 0-3-3z"
                  stroke="var(--color-cyan)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 13v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8"
                  stroke="var(--color-cyan)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Student Achievements</h3>
            <p>Monitor student performance</p>
          </div>

          <div className="dashboard-card" onClick={handleStudentSegmentation} style={{ cursor: 'pointer' }}>
            <div className="card-icon" style={{ background: 'rgba(0, 212, 255, 0.1)' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="var(--color-cyan)" strokeWidth="2"/>
                <rect x="7" y="7" width="3" height="7" fill="var(--color-cyan)"/>
                <rect x="14" y="9" width="3" height="5" fill="var(--color-cyan)"/>
                <rect x="10.5" y="11" width="3" height="3" fill="var(--color-cyan)"/>
              </svg>
            </div>
            <h3>Student Performance Overview</h3>
            <p>Comprehensive student analytics dashboard</p>
          </div>

          <div className="dashboard-card" onClick={handleAlertManagement} style={{ cursor: 'pointer' }}>
            <div className="card-icon" style={{ background: 'rgba(30, 42, 120, 0.1)' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="var(--color-navy)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  stroke="var(--color-navy)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="19"
                  cy="6"
                  r="3"
                  fill="var(--color-navy)"
                />
              </svg>
            </div>
            <h3>Alert Management</h3>
            <p>Monitor student activity alerts & interventions</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TeacherDashboard
