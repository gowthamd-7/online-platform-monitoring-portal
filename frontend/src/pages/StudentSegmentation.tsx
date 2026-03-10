import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './StudentSegmentation.css'
// Charts
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { motion } from 'framer-motion'

interface StudentPerformance {
  name: string
  roll_number: string
  github_score: number
  hackerrank_score: number
  leetcode_score: number
  overall_score: number
  rank: number
  last_activity: string
}

interface PlatformData {
  name: string
  active_students: number
  avg_score: number
  color?: string
}

interface ActivityInsight {
  icon: string
  title: string
  description: string
}

interface PerformanceData {
  total_students: number
  active_students: number
  top_performers: StudentPerformance[]
  platform_stats: PlatformData[]
  activity_trends: { month: string; github: number; hackerrank: number; leetcode: number }[]
  insights: ActivityInsight[]
}

function StudentSegmentation() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load initial performance data on component mount
  useEffect(() => {
    loadPerformanceData()
  }, [])

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Mock data for now - replace with actual API call
      const mockData: PerformanceData = {
        total_students: 1247,
        active_students: 892,
        top_performers: [
          { name: "Arjun Kumar", roll_number: "7376231CS115", github_score: 95, hackerrank_score: 88, leetcode_score: 92, overall_score: 91.7, rank: 1, last_activity: "2 hours ago" },
          { name: "Priya Singh", roll_number: "7376231CS167", github_score: 87, hackerrank_score: 96, leetcode_score: 89, overall_score: 90.7, rank: 2, last_activity: "5 hours ago" },
          { name: "Rohit Patel", roll_number: "7376231CS223", github_score: 92, hackerrank_score: 85, leetcode_score: 93, overall_score: 90.0, rank: 3, last_activity: "1 day ago" },
          { name: "Sneha Reddy", roll_number: "7376231CS278", github_score: 84, hackerrank_score: 91, leetcode_score: 88, overall_score: 87.7, rank: 4, last_activity: "3 hours ago" },
          { name: "Vikash Gupta", roll_number: "7376231CS342", github_score: 89, hackerrank_score: 79, leetcode_score: 94, overall_score: 87.3, rank: 5, last_activity: "6 hours ago" }
        ],
        platform_stats: [
          { name: "GitHub", active_students: 756, avg_score: 78.5, color: "#00D4FF" },
          { name: "HackerRank", active_students: 634, avg_score: 72.3, color: "#1E2A78" },
          { name: "LeetCode", active_students: 502, avg_score: 69.8, color: "#7C88CC" }
        ],
        activity_trends: [
          { month: "Jan", github: 45, hackerrank: 38, leetcode: 32 },
          { month: "Feb", github: 52, hackerrank: 43, leetcode: 35 },
          { month: "Mar", github: 61, hackerrank: 47, leetcode: 41 }
        ],
        insights: [
          { icon: "★", title: "Top Performer", description: "Arjun Kumar leads with 91.7% overall score" },
          { icon: "↗", title: "Growing Activity", description: "GitHub activity increased 24% this month" },
          { icon: "!", title: "At Risk", description: "127 students inactive for >7 days" }
        ]
      }
      
      setPerformanceData(mockData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error loading performance data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const assignColors = (platforms: PlatformData[]): PlatformData[] => {
    const colors = ['#00D4FF', '#1E2A78', '#7C88CC', '#00BDEB', '#3A4A9A']
    return platforms.map((platform, idx) => ({
      ...platform,
      color: platform.color || colors[idx % colors.length]
    }))
  }

  const pieData = (platforms?: PlatformData[]) => {
    if (!platforms) return []
    return platforms.map(p => ({ 
      name: p.name, 
      value: p.active_students, 
      avg_score: p.avg_score, 
      color: p.color || '#00D4FF',
      label: `${p.name}: ${p.active_students}`
    }))
  }

  // No additional utility functions needed for performance data

  const handleBack = () => {
    navigate('/teacher-dashboard')
  }

  if (isLoading) {
    return (
      <div className="segmentation-container">
        <header className="segmentation-header">
          <div className="header-title">
            <div className="ai-icon">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#00D4FF" strokeWidth="2" />
                <circle cx="18" cy="20" r="2" fill="#00D4FF" />
                <circle cx="30" cy="20" r="2" fill="#00D4FF" />
                <path d="M16 28C16 28 18 32 24 32C30 32 32 28 32 28" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1>Student Performance Overview</h1>
              <p className="powered-by">Real-time Platform Activity Monitoring</p>
            </div>
          </div>
        </header>
        <main className="segmentation-main">
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Loading analysis data...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error && !performanceData) {
    return (
      <div className="segmentation-container">
        <header className="segmentation-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
        </header>
        <main className="segmentation-main">
          <div className="error-container">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#FF4444" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="#FF4444" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="#FF4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h2>Error Loading Data</h2>
            <p>{error}</p>
            <button className="analyze-button" onClick={loadPerformanceData}>Retry</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="segmentation-container">
      <header className="segmentation-header">
        <button className="back-button" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="header-title">
          <div className="ai-icon">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#00D4FF" strokeWidth="2" />
              <circle cx="18" cy="20" r="2" fill="#00D4FF" />
              <circle cx="30" cy="20" r="2" fill="#00D4FF" />
              <path d="M16 28C16 28 18 32 24 32C30 32 32 28 32 28" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 24L8 20M36 20L40 24M24 8V4" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1>Student Performance Overview</h1>
            <p className="powered-by">Real-time Platform Activity Monitoring</p>
          </div>
        </div>
      </header>

      <main className="segmentation-main">
        {performanceData ? (
          <div className="results-section">
            <div className="results-header">
              <h2>Performance Analytics Dashboard</h2>
              <button className="upload-new-button" onClick={() => window.location.reload()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3v5h5M3 3l5 5m8-8v5h-5m5 0l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh Data
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(0, 212, 255, 0.1)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{performanceData.total_students.toLocaleString()}</h3>
                  <p>Total Students</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(30, 42, 120, 0.1)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#1E2A78" strokeWidth="2"/>
                    <polygon points="10,8 16,12 10,16" fill="#1E2A78"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{performanceData.active_students.toLocaleString()}</h3>
                  <p>Active Students</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(0, 212, 255, 0.1)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26" stroke="#00D4FF" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{Math.round((performanceData.active_students / performanceData.total_students) * 100)}%</h3>
                  <p>Activity Rate</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(30, 42, 120, 0.1)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#1E2A78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{performanceData.platform_stats.length}</h3>
                  <p>Platforms</p>
                </div>
              </div>
            </div>

            <div className="segments-grid">
              <motion.div className="segment-card" layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <h3>Top Student Rankings</h3>
                <div className="leaderboard-wrapper">
                  <div className="leaderboard-list">
                    {performanceData.top_performers.map((student) => (
                      <div key={student.roll_number} className={`leaderboard-item rank-${student.rank}`}>
                        <div className="rank-badge">{student.rank}</div>
                        <div className="student-info">
                          <h4>{student.name}</h4>
                          <p>{student.roll_number}</p>
                        </div>
                        <div className="scores">
                          <div className="score github">GH: {student.github_score}%</div>
                          <div className="score hackerrank">HR: {student.hackerrank_score}%</div>
                          <div className="score leetcode">LC: {student.leetcode_score}%</div>
                        </div>
                        <div className="overall-score">{student.overall_score}%</div>
                        <div className="last-activity">{student.last_activity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div className="segment-card" layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <h3>Platform Activity Distribution</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie 
                        dataKey="value" 
                        data={pieData(assignColors(performanceData.platform_stats))} 
                        innerRadius={60} 
                        outerRadius={100} 
                        labelLine={false}
                        label={(props: any) => {
                          const { name, value, percent } = props;
                          return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
                        }}
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {assignColors(performanceData.platform_stats).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any) => [`${value} students`, name]}
                        labelStyle={{ color: '#1E2A78' }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E9F2', borderRadius: '8px' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="top-list">
                  <strong>Platform Stats</strong>
                  <ol>
                    {performanceData.platform_stats.map(p => (
                      <li key={p.name}>{p.name} — {p.active_students} active • Avg: {p.avg_score}%</li>
                    ))}
                  </ol>
                </div>
              </motion.div>

              <motion.div className="segment-card" layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <h3>Activity Trends (Last 3 Months)</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={performanceData.activity_trends} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="github" stroke="#00D4FF" strokeWidth={3} name="GitHub" />
                      <Line type="monotone" dataKey="hackerrank" stroke="#1E2A78" strokeWidth={3} name="HackerRank" />
                      <Line type="monotone" dataKey="leetcode" stroke="#7C88CC" strokeWidth={3} name="LeetCode" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="top-list">
                  <strong>Growth Trends</strong>
                  <ul>
                    <li>GitHub: +24% increase in submissions</li>
                    <li>HackerRank: +19% contest participation</li>
                    <li>LeetCode: +28% problem solving rate</li>
                  </ul>
                </div>
              </motion.div>
            </div>

            <div className="insights-section">
              <h3>Performance Insights</h3>
              <div className="insights-grid">
                {performanceData.insights.map((insight, idx) => (
                  <div key={idx} className="insight-card">
                    <div className="insight-icon">{insight.icon}</div>
                    <h4>{insight.title}</h4>
                    <p>{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default StudentSegmentation
