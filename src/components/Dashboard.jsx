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
        
        // Use relative URLs - AdminJS will handle authentication
        const fetchOptions = {
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats', fetchOptions);
        if (!statsResponse.ok) {
          if (statsResponse.status === 401) {
            throw new Error('Authentication required. Please ensure you are logged in.');
          }
          throw new Error(`Failed to fetch stats: ${statsResponse.status}`);
        }
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
      const loadChartJS = async () => {
        if (window.Chart) {
          createCharts();
          return;
        }

        try {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
          script.onload = () => {
            setTimeout(() => {
              createCharts();
            }, 100);
          };
          script.onerror = () => {
            console.error('Failed to load Chart.js');
            setError('Failed to load charts library');
          };
          document.head.appendChild(script);
        } catch (err) {
          console.error('Error loading Chart.js:', err);
          setError('Failed to load charts');
        }
      };

      loadChartJS();
    }
  }, [loading, error, messagesOverTime, platformDistribution]);

  const createCharts = () => {
    if (!window.Chart) {
      console.error('Chart.js not loaded');
      return;
    }

    // Destroy existing charts if they exist
    const existingCharts = window.Chart.getChart('messagesChart') || window.Chart.getChart('platformChart');
    if (existingCharts) {
      existingCharts.destroy();
    }

    // Messages Over Time Chart
    const messagesCtx = document.getElementById('messagesChart');
    if (messagesCtx && messagesOverTime.length > 0) {
      try {
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
            plugins: {
              legend: {
                display: true
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      } catch (error) {
        console.error('Error creating messages chart:', error);
      }
    }

    // Platform Distribution Chart
    const platformCtx = document.getElementById('platformChart');
    if (platformCtx && platformDistribution.length > 0) {
      try {
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
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      } catch (error) {
        console.error('Error creating platform chart:', error);
      }
    }
  };

  if (loading) {
    return React.createElement('div', { 
      style: { 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      } 
    }, [
      React.createElement('div', { key: 'loader' }, [
        React.createElement('div', {
          key: 'spinner',
          style: {
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }
        }),
        React.createElement('h2', { 
          key: 'text',
          style: { color: '#666', margin: 0 }
        }, 'Loading Dashboard...')
      ])
    ]);
  }

  if (error) {
    return React.createElement('div', { 
      style: { 
        padding: '40px', 
        textAlign: 'center', 
        backgroundColor: '#fff5f5',
        border: '1px solid #fed7d7',
        borderRadius: '8px',
        margin: '20px',
        color: '#c53030'
      } 
    }, [
      React.createElement('h2', { 
        key: 'title',
        style: { marginBottom: '10px' }
      }, 'Dashboard Error'),
      React.createElement('p', { 
        key: 'message',
        style: { margin: 0 }
      }, error)
    ]);
  }

  return React.createElement('div', { 
    style: { 
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    } 
  }, [
    // Add CSS for spinner animation
    React.createElement('style', {
      key: 'styles'
    }, `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `),
    
    React.createElement('h1', { 
      key: 'title',
      style: { 
        marginBottom: '30px', 
        color: '#333',
        fontSize: '28px',
        fontWeight: 'bold'
      } 
    }, 'SquadFinders Dashboard'),
    
    // Statistics Boxes
    React.createElement('div', {
      key: 'stats',
      style: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }
    }, [
      React.createElement(StatBox, { 
        key: 'players',
        title: 'Total Players', 
        value: stats?.players || 0, 
        color: '#667eea',
        icon: '👥'
      }),
      React.createElement(StatBox, { 
        key: 'messages',
        title: 'Total Messages', 
        value: stats?.messages || 0, 
        color: '#764ba2',
        icon: '💬'
      }),
      React.createElement(StatBox, { 
        key: 'validMessages',
        title: 'Valid Messages', 
        value: stats?.validMessages || 0, 
        color: '#43e97b',
        icon: '✅'
      }),
      React.createElement(StatBox, { 
        key: 'aiResponses',
        title: 'AI Responses', 
        value: stats?.aiResponses || 0, 
        color: '#4facfe',
        icon: '🤖'
      }),
      React.createElement(StatBox, { 
        key: 'lfgResponses',
        title: 'LFG Responses', 
        value: stats?.lfgResponses || 0, 
        color: '#f093fb',
        icon: '🎮'
      }),
      React.createElement(StatBox, { 
        key: 'activePlayers',
        title: 'Active Players', 
        value: stats?.activePlayers || 0, 
        color: '#00f2fe',
        icon: '🟢'
      }),
      React.createElement(StatBox, { 
        key: 'messagesPerMin',
        title: 'Messages/Min', 
        value: stats?.messagesPerMinute || 0, 
        color: '#a8edea',
        icon: '⚡',
        isDecimal: true
      }),
      React.createElement(StatBox, { 
        key: 'validMessagesPerMin',
        title: 'Valid Msgs/Min', 
        value: stats?.validMessagesPerMinute || 0, 
        color: '#38ef7d',
        icon: '📈',
        isDecimal: true
      })
    ]),

    // Charts Section
    React.createElement('div', {
      key: 'charts',
      style: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '30px' 
      }
    }, [
      // Messages Over Time Chart
      React.createElement('div', {
        key: 'messagesChart',
        style: { 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }
      }, [
        React.createElement('h3', { 
          key: 'title',
          style: { 
            marginBottom: '20px', 
            color: '#333',
            fontSize: '18px',
            fontWeight: '600'
          } 
        }, 'Messages Over Time (Last 30 Days)'),
        React.createElement('div', { 
          key: 'canvas-container',
          style: { height: '350px', position: 'relative' } 
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
          padding: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }
      }, [
        React.createElement('h3', { 
          key: 'title',
          style: { 
            marginBottom: '20px', 
            color: '#333',
            fontSize: '18px',
            fontWeight: '600'
          } 
        }, 'Platform Distribution'),
        React.createElement('div', { 
          key: 'canvas-container',
          style: { height: '350px', position: 'relative' } 
        }, React.createElement('canvas', { 
          id: 'platformChart', 
          style: { width: '100%', height: '100%' } 
        }))
      ])
    ])
  ]);
};

const StatBox = ({ title, value, color, icon, isDecimal = false }) => {
  const displayValue = isDecimal ? 
    (typeof value === 'number' ? value.toFixed(2) : value) :
    (typeof value === 'number' ? value.toLocaleString() : value);

  return React.createElement('div', {
    style: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default'
    },
    onMouseEnter: (e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
    },
    onMouseLeave: (e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    }
  }, [
    React.createElement('div', {
      key: 'header',
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px'
      }
    }, [
      React.createElement('span', {
        key: 'icon',
        style: {
          fontSize: '24px',
          marginRight: '10px'
        }
      }, icon),
      React.createElement('h3', { 
        key: 'title',
        style: { 
          margin: 0, 
          fontSize: '14px', 
          color: '#666', 
          textTransform: 'uppercase',
          fontWeight: '600',
          letterSpacing: '0.5px'
        } 
      }, title)
    ]),
    React.createElement('div', { 
      key: 'value',
      style: { 
        fontSize: '32px', 
        fontWeight: 'bold', 
        color: color,
        lineHeight: '1'
      } 
    }, displayValue)
  ]);
};

export default Dashboard;