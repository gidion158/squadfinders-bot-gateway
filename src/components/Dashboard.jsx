import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

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

  const messagesChartData = messagesChart ? {
    labels: messagesChart.map(item => new Date(item.date).toLocaleString()),
    datasets: [
      {
        label: 'Total Messages',
        data: messagesChart.map(item => item.totalCount),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Valid Messages',
        data: messagesChart.map(item => item.validCount),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'LFG Messages',
        data: messagesChart.map(item => item.lfgCount),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      }
    ]
  } : null;

  const platformChartData = platformDistribution ? {
    labels: platformDistribution.map(item => item._id || 'Unknown'),
    datasets: [{
      data: platformDistribution.map(item => item.count),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  } : null;

  const aiStatusChartData = aiStatusDistribution ? {
    labels: aiStatusDistribution.map(item => item._id || 'Unknown'),
    datasets: [{
      data: aiStatusDistribution.map(item => item.count),
      backgroundColor: aiStatusDistribution.map(item => getStatusColor(item._id)),
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'x',
        },
        pan: {
          enabled: true,
          mode: 'x',
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MMM dd'
          }
        }
      }
    }
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

      {/* Charts */}
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
          <div style={{ height: '300px' }}>
            {messagesChartData && <Line data={messagesChartData} options={chartOptions} />}
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
            {platformChartData && <Doughnut data={platformChartData} options={{ responsive: true, maintainAspectRatio: false }} />}
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
            {aiStatusChartData && <Doughnut data={aiStatusChartData} options={{ responsive: true, maintainAspectRatio: false }} />}
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