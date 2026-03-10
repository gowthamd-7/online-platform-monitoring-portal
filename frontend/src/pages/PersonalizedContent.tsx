import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './PersonalizedContent.css'

interface Segment {
  name: string
  characteristics: {
    location?: string
    academic_performance?: string
    interests?: string[]
    decision_factors?: string[]
    decision_maker?: string
    platform_usage?: string
  }
}

interface Channel {
  id: string
  name: string
  description: string
}

interface ContentVariant {
  title: string
  content: string
  cta: string
  hashtags?: string[]
}

interface GeneratedContent {
  segment: string
  channel: string
  variants: ContentVariant[]
  metadata: {
    model: string
    college: string
    generated_at: string
  }
}

interface ChannelSuggestion {
  recommended_channel: string
  reason: string
  alternatives: Array<{ channel: string; reason: string }>
}

function PersonalizedContent() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [goal, setGoal] = useState<string>('attract')
  const [tone, setTone] = useState<string>('professional')
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'news' | 'segment'>('news')
  
  // News upload state
  const [newsText, setNewsText] = useState<string>('')
  const [newsChannel, setNewsChannel] = useState<string>('')
  const [newsAudience, setNewsAudience] = useState<string>('prospective students')
  const [newsTone, setNewsTone] = useState<string>('exciting')
  const [newsLoading, setNewsLoading] = useState(false)
  
  // Channel suggestion state
  const [channelSuggestion, setChannelSuggestion] = useState<ChannelSuggestion | null>(null)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [isManualOverride, setIsManualOverride] = useState(false)

  useEffect(() => {
    fetchSegmentsAndChannels()
  }, [])

  const fetchSegmentsAndChannels = async () => {
    try {
      const [segmentsRes, channelsRes] = await Promise.all([
        fetch('http://localhost:8000/api/content/segments'),
        fetch('http://localhost:8000/api/content/channels')
      ])
      
      const segmentsData = await segmentsRes.json()
      const channelsData = await channelsRes.json()
      
      setSegments(segmentsData.segments)
      setChannels(channelsData.channels)
    } catch (err) {
      setError('Failed to load options. Please check backend connection.')
      console.error(err)
    }
  }

  const handleGenerate = async () => {
    if (!selectedSegment || !selectedChannel) {
      setError('Please select both segment and channel')
      return
    }

    setLoading(true)
    setError(null)
    setGeneratedContent(null)

    try {
      const response = await fetch('http://localhost:8000/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segment_name: selectedSegment.name,
          segment_characteristics: selectedSegment.characteristics,
          channel: selectedChannel,
          goal: goal,
          tone: tone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate content')
      }

      const data = await response.json()
      setGeneratedContent(data)
    } catch (err: any) {
      setError(err.message || 'Error generating content')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatContentForCopy = (variant: ContentVariant): string => {
    let text = `${variant.title}\n\n${variant.content}\n\n${variant.cta}`
    if (variant.hashtags && variant.hashtags.length > 0) {
      text += `\n\n${variant.hashtags.join(' ')}`
    }
    return text
  }

  const handleGenerateFromNews = async () => {
    if (!newsText || !newsChannel) {
      setError('Please enter news/achievement and select a channel')
      return
    }

    setNewsLoading(true)
    setError(null)
    setGeneratedContent(null)

    try {
      const response = await fetch('http://localhost:8000/api/content/generate-from-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          news_text: newsText,
          channel: newsChannel,
          target_audience: newsAudience,
          tone: newsTone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate content')
      }

      const data = await response.json()
      setGeneratedContent(data)
    } catch (err: any) {
      setError(err.message || 'Error generating content')
      console.error(err)
    } finally {
      setNewsLoading(false)
    }
  }

  const handleAutoSelectChannel = async () => {
    if (!newsText) {
      setError('Please enter news/achievement first')
      return
    }

    setSuggestionLoading(true)
    setError(null)
    setChannelSuggestion(null)

    try {
      const response = await fetch('http://localhost:8000/api/content/suggest-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          news_text: newsText,
          target_audience: newsAudience
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get channel suggestion')
      }

      const data = await response.json()
      setChannelSuggestion(data)
      setNewsChannel(data.recommended_channel)
      setIsManualOverride(false)
    } catch (err: any) {
      setError(err.message || 'Error getting channel suggestion')
      console.error(err)
    } finally {
      setSuggestionLoading(false)
    }
  }

  const handleManualChannelSelect = (channelId: string) => {
    setNewsChannel(channelId)
    if (channelSuggestion && channelId !== channelSuggestion.recommended_channel) {
      setIsManualOverride(true)
    } else if (channelSuggestion && channelId === channelSuggestion.recommended_channel) {
      setIsManualOverride(false)
    }
  }

  const handleAlternativeSelect = (channelId: string) => {
    setNewsChannel(channelId)
    setIsManualOverride(true)
  }

  return (
    <div className="personalized-content-container">
      <header className="content-header">
        <div className="header-content">
          <div className="header-left">
            <div className="ai-icon-small">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M24 12l12 8-12 8V12z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1>AI-Powered Personalized Content</h1>
              <p className="header-subtitle">Generate targeted marketing content for student segments</p>
            </div>
          </div>
        </div>
      </header>

      <main className="content-main">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            Breaking News
          </button>
          <button
            className={`tab-btn ${activeTab === 'segment' ? 'active' : ''}`}
            onClick={() => setActiveTab('segment')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Segment-Based
          </button>
        </div>

        {/* Breaking News Tab Content */}
        {activeTab === 'news' && (
          <motion.div
            className="generator-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Generate from Breaking News</h2>
            <p className="generator-description">
              Upload fresh achievements, competition wins, or news to instantly generate marketing content
            </p>

            <div className="generator-form">
              <div className="form-group">
                <label htmlFor="newsText">Achievement / News *</label>
                <textarea
                  id="newsText"
                  value={newsText}
                  onChange={(e) => setNewsText(e.target.value)}
                  placeholder="Example: Our team won 1st prize at Smart India Hackathon 2025 with prize money of ₹1 lakh for their AI-powered crop disease detection solution"
                  className="news-textarea"
                  rows={4}
                />
                <div className="char-counter">{newsText.length} / 500 characters</div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="newsChannel">Marketing Channel *</label>
                  <div className="channel-selector-with-ai">
                    <select
                      id="newsChannel"
                      value={newsChannel}
                      onChange={(e) => handleManualChannelSelect(e.target.value)}
                      className="form-select"
                    >
                      <option value="">-- Select Channel --</option>
                      {channels.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="auto-select-btn"
                      onClick={handleAutoSelectChannel}
                      disabled={suggestionLoading || !newsText}
                      title="Let AI suggest the best channel"
                    >
                      {suggestionLoading ? (
                        <span className="spinner-small"></span>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                          </svg>
                          Auto-Select
                        </>
                      )}
                    </button>
                  </div>
                  {newsChannel && channelSuggestion && (
                    <div className="channel-badge">
                      {isManualOverride ? (
                        <span className="badge-override">✏️ Manual Override</span>
                      ) : (
                        <span className="badge-ai">🤖 AI Recommended</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newsAudience">Target Audience</label>
                  <select
                    id="newsAudience"
                    value={newsAudience}
                    onChange={(e) => setNewsAudience(e.target.value)}
                    className="form-select"
                  >
                    <option value="prospective students">Prospective Students</option>
                    <option value="current students">Current Students</option>
                    <option value="parents">Parents</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
              </div>

              {/* AI Channel Recommendation Display */}
              {channelSuggestion && (
                <motion.div
                  className="channel-recommendation"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="recommendation-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <h4>AI Recommendation</h4>
                  </div>
                  <p className="recommendation-reason">{channelSuggestion.reason}</p>
                  
                  {channelSuggestion.alternatives.length > 0 && (
                    <div className="alternatives">
                      <span className="alternatives-label">Alternative channels:</span>
                      <div className="alternative-chips">
                        {channelSuggestion.alternatives.map((alt, idx) => (
                          <button
                            key={idx}
                            className={`alt-chip ${newsChannel === alt.channel ? 'selected' : ''}`}
                            onClick={() => handleAlternativeSelect(alt.channel)}
                            title={alt.reason}
                          >
                            {channels.find(ch => ch.id === alt.channel)?.name || alt.channel}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="form-group">
                <label htmlFor="newsTone">Content Tone</label>
                <div className="tone-options">
                  {['exciting', 'professional', 'inspiring', 'urgent'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`tone-btn ${newsTone === t ? 'active' : ''}`}
                      onClick={() => setNewsTone(t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                className="generate-btn"
                onClick={handleGenerateFromNews}
                disabled={newsLoading || !newsText || !newsChannel}
              >
                {newsLoading ? (
                  <>
                    <span className="spinner"></span>
                    Generating with Gemini AI...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Segment-Based Tab Content */}
        {activeTab === 'segment' && (
          <motion.div
            className="generator-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Segment-Based Content Generator</h2>
            <p className="generator-description">
              Select target segment and channel to generate AI-powered personalized marketing content
              using BIT Sathy's achievements, placements, and facilities data.
            </p>

          <div className="generator-form">
            <div className="form-group">
              <label htmlFor="segment">Target Segment *</label>
              <select
                id="segment"
                value={selectedSegment?.name || ''}
                onChange={(e) => {
                  const segment = segments.find(s => s.name === e.target.value)
                  setSelectedSegment(segment || null)
                }}
                className="form-select"
              >
                <option value="">-- Select Student Segment --</option>
                {segments.map((seg) => (
                  <option key={seg.name} value={seg.name}>
                    {seg.name}
                  </option>
                ))}
              </select>
              {selectedSegment && (
                <div className="segment-info">
                  <strong>Characteristics:</strong>
                  <ul>
                    {Object.entries(selectedSegment.characteristics).map(([key, value]) => (
                      <li key={key}>
                        <span className="char-key">{key.replace(/_/g, ' ')}:</span>{' '}
                        {Array.isArray(value) ? value.join(', ') : value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="channel">Marketing Channel *</label>
                <select
                  id="channel"
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Select Channel --</option>
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name}
                    </option>
                  ))}
                </select>
                {selectedChannel && (
                  <p className="channel-desc">
                    {channels.find(c => c.id === selectedChannel)?.description}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="goal">Campaign Goal</label>
                <select
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="form-select"
                >
                  <option value="attract">Attract - Generate Interest</option>
                  <option value="convert">Convert - Drive Applications</option>
                  <option value="nurture">Nurture - Build Relationship</option>
                  <option value="inform">Inform - Share Updates</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tone">Content Tone</label>
              <div className="tone-options">
                {['professional', 'friendly', 'inspiring', 'urgent'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tone-btn ${tone === t ? 'active' : ''}`}
                    onClick={() => setTone(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                {error}
              </div>
            )}

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading || !selectedSegment || !selectedChannel}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Generating with Gemini AI...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Generate Content
                </>
              )}
            </button>
          </div>
        </motion.div>
        )}

        {generatedContent && (
          <motion.div
            className="results-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="results-header">
              <h2>Generated Content Variants</h2>
              <div className="results-meta">
                <span className="meta-badge">{generatedContent.segment}</span>
                <span className="meta-badge">{generatedContent.channel}</span>
                <span className="meta-badge">{generatedContent.metadata.model}</span>
              </div>
            </div>

            <div className="variants-grid">
              {generatedContent.variants.map((variant, index) => (
                <motion.div
                  key={index}
                  className="variant-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="variant-header">
                    <h3>Variant {index + 1}</h3>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(formatContentForCopy(variant), index)}
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="9" y="9" width="13" height="13" stroke="currentColor" strokeWidth="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="variant-content">
                    <div className="content-section">
                      <label>Title/Subject</label>
                      <p className="content-title">{variant.title}</p>
                    </div>

                    <div className="content-section">
                      <label>Content Body</label>
                      <p className="content-body">{variant.content}</p>
                    </div>

                    <div className="content-section">
                      <label>Call to Action</label>
                      <p className="content-cta">{variant.cta}</p>
                    </div>

                    {variant.hashtags && variant.hashtags.length > 0 && (
                      <div className="content-section">
                        <label>Hashtags</label>
                        <div className="hashtags">
                          {variant.hashtags.map((tag, i) => (
                            <span key={i} className="hashtag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default PersonalizedContent
