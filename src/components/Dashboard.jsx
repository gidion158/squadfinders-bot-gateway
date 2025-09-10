import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [messagesChart, setMessagesChart] = useState(null);
  const [platformDistribution, setPlatformDistribution] = useState(null);
  const [aiStatusDistribution, setAiStatusDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, messagesRes, platformRes, aiStatusRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch(`/api/dashboard/messages-chart?timeframe=${timeframe}`),
        fetch('/api/dashboard/platform-distribution'),
        fetch('/api/dashboard/ai-status-distribution')
      ]);

      const [statsData, messagesData, platformData, aiStatusData] = await Promise.all([
        statsRes.json(),
        messagesRes.json(),
        platformRes.json(),
        aiStatusRes.json()
      ]);

      setStats(statsData.counts);
      setMessagesChart(messagesData);
      setPlatformDistribution(platformData);
      setAiStatusDistribution(aiStatusData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      processing: '#3b82f6',
      completed: '#10b981',
      failed: '#ef4444',
      expired: '#6b7280',
      pending_prefilter: '#8b5cf6',
      unknown: '#9ca3af'
    };
    return colors[status] || '#9ca3af';
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#1f2937' }}>SquadFinders Dashboard</h1>
      
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>Total Players</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{formatNumber(stats?.players)}</p>
          <small style={{ opacity: 0.8 }}>Active: {formatNumber(stats?.activePlayers)}</small>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>Total Messages</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{formatNumber(stats?.messages)}</p>
          <small style={{ opacity: 0.8 }}>Valid: {formatNumber(stats?.validMessages)}</small>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>LFG Messages</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{formatNumber(stats?.lfgMessages)}</p>
          <small style={{ opacity: 0.8 }}>Today: {formatNumber(stats?.validMessagesToday)}</small>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>Processing Queue</h3>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{formatNumber(stats?.pendingMessages)}</p>
          <small style={{ opacity: 0.8 }}>Processing: {formatNumber(stats?.processingMessages)}</small>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Timeframe:</label>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '4px', 
            border: '1px solid #d1d5db',
            backgroundColor: 'white'
          }}
        >
          <option value="1h">Last Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Simple Charts Placeholder */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px' 
      }}>
        {/* Messages Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>Messages Over Time</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
            <p style={{ color: '#6b7280' }}>Chart data: {messagesChart?.length || 0} points</p>
          </div>
        </div>

        {/* Platform Distribution */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>Platform Distribution</h3>
          <div style={{ height: '300px' }}>
            {platformDistribution?.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '10px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span>{item._id || 'Unknown'}</span>
                <strong>{formatNumber(item.count)}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* AI Status Distribution */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>AI Processing Status</h3>
          <div style={{ height: '300px' }}>
            {aiStatusDistribution?.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: getStatusColor(item._id),
                    borderRadius: '50%',
                    marginRight: '8px'
                  }}></div>
                  <span>{item._id || 'Unknown'}</span>
                </div>
                <strong>{formatNumber(item.count)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div style={{ 
        marginTop: '30px',
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>Platform Stats</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>PC Players:</span>
            <strong>{formatNumber(stats?.pcPlayers)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Console Players:</span>
            <strong>{formatNumber(stats?.consolePlayers)}</strong>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>Processing Stats</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Completed:</span>
            <strong style={{ color: '#10b981' }}>{formatNumber(stats?.completedMessages)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Failed:</span>
            <strong style={{ color: '#ef4444' }}>{formatNumber(stats?.failedMessages)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Expired:</span>
            <strong style={{ color: '#6b7280' }}>{formatNumber(stats?.expiredMessages)}</strong>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>Activity Today</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Messages:</span>
            <strong>{formatNumber(stats?.messagesToday)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Valid Messages:</span>
            <strong>{formatNumber(stats?.validMessagesToday)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Deleted:</span>
            <strong>{formatNumber(stats?.deletedToday)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;