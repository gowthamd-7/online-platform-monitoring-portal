import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

interface AlertData {
  id: number
  student_name: string
  roll_number: string
  alert_type: string
  severity: 'high' | 'medium' | 'low'
  days_inactive: number
  last_activity: string
  platforms_affected: string[]
  status: 'active' | 'acknowledged' | 'resolved'
}

function AlertManagement() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      setIsLoading(true)
      
      // Mock alert data - replace with actual API call
      const mockAlerts: AlertData[] = [
        {
          id: 1,
          student_name: "Ravi Kumar",
          roll_number: "7376231CS189",
          alert_type: "Inactive Student",
          severity: 'high',
          days_inactive: 12,
          last_activity: "12 days ago",
          platforms_affected: ["GitHub", "HackerRank", "LeetCode"],
          status: 'active'
        },
        {
          id: 2,
          student_name: "Meera Sharma", 
          roll_number: "7376231CS201",
          alert_type: "Performance Drop",
          severity: 'medium',
          days_inactive: 5,
          last_activity: "5 days ago",
          platforms_affected: ["HackerRank"],
          status: 'acknowledged'
        },
        {
          id: 3,
          student_name: "Amit Verma",
          roll_number: "7376231CS134", 
          alert_type: "Low Activity",
          severity: 'low',
          days_inactive: 7,
          last_activity: "1 week ago",
          platforms_affected: ["GitHub"],
          status: 'active'
        },
        {
          id: 4,
          student_name: "Kavya Patel",
          roll_number: "7376231CS298",
          alert_type: "Inactive Student", 
          severity: 'high',
          days_inactive: 15,
          last_activity: "15 days ago",
          platforms_affected: ["GitHub", "LeetCode"],
          status: 'active'
        }
      ]
      
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/teacher')
  }

  const handleStatusUpdate = (alertId: number, newStatus: 'acknowledged' | 'resolved') => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    ))
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    return alert.status === filter
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF4444'
      case 'medium': return '#FF8C00'  
      case 'low': return '#FFC107'
      default: return '#6C757D'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return 'HIGH'
      case 'medium': return 'MED'
      case 'low': return 'LOW'
      default: return 'INFO'
    }
  }

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
          <div className="header-content">
            <h1>Alert Management</h1>
          </div>
        </header>
        <main className="dashboard-main">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading alerts...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <button className="back-button" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="header-content">
          <div className="header-left">
            <div className="ai-icon-small">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="19" cy="6" r="3" fill="#FF4444"/>
              </svg>
            </div>
            <div>
              <h1>Alert Management</h1>
              <p className="user-email">Monitor & manage student activity alerts</p>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="alert-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Alerts ({alerts.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({alerts.filter(a => a.status === 'active').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'acknowledged' ? 'active' : ''}`}
            onClick={() => setFilter('acknowledged')}
          >
            Acknowledged ({alerts.filter(a => a.status === 'acknowledged').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved ({alerts.filter(a => a.status === 'resolved').length})
          </button>
        </div>

        <div className="alerts-grid">
          {filteredAlerts.map(alert => (
            <div key={alert.id} className={`alert-card ${alert.severity}`}>
              <div className="alert-header">
                <div className="alert-severity" style={{ color: getSeverityColor(alert.severity) }}>
                  {getSeverityIcon(alert.severity)} {alert.severity.toUpperCase()}
                </div>
                <div className={`alert-status ${alert.status}`}>
                  {alert.status.toUpperCase()}
                </div>
              </div>
              
              <div className="alert-content">
                <h3>{alert.student_name}</h3>
                <p className="roll-number">{alert.roll_number}</p>
                <div className="alert-details">
                  <div className="alert-type">{alert.alert_type}</div>
                  <div className="alert-timing">
                    <strong>{alert.days_inactive} days</strong> since last activity
                  </div>
                  <div className="platforms-affected">
                    <strong>Platforms:</strong> {alert.platforms_affected.join(', ')}
                  </div>
                </div>
              </div>

              {alert.status === 'active' && (
                <div className="alert-actions">
                  <button 
                    className="action-btn acknowledge"
                    onClick={() => handleStatusUpdate(alert.id, 'acknowledged')}
                  >
                    Acknowledge
                  </button>
                  <button 
                    className="action-btn resolve"
                    onClick={() => handleStatusUpdate(alert.id, 'resolved')}
                  >
                    Mark Resolved
                  </button>
                </div>
              )}

              {alert.status === 'acknowledged' && (
                <div className="alert-actions">
                  <button 
                    className="action-btn resolve"
                    onClick={() => handleStatusUpdate(alert.id, 'resolved')}
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="no-alerts">
            <div className="no-alerts-icon">✓</div>
            <h3>No {filter !== 'all' ? filter : ''} alerts!</h3>
            <p>All students are actively engaged on their platforms.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default AlertManagement