import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [messagesOverTime, setMessagesOverTime] = useState([]);
  const [platformDistribution, setPlatformDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get auth credentials from AdminJS session
        const authHeader = 'Basic ' + btoa(`${window.ADMINJS_CONFIG?.adminAuth?.user || 'squadfinders'}:${window.ADMINJS_CONFIG?.adminAuth?.pass || 'some-secure-password'}`);
        
        const fetchOptions = {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        };

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats', fetchOptions);
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsResponse.json();
        setStats(statsData.counts);

        // Fetch messages over time
        const messagesResponse = await fetch('/api/dashboard/messages-over-time?days=30', fetchOptions);
        if (!messagesResponse.ok) throw new Error('Failed to fetch messages data');
        const messagesData = await messagesResponse.json();
        setMessagesOverTime(messagesData);

        // Fetch platform distribution
        const platformResponse = await fetch('/api/dashboard/platform-distribution', fetchOptions);
        if (!platformResponse.ok) throw new Error('Failed to fetch platform data');
        const platformData = await platformResponse.json();
        setPlatformDistribution(platformData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && !error && messagesOverTime.length > 0) {
      // Load Chart.js dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        setTimeout(() => {
          createCharts();
        }, 100);
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup
        const existingScript = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/chart.js"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, [loading, error, messagesOverTime, platformDistribution]);

  const createCharts = () => {
    // Messages Over Time Chart
    const messagesCtx = document.getElementById('messagesChart');
    if (messagesCtx && window.Chart) {
      new window.Chart(messagesCtx, {
        type: 'line',
        data: {
          labels: messagesOverTime.map(item => new Date(item.date).toLocaleDateString()),
          datasets: [{
            label: 'Messages',
            data: messagesOverTime.map(item => item.count),
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
    if (platformCtx && window.Chart && platformDistribution.length > 0) {
      new window.Chart(platformCtx, {
        type: 'doughnut',
        data: {
          labels: platformDistribution.map(item => item._id || 'Unknown'),
          datasets: [{
            data: platformDistribution.map(item => item.count),
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
  };

  if (loading) {
    return React.createElement('div', { 
      style: { padding: '20px', textAlign: 'center' } 
    }, React.createElement('h2', null, 'Loading Dashboard...'));
  }

  if (error) {
    return React.createElement('div', { 
      style: { padding: '20px', textAlign: 'center', color: 'red' } 
    }, React.createElement('h2', null, `Error: ${error}`));
  }

  return React.createElement('div', { style: { padding: '20px' } }, [
    React.createElement('h1', { 
      key: 'title',
      style: { marginBottom: '30px', color: '#333' } 
    }, 'SquadFinders Dashboard'),
    
    // Statistics Boxes
    React.createElement('div', {
      key: 'stats',
      style: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }
    }, [
      React.createElement(StatBox, { 
        key: 'players',
        title: 'Total Players', 
        value: stats?.players || 0, 
        color: '#667eea' 
      }),
      React.createElement(StatBox, { 
        key: 'messages',
        title: 'Total Messages', 
        value: stats?.messages || 0, 
        color: '#764ba2' 
      }),
      React.createElement(StatBox, { 
        key: 'validMessages',
        title: 'Valid Messages', 
        value: stats?.validMessages || 0, 
        color: '#43e97b' 
      }),
      React.createElement(StatBox, { 
        key: 'adminUsers',
        title: 'Admin Users', 
        value: stats?.adminUsers || 0, 
        color: '#f093fb' 
      }),
      React.createElement(StatBox, { 
        key: 'aiResponses',
        title: 'AI Responses', 
        value: stats?.aiResponses || 0, 
        color: '#4facfe' 
      }),
      React.createElement(StatBox, { 
        key: 'activePlayers',
        title: 'Active Players', 
        value: stats?.activePlayers || 0, 
        color: '#00f2fe' 
      }),
      React.createElement(StatBox, { 
        key: 'messagesPerMin',
        title: 'Messages/Min', 
        value: stats?.messagesPerMinute || 0, 
        color: '#a8edea' 
      }),
      React.createElement(StatBox, { 
        key: 'validMessagesPerMin',
        title: 'Valid Msgs/Min', 
        value: stats?.validMessagesPerMinute || 0, 
        color: '#38ef7d' 
      })
    ]),

    // Charts Section
    React.createElement('div', {
      key: 'charts',
      style: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px' 
      }
    }, [
      // Messages Over Time Chart
      React.createElement('div', {
        key: 'messagesChart',
        style: { 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }
      }, [
        React.createElement('h3', { 
          key: 'title',
          style: { marginBottom: '20px', color: '#333' } 
        }, 'Messages Over Time (Last 30 Days)'),
        React.createElement('div', { 
          key: 'canvas-container',
          style: { height: '300px', position: 'relative' } 
        }, React.createElement('canvas', { 
          id: 'messagesChart', 
          style: { width: '100%', height: '100%' } 
        }))
      ]),

      // Platform Distribution Chart
      React.createElement('div', {
        key: 'platformChart',
        style: { 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }
      }, [
        React.createElement('h3', { 
          key: 'title',
          style: { marginBottom: '20px', color: '#333' } 
        }, 'Platform Distribution'),
        React.createElement('div', { 
          key: 'canvas-container',
          style: { height: '300px', position: 'relative' } 
        }, React.createElement('canvas', { 
          id: 'platformChart', 
          style: { width: '100%', height: '100%' } 
        }))
      ])
    ])
  ]);
};

const StatBox = ({ title, value, color }) => {
  return React.createElement('div', {
    style: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }
  }, [
    React.createElement('h3', { 
      key: 'title',
      style: { 
        margin: '0 0 10px 0', 
        fontSize: '14px', 
        color: '#666', 
        textTransform: 'uppercase' 
      } 
    }, title),
    React.createElement('div', { 
      key: 'value',
      style: { 
        fontSize: '28px', 
        fontWeight: 'bold', 
        color: color 
      } 
    }, typeof value === 'number' ? value.toLocaleString() : value)
  ]);
};

export default Dashboard;