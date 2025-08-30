import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [messagesOverTime, setMessagesOverTime] = useState([]);
  const [platformDistribution, setPlatformDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, messagesRes, platformRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/messages-over-time'),
          fetch('/api/dashboard/platform-distribution')
        ]);

        const [statsData, messagesData, platformData] = await Promise.all([
          statsRes.json(),
          messagesRes.json(),
          platformRes.json()
        ]);

        setStats(statsData.counts);
        setMessagesOverTime(messagesData);
        setPlatformDistribution(platformData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>SquadFinders Dashboard</h1>
      
      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        <StatCard title="Total Players" value={stats?.players || 0} color="#667eea" />
        <StatCard title="Total Messages" value={stats?.messages || 0} color="#764ba2" />
        <StatCard title="Admin Users" value={stats?.adminUsers || 0} color="#f093fb" />
        <StatCard title="Active Players" value={stats?.activePlayers || 0} color="#4facfe" />
        <StatCard title="PC Players" value={stats?.pcPlayers || 0} color="#00f2fe" />
        <StatCard title="Console Players" value={stats?.consolePlayers || 0} color="#a8edea" />
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px' 
      }}>
        {/* Messages Over Time Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Messages Over Time (Last 30 Days)</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'end', gap: '2px' }}>
            {messagesOverTime.map((item, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  backgroundColor: '#667eea',
                  height: `${Math.max((item.count / Math.max(...messagesOverTime.map(m => m.count))) * 100, 5)}%`,
                  borderRadius: '2px 2px 0 0',
                  position: 'relative'
                }}
                title={`${new Date(item.date).toLocaleDateString()}: ${item.count} messages`}
              />
            ))}
          </div>
        </div>

        {/* Platform Distribution Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Platform Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {platformDistribution.map((item, index) => {
              const colors = ['#667eea', '#764ba2', '#f093fb'];
              const total = platformDistribution.reduce((sum, p) => sum + p.count, 0);
              const percentage = ((item.count / total) * 100).toFixed(1);
              
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: colors[index % colors.length],
                    borderRadius: '4px'
                  }} />
                  <span style={{ flex: 1, fontWeight: 'bold' }}>{item._id || 'Unknown'}</span>
                  <span>{item.count} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div style={{
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`
  }}>
    <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>{title}</h3>
    <div style={{ fontSize: '28px', fontWeight: 'bold', color: color }}>{value.toLocaleString()}</div>
  </div>
);

export default Dashboard;