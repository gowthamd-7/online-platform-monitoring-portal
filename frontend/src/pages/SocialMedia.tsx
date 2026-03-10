import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './SocialMedia.css'

interface LeetCodeProfile {
  leetcode_username: string
  profile_url: string
  real_name: string | null
  avatar: string | null
  ranking: number | null
  total_solved: number
  easy_solved: number
  medium_solved: number
  hard_solved: number
  current_streak: number
  max_streak: number
  total_active_days: number
  contest_rating: number | null
  contest_ranking: string | null
  contests_attended: number
  last_updated: string
}

interface GitHubProfile {
  github_username: string
  profile_url: string
  name: string | null
  bio: string | null
  avatar_url: string | null
  company: string | null
  location: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  total_stars: number
  total_forks: number
  top_languages: string[]
  last_updated: string
}

interface HackerRankProfile {
  hackerrank_username: string
  profile_url: string
  name: string | null
  country: string | null
  avatar: string | null
  level: number
  total_score: number
  total_badges: number
  python_score: number
  java_score: number
  problem_solving_score: number
  python_stars: number
  java_stars: number
  problem_solving_stars: number
  sql_stars: number
  last_updated: string
}

function SocialMedia() {
  const navigate = useNavigate()
  const location = useLocation()
  const username = location.state?.username || 'student'
  
  const [showLeetCodeModal, setShowLeetCodeModal] = useState(false)
  const [leetcodeUrl, setLeetcodeUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [leetcodeProfile, setLeetcodeProfile] = useState<LeetCodeProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [showMoreStats, setShowMoreStats] = useState(false)

  // GitHub state
  const [showGitHubModal, setShowGitHubModal] = useState(false)
  const [githubUrl, setGithubUrl] = useState('')
  const [githubProfile, setGithubProfile] = useState<GitHubProfile | null>(null)
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(true)
  const [showMoreGitHub, setShowMoreGitHub] = useState(false)

  // HackerRank state
  const [showHackerRankModal, setShowHackerRankModal] = useState(false)
  const [hackerrankUrl, setHackerrankUrl] = useState('')
  const [hackerrankProfile, setHackerrankProfile] = useState<HackerRankProfile | null>(null)
  const [isLoadingHackerRank, setIsLoadingHackerRank] = useState(true)
  const [showMoreHackerRank, setShowMoreHackerRank] = useState(false)

  const handleBack = () => {
    navigate('/student', { state: { username } })
  }

  // Fetch existing LeetCode profile on component mount
  useEffect(() => {
    fetchLeetCodeProfile()
    fetchGitHubProfile()
    fetchHackerRankProfile()
  }, [])

  const fetchLeetCodeProfile = async () => {
    try {
      setIsLoadingProfile(true)
      const response = await fetch(`http://localhost:8000/api/leetcode/profile/${username}`)
      
      if (response.ok) {
        const data = await response.json()
        setLeetcodeProfile(data)
      }
    } catch (error) {
      console.log('No LeetCode profile connected')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleConnectLeetCode = () => {
    setShowLeetCodeModal(true)
    setError('')
    setLeetcodeUrl('')
  }

  const handleCloseModal = () => {
    setShowLeetCodeModal(false)
    setError('')
    setLeetcodeUrl('')
  }

  const handleSubmitLeetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/leetcode/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          profile_url: leetcodeUrl,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLeetcodeProfile(data)
        setShowLeetCodeModal(false)
        setLeetcodeUrl('')
      } else {
        setError(data.detail || 'Failed to connect LeetCode account')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnectLeetCode = async () => {
    if (!confirm('Are you sure you want to disconnect your LeetCode account?')) return

    try {
      const response = await fetch(`http://localhost:8000/api/leetcode/disconnect/${username}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLeetcodeProfile(null)
      }
    } catch (error) {
      alert('Failed to disconnect account')
    }
  }

  const handleRefreshLeetCode = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8000/api/leetcode/update/${username}`, {
        method: 'PUT',
      })

      if (response.ok) {
        await fetchLeetCodeProfile()
      }
    } catch (error) {
      alert('Failed to refresh profile')
    } finally {
      setIsLoading(false)
    }
  }

  // GitHub handlers
  const fetchGitHubProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/github/profile/${username}`)
      if (response.ok) {
        const data = await response.json()
        setGithubProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch GitHub profile:', error)
    } finally {
      setIsLoadingGitHub(false)
    }
  }

  const handleConnectGitHub = () => {
    setShowGitHubModal(true)
    setGithubUrl('')
    setError('')
  }

  const handleCloseGitHubModal = () => {
    setShowGitHubModal(false)
    setGithubUrl('')
    setError('')
  }

  const handleSubmitGitHub = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/github/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          profile_url: githubUrl,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setGithubProfile(data)
        setShowGitHubModal(false)
        setGithubUrl('')
      } else {
        setError(data.detail || 'Failed to connect GitHub account')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnectGitHub = async () => {
    if (!confirm('Are you sure you want to disconnect your GitHub account?')) return

    try {
      const response = await fetch(`http://localhost:8000/api/github/disconnect/${username}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGithubProfile(null)
      }
    } catch (error) {
      alert('Failed to disconnect account')
    }
  }

  const handleRefreshGitHub = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8000/api/github/update/${username}`, {
        method: 'PUT',
      })

      if (response.ok) {
        await fetchGitHubProfile()
      }
    } catch (error) {
      alert('Failed to refresh profile')
    } finally {
      setIsLoading(false)
    }
  }

  // HackerRank handlers
  const fetchHackerRankProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/hackerrank/profile/${username}`)
      if (response.ok) {
        const data = await response.json()
        setHackerrankProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch HackerRank profile:', error)
    } finally {
      setIsLoadingHackerRank(false)
    }
  }

  const handleConnectHackerRank = () => {
    setShowHackerRankModal(true)
    setHackerrankUrl('')
    setError('')
  }

  const handleCloseHackerRankModal = () => {
    setShowHackerRankModal(false)
    setHackerrankUrl('')
    setError('')
  }

  const handleSubmitHackerRank = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/hackerrank/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          profile_url: hackerrankUrl,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setHackerrankProfile(data)
        setShowHackerRankModal(false)
        setHackerrankUrl('')
      } else {
        setError(data.detail || 'Failed to connect HackerRank account')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnectHackerRank = async () => {
    if (!confirm('Are you sure you want to disconnect your HackerRank account?')) return

    try {
      const response = await fetch(`http://localhost:8000/api/hackerrank/disconnect/${username}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setHackerrankProfile(null)
      }
    } catch (error) {
      alert('Failed to disconnect account')
    }
  }

  const handleRefreshHackerRank = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8000/api/hackerrank/update/${username}`, {
        method: 'PUT',
      })

      if (response.ok) {
        await fetchHackerRankProfile()
      }
    } catch (error) {
      alert('Failed to refresh profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="social-media-container">
      <header className="social-header">
        <div className="header-content">
          <button className="back-button" onClick={handleBack}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Dashboard
          </button>
          <div className="header-title">
            <h1>Online Platform Connections</h1>
            <p>Connect your accounts to showcase your achievements</p>
          </div>
        </div>
      </header>

      <main className="social-main">
        <div className="platforms-container">
          <div className="social-platform-card">
            <div className="platform-icon" style={{ background: '#FFA116' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0z" />
              </svg>
            </div>
            <div className="platform-info">
              <h2>LeetCode</h2>
              <p className="platform-description">
                Share your coding achievements and problem-solving progress. Connect your
                LeetCode profile to showcase your competitive programming skills.
              </p>
              
              {isLoadingProfile ? (
                <div className="loading-message">Loading...</div>
              ) : leetcodeProfile ? (
                <>
                  <div className="platform-stats">
                    <div className="stat">
                      <span className="stat-label">Problems Solved</span>
                      <span className="stat-value">{leetcodeProfile.total_solved}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Ranking</span>
                      <span className="stat-value">{leetcodeProfile.ranking?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Current Streak</span>
                      <span className="stat-value">{leetcodeProfile.current_streak}</span>
                    </div>
                  </div>
                  <div className="difficulty-breakdown">
                    <div className="difficulty-item easy">
                      <span className="label">Easy</span>
                      <span className="value">{leetcodeProfile.easy_solved}</span>
                    </div>
                    <div className="difficulty-item medium">
                      <span className="label">Medium</span>
                      <span className="value">{leetcodeProfile.medium_solved}</span>
                    </div>
                    <div className="difficulty-item hard">
                      <span className="label">Hard</span>
                      <span className="value">{leetcodeProfile.hard_solved}</span>
                    </div>
                  </div>

                  <button 
                    className="show-more-button" 
                    onClick={() => setShowMoreStats(!showMoreStats)}
                  >
                    <span>{showMoreStats ? 'Show Less' : 'Show More Details'}</span>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      style={{ transform: showMoreStats ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {showMoreStats && (
                    <div className="expanded-stats">
                      <div className="stats-grid">
                        <div className="stat-card">
                          <div className="stat-card-icon" style={{ background: '#f0f9ff' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                                stroke="#0ea5e9" strokeWidth="2" fill="#0ea5e9" opacity="0.2"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Contest Rating</span>
                            <span className="stat-card-value">{leetcodeProfile.contest_rating || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon" style={{ background: '#fef3f2' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M22 21V19C22 17.9391 21.5786 16.9217 20.8284 16.1716C20.0783 15.4214 19.0609 15 18 15H17M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" 
                                stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Contest Ranking</span>
                            <span className="stat-card-value">{leetcodeProfile.contest_ranking || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon" style={{ background: '#f0fdf4' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                                stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Contests Attended</span>
                            <span className="stat-card-value">{leetcodeProfile.contests_attended}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon" style={{ background: '#fef9f3' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M13 10V3L4 14H11L11 21L20 10L13 10Z" 
                                stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Max Streak</span>
                            <span className="stat-card-value">{leetcodeProfile.max_streak} days</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon" style={{ background: '#f5f3ff' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M8 7V3M16 7V3M7 11H17M5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21Z" 
                                stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Active Days</span>
                            <span className="stat-card-value">{leetcodeProfile.total_active_days}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon" style={{ background: '#fef2f2' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M18 20V10M12 20V4M6 20V14" 
                                stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Acceptance Rate</span>
                            <span className="stat-card-value">
                              {leetcodeProfile.total_solved > 0 
                                ? `${((leetcodeProfile.total_solved / (leetcodeProfile.total_solved + 100)) * 100).toFixed(1)}%`
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {leetcodeProfile.profile_url && (
                        <div className="profile-link-section">
                          <a 
                            href={leetcodeProfile.profile_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-profile-link"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            View Full Profile on LeetCode
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="connected-actions">
                    <button className="refresh-button" onClick={handleRefreshLeetCode} disabled={isLoading}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M1 4v6h6M23 20v-6h-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {isLoading ? 'Updating...' : 'Refresh'}
                    </button>
                    <button className="disconnect-button" onClick={handleDisconnectLeetCode}>
                      Disconnect
                    </button>
                  </div>
                  <div className="last-updated">
                    Last updated: {new Date(leetcodeProfile.last_updated).toLocaleString()}
                  </div>
                </>
              ) : (
                <>
                  <div className="platform-stats">
                    <div className="stat">
                      <span className="stat-label">Problems Solved</span>
                      <span className="stat-value">-</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Ranking</span>
                      <span className="stat-value">-</span>
                    </div>
                  </div>
                  <button className="connect-button" onClick={handleConnectLeetCode}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Connect Account
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="social-platform-card">
            <div className="platform-icon" style={{ background: '#181717' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </div>
            <div className="platform-info">
              <h2>GitHub</h2>
              <p className="platform-description">
                Showcase your repositories and open-source contributions. Connect your
                GitHub account to display your development portfolio.
              </p>
              {isLoadingGitHub ? (
                <div className="platform-stats">
                  <div className="stat">
                    <span className="stat-label">Loading...</span>
                    <span className="stat-value">-</span>
                  </div>
                </div>
              ) : githubProfile ? (
                <>
                  <div className="platform-stats">
                    <div className="stat">
                      <span className="stat-label">Public Repos</span>
                      <span className="stat-value">{githubProfile.public_repos || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Stars</span>
                      <span className="stat-value">{githubProfile.total_stars || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Followers</span>
                      <span className="stat-value">{githubProfile.followers || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Following</span>
                      <span className="stat-value">{githubProfile.following || 0}</span>
                    </div>
                  </div>

                  {showMoreGitHub && (
                    <div className="expanded-stats">
                      <div className="stats-grid">
                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Total Forks</span>
                            <span className="stat-card-value">{githubProfile.total_forks || 0}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Public Gists</span>
                            <span className="stat-card-value">{githubProfile.public_gists || 0}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                              <path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 005 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Location</span>
                            <span className="stat-card-value">{githubProfile.location || 'Not specified'}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Company</span>
                            <span className="stat-card-value">{githubProfile.company || 'Not specified'}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Top Languages</span>
                            <span className="stat-card-value">
                              {githubProfile.top_languages && githubProfile.top_languages.length > 0
                                ? githubProfile.top_languages.join(', ')
                                : 'None'}
                            </span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Profile URL</span>
                            <span className="stat-card-value">
                              <a href={githubProfile.profile_url} target="_blank" rel="noopener noreferrer" style={{color: '#00D4FF', textDecoration: 'none'}}>
                                View Profile
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button className="show-more-button" onClick={() => setShowMoreGitHub(!showMoreGitHub)}>
                    {showMoreGitHub ? 'Show Less' : 'Show More Details'}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{
                        transform: showMoreGitHub ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className="profile-actions">
                    <button className="refresh-button" onClick={handleRefreshGitHub} disabled={isLoading}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{
                          animation: isLoading ? 'spin 1s linear infinite' : 'none',
                        }}
                      >
                        <path
                          d="M1 4v6h6M23 20v-6h-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {isLoading ? 'Updating...' : 'Refresh'}
                    </button>
                    <button className="disconnect-button" onClick={handleDisconnectGitHub}>
                      Disconnect
                    </button>
                  </div>
                  <div className="last-updated">
                    Last updated: {new Date(githubProfile.last_updated).toLocaleString()}
                  </div>
                </>
              ) : (
                <>
                  <div className="platform-stats">
                    <div className="stat">
                      <span className="stat-label">Public Repos</span>
                      <span className="stat-value">-</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Stars</span>
                      <span className="stat-value">-</span>
                    </div>
                  </div>
                  <button className="connect-button" onClick={handleConnectGitHub}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Connect Account
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="social-platform-card">
            <div className="platform-icon" style={{ background: '#2EC866' }}>
              <svg width="48" height="48" viewBox="0 0 512 512" fill="white">
                <path d="M477.5 128C463 103.05 285.13 0 256.16 0S49.25 103.05 34.84 128s-14.49 230.8 0 256 221.13 128 221.13 128S463 409.08 477.49 384s14.51-231 .01-256zM316.13 414.22c-4 0-40.91-35.77-38.44-139.14 2.75-115.84 27.51-126.51 27.51-126.51a3.21 3.21 0 0 1 3.1-1.64l33.81 3.1a3.21 3.21 0 0 1 2.84 3.78c-.28 1.47-7.42 36.34-7.42 36.34h40.87a3.21 3.21 0 0 1 2.84 3.78c-.28 1.47-7.42 36.34-7.42 36.34h-18.75s-15.21 117.23-16.72 121.24-18.69 62.7-18.69 62.7a3.21 3.21 0 0 1-3.53 1.01zm-127.16 0s-18.17-58.69-18.69-62.7-16.72-121.24-16.72-121.24h-18.75c-2.56 0-7.14-34.87-7.42-36.34a3.21 3.21 0 0 1 2.84-3.78H171.1s-7.14-34.87-7.42-36.34a3.21 3.21 0 0 1 2.84-3.78l33.81-3.1a3.21 3.21 0 0 1 3.1 1.64s24.76 10.67 27.51 126.51c2.47 103.37-34.44 139.14-38.44 139.14a3.21 3.21 0 0 1-3.53-1.01z"/>
              </svg>
            </div>
            <div className="platform-info">
              <h2>HackerRank</h2>
              <p className="platform-description">
                Display your problem-solving skills and certifications. Connect your
                HackerRank profile to highlight your technical expertise.
              </p>
              {isLoadingHackerRank ? (
                <div className="platform-stats">
                  <div className="stat">
                    <span className="stat-label">Loading...</span>
                    <span className="stat-value">-</span>
                  </div>
                </div>
              ) : hackerrankProfile ? (
                <>
                  <div className="platform-stats">
                    <div className="stat">
                      <span className="stat-label">Total Score</span>
                      <span className="stat-value">{hackerrankProfile.total_score || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Badges</span>
                      <span className="stat-value">{hackerrankProfile.total_badges || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Level</span>
                      <span className="stat-value">{hackerrankProfile.level || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Python Stars</span>
                      <span className="stat-value">{hackerrankProfile.python_stars || 0}</span>
                    </div>
                  </div>

                  {showMoreHackerRank && (
                    <div className="expanded-stats">
                      <div className="stats-grid">
                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Problem Solving Score</span>
                            <span className="stat-card-value">{hackerrankProfile.problem_solving_score || 0}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Java Stars</span>
                            <span className="stat-card-value">{hackerrankProfile.java_stars || 0}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Problem Solving Stars</span>
                            <span className="stat-card-value">{hackerrankProfile.problem_solving_stars || 0}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">SQL Stars</span>
                            <span className="stat-card-value">{hackerrankProfile.sql_stars || 0}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                              <path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 005 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Country</span>
                            <span className="stat-card-value">{hackerrankProfile.country || 'Not specified'}</span>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="stat-card-content">
                            <span className="stat-card-label">Profile URL</span>
                            <span className="stat-card-value">
                              <a href={hackerrankProfile.profile_url} target="_blank" rel="noopener noreferrer" style={{color: '#00D4FF', textDecoration: 'none'}}>
                                View Profile
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button className="show-more-button" onClick={() => setShowMoreHackerRank(!showMoreHackerRank)}>
                    {showMoreHackerRank ? 'Show Less' : 'Show More Details'}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{
                        transform: showMoreHackerRank ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className="profile-actions">
                    <button className="refresh-button" onClick={handleRefreshHackerRank} disabled={isLoading}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{
                          animation: isLoading ? 'spin 1s linear infinite' : 'none',
                        }}
                      >
                        <path
                          d="M1 4v6h6M23 20v-6h-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {isLoading ? 'Updating...' : 'Refresh'}
                    </button>
                    <button className="disconnect-button" onClick={handleDisconnectHackerRank}>
                      Disconnect
                    </button>
                  </div>
                  <div className="last-updated">
                    Last updated: {new Date(hackerrankProfile.last_updated).toLocaleString()}
                  </div>
                </>
              ) : (
                <>
                  <div className="platform-stats">
                    <div className="stat">
                      <span className="stat-label">Total Score</span>
                      <span className="stat-value">-</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Badges</span>
                      <span className="stat-value">-</span>
                    </div>
                  </div>
                  <button className="connect-button" onClick={handleConnectHackerRank}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Connect Account
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="social-platform-card">
            <div className="platform-icon" style={{ background: '#0A66C2' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <div className="platform-info">
              <h2>LinkedIn</h2>
              <p className="platform-description">
                Build your professional network and share achievements. Connect your
                LinkedIn to expand your career opportunities.
              </p>
              <div className="platform-stats">
                <div className="stat">
                  <span className="stat-label">Connections</span>
                  <span className="stat-value">-</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Posts</span>
                  <span className="stat-value">-</span>
                </div>
              </div>
              <button className="connect-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Connect Account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* LeetCode Connection Modal */}
      {showLeetCodeModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect LeetCode Account</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Enter your LeetCode profile URL or username to connect your account and display your achievements.
              </p>
              <div className="form-group">
                <label htmlFor="leetcode-url">LeetCode Profile URL or Username</label>
                <input
                  type="text"
                  id="leetcode-url"
                  placeholder="https://leetcode.com/username or just username"
                  value={leetcodeUrl}
                  onChange={(e) => setLeetcodeUrl(e.target.value)}
                  className="modal-input"
                  disabled={isLoading}
                />
                <span className="input-hint">Example: https://leetcode.com/u/john_doe/ or john_doe</span>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
            <div className="modal-footer">
              <button className="modal-button cancel" onClick={handleCloseModal} disabled={isLoading}>
                Cancel
              </button>
              <button 
                className="modal-button submit" 
                onClick={handleSubmitLeetCode}
                disabled={isLoading || !leetcodeUrl.trim()}
              >
                {isLoading ? 'Connecting...' : 'Connect Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Connection Modal */}
      {showGitHubModal && (
        <div className="modal-overlay" onClick={handleCloseGitHubModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect GitHub Account</h2>
              <button className="modal-close" onClick={handleCloseGitHubModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Enter your GitHub profile URL or username to connect your account and display your repositories.
              </p>
              <div className="form-group">
                <label htmlFor="github-url">GitHub Profile URL or Username</label>
                <input
                  type="text"
                  id="github-url"
                  placeholder="https://github.com/username or just username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="modal-input"
                  disabled={isLoading}
                />
                <span className="input-hint">Example: https://github.com/torvalds or torvalds</span>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
            <div className="modal-footer">
              <button className="modal-button cancel" onClick={handleCloseGitHubModal} disabled={isLoading}>
                Cancel
              </button>
              <button 
                className="modal-button submit" 
                onClick={handleSubmitGitHub}
                disabled={isLoading || !githubUrl.trim()}
              >
                {isLoading ? 'Connecting...' : 'Connect Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HackerRank Connection Modal */}
      {showHackerRankModal && (
        <div className="modal-overlay" onClick={handleCloseHackerRankModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect HackerRank Account</h2>
              <button className="modal-close" onClick={handleCloseHackerRankModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Enter your HackerRank profile URL or username to connect your account and display your skills.
              </p>
              <div className="form-group">
                <label htmlFor="hackerrank-url">HackerRank Profile URL or Username</label>
                <input
                  type="text"
                  id="hackerrank-url"
                  placeholder="https://www.hackerrank.com/username or just username"
                  value={hackerrankUrl}
                  onChange={(e) => setHackerrankUrl(e.target.value)}
                  className="modal-input"
                  disabled={isLoading}
                />
                <span className="input-hint">Example: https://www.hackerrank.com/profile/john_doe or john_doe</span>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
            <div className="modal-footer">
              <button className="modal-button cancel" onClick={handleCloseHackerRankModal} disabled={isLoading}>
                Cancel
              </button>
              <button 
                className="modal-button submit" 
                onClick={handleSubmitHackerRank}
                disabled={isLoading || !hackerrankUrl.trim()}
              >
                {isLoading ? 'Connecting...' : 'Connect Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SocialMedia
