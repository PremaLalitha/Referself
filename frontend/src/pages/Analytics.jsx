import API_BASE from '../config/api.js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import '../styles/Analytics.css';

function Analytics() {
  const [stats, setStats] = useState({
    users: 0,
    resources: 0,
    downloads: 0,
    subjects: 0,
    comments: 0,
    activeUsers: 0,
    recentUploads: 0
  });
  const [distribution, setDistribution] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');

    // Redirect if not admin
    if (userRole !== 'Admin') {
      alert('Access denied. Admin only.');
      navigate('/home');
      return;
    }

    fetchAnalyticsData();

    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchAnalyticsData, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch main stats
      const statsRes = await fetch(`${API_BASE}/api/stats`);
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch resource distribution
      const distRes = await fetch(`${API_BASE}/api/stats/resource-distribution`);
      if (!distRes.ok) throw new Error('Failed to fetch distribution');
      const distData = await distRes.json();
      setDistribution(distData);

      // Fetch top-rated resources
      const topRes = await fetch(`${API_BASE}/api/stats/top-rated`);
      if (!topRes.ok) throw new Error('Failed to fetch top-rated resources');
      const topData = await topRes.json();
      setTopRated(topData);

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const COLORS = ['#9A3F3F', '#C1856D', '#E6CFA9', '#FBF9D1', '#9A7B4F', '#D4B08A'];

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(num);
  };

  if (loading && !stats.users) {
    return (
      <div className="analytics-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div className="logo">ReferShelf <span className="admin-badge">Analytics</span></div>
        <div className="header-buttons">
          <button className="admin-dashboard-btn" onClick={() => navigate('/admin')}>Admin Dashboard</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="analytics-content">
        <div className="analytics-header-section">
          <h1>Platform Analytics Dashboard</h1>
          <p>Real-time insights into our platform's performance</p>
          <div className="live-indicator">
            <span className="indicator-dot"></span>
            Live Data
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>Error loading data: {error}</p>
            <button onClick={fetchAnalyticsData} className="retry-btn">Retry</button>
          </div>
        )}

        {/* Key Metrics Grid */}
        <section className="key-metrics">
          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <h3>Total Users</h3>
            <p className="metric-value">{formatNumber(stats.users)}</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📚</div>
            <h3>Total Resources</h3>
            <p className="metric-value">{formatNumber(stats.resources)}</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📥</div>
            <h3>Total Downloads</h3>
            <p className="metric-value">{formatNumber(stats.downloads)}</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📂</div>
            <h3>Total Subjects</h3>
            <p className="metric-value">{formatNumber(stats.subjects)}</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon">💬</div>
            <h3>Total Comments</h3>
            <p className="metric-value">{formatNumber(stats.comments)}</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🔥</div>
            <h3>Active Users (30d)</h3>
            <p className="metric-value">{formatNumber(stats.activeUsers)}</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🆕</div>
            <h3>Recent Uploads (7d)</h3>
            <p className="metric-value">{formatNumber(stats.recentUploads)}</p>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <h3>Engagement Rate</h3>
            <p className="metric-value">
              {stats.users > 0 ? ((stats.activeUsers / stats.users) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <div className="chart-container">
            <h2>Resource Distribution by Subject</h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ subjectName, percent }) => `${subjectName}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatNumber(value), 'Resources']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Top Rated Resources */}
        <section className="top-rated-section">
          <h2>Top Rated Resources</h2>
          <div className="top-rated-grid">
            {topRated.length > 0 ? (
              topRated.map((resource, index) => (
                <div key={resource._id} className="top-rated-card">
                  <div className="rank-badge">#{index + 1}</div>
                  <h3>{resource.title}</h3>
                  <div className="resource-meta">
                    <span className="subject">{resource.subject || 'No Subject'}</span>
                    <span className="type">{resource.fileType}</span>
                  </div>
                  <div className="rating-info">
                    <span className="rating">⭐ {resource.likesCount ? resource.likesCount.toFixed(1) : '0.0'}</span>
                    <span className="reviews">({resource.likesCount || 0} likes)</span>
                  </div>
                  <div className="downloads">
                    <span>📥 {formatNumber(resource.downloads || 0)} downloads</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No rated resources yet</p>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="analytics-footer">
          <p>Last updated: {lastUpdate.toLocaleString()}</p>
          <p>Data refreshes every 30 seconds</p>
        </footer>
      </main>
    </div>
  );
}

export default Analytics;
