import React, { useState, useEffect } from 'react';
import { ApiClient } from 'adminjs';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [messagesOverTime, setMessagesOverTime] = useState([]);
  const [platformDistribution, setPlatformDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  const api = new ApiClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats');
        const statsData = await statsResponse.json();
        setStats(statsData.counts);

        // Fetch messages over time
        const messagesResponse = await fetch('/api/dashboard/messages-over-time?days=30');
        const messagesData = await messagesResponse.json();
        setMessagesOverTime(messagesData);

        // Fetch platform distribution
        const platformResponse = await fetch('/api/dashboard/platform-distribution');
        const platformData = await platformResponse.json();
        setPlatformDistribution(platformData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      
      {/* Statistics Boxes */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <StatBox title="Total Players" value={stats?.players || 0} color="#667eea" />
        <StatBox title="Total Messages" value={stats?.messages || 0} color="#764ba2" />
        <StatBox title="Admin Users" value={stats?.adminUsers || 0} color="#f093fb" />
        <StatBox title="AI Responses" value={stats?.aiResponses || 0} color="#4facfe" />
        <StatBox title="Active Players" value={stats?.activePlayers || 0} color="#4facfe" />
        <StatBox title="PC Players" value={stats?.pcPlayers || 0} color="#00f2fe" />
        <StatBox title="Console Players" value={stats?.consolePlayers || 0} color="#43e97b" />
        <StatBox title="LFG Responses" value={stats?.lfgResponses || 0} color="#a8edea" />
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
          <div style={{ height: '300px', position: 'relative' }}>
            <canvas id="messagesChart" style={{ width: '100%', height: '100%' }}></canvas>
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
          <div style={{ height: '300px', position: 'relative' }}>
            <canvas id="platformChart" style={{ width: '100%', height: '100%' }}></canvas>
          </div>
        </div>
      </div>

      {/* Chart.js Script */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          // Messages Over Time Chart
          const messagesCtx = document.getElementById('messagesChart');
          if (messagesCtx) {
            new Chart(messagesCtx, {
              type: 'line',
              data: {
                labels: ${JSON.stringify(messagesOverTime.map(item => new Date(item.date).toLocaleDateString()))},
                datasets: [{
                  label: 'Messages',
                  data: ${JSON.stringify(messagesOverTime.map(item => item.count))},
                  borderColor: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }
            });
          }

          // Platform Distribution Chart
          const platformCtx = document.getElementById('platformChart');
          if (platformCtx) {
            new Chart(platformCtx, {
              type: 'doughnut',
              data: {
                labels: ${JSON.stringify(platformDistribution.map(item => item._id || 'Unknown'))},
                datasets: [{
                  data: ${JSON.stringify(platformDistribution.map(item => item.count))},
                  backgroundColor: [
                    '#667eea',
                    '#764ba2', 
                    '#f093fb',
                    '#4facfe',
                    '#00f2fe'
                  ]
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false
              }
            });
          }
        `
      }} />
    </div>
  );
};

const StatBox = ({ title, value, color }) => (
  <div style={{
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`
  }}>
    <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>
      {title}
    </h3>
    <div style={{ fontSize: '28px', fontWeight: 'bold', color: color }}>
      {value.toLocaleString()}
    </div>
  </div>
);

export default Dashboard;