import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [platformDistribution, setPlatformDistribution] = useState([]);
  const [messagesChartData, setMessagesChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('15m'); // Default to 15 minutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchOptions = {
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        // Fetch all data in parallel, now including the dynamic timeRange
        const [
          statsResponse,
          platformResponse,
          messagesChartResponse
        ] = await Promise.all([
          fetch('/api/dashboard/stats', fetchOptions),
          fetch('/api/dashboard/platform-distribution', fetchOptions),
          fetch(`/api/dashboard/messages-chart?timeframe=${timeRange}`, fetchOptions) // Use state for the API call
        ]);

        if (!statsResponse.ok) {
          if (statsResponse.status === 401) {
            throw new Error('Authentication required. Please ensure you are logged in.');
          }
          throw new Error(`Failed to fetch stats: ${statsResponse.status}`);
        }
        const statsData = await statsResponse.json();
        setStats(statsData.counts);

        if (!platformResponse.ok) throw new Error('Failed to fetch platform data');
        const platformData = await platformResponse.json();
        setPlatformDistribution(platformData);

        if (!messagesChartResponse.ok) throw new Error('Failed to fetch messages chart data');
        const messagesChartData = await messagesChartResponse.json();
        setMessagesChartData(messagesChartData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]); // Re-fetch when timeRange changes

  useEffect(() => {
    if (!loading && !error) {
        const loadChartJS = () => {
            if (window.Chart) {
                createCharts();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            script.onload = () => setTimeout(createCharts, 100);
            script.onerror = () => setError('Failed to load charts library');
            document.head.appendChild(script);
        };
        loadChartJS();
    }
  }, [loading, error, messagesChartData, platformDistribution]);

  const createCharts = () => {
    if (!window.Chart) return;

    ['platformChart', 'messagesChart'].forEach(chartId => {
        const chart = window.Chart.getChart(chartId);
        if (chart) chart.destroy();
    });

    const platformCtx = document.getElementById('platformChart');
    if (platformCtx && platformDistribution.length > 0) {
        new window.Chart(platformCtx, {
            type: 'doughnut',
            data: {
                labels: platformDistribution.map(item => item._id || 'Unknown'),
                datasets: [{
                    data: platformDistribution.map(item => item.count),
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }

    const messagesCtx = document.getElementById('messagesChart');
    if (messagesCtx && messagesChartData.length > 0) {
        new window.Chart(messagesCtx, {
            type: 'line',
            data: {
                labels: messagesChartData.map(item => new Date(item.date).toLocaleString()),
                datasets: [{
                    label: 'Total Messages',
                    data: messagesChartData.map(item => item.totalCount),
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Valid Messages',
                    data: messagesChartData.map(item => item.validCount),
                    borderColor: '#43e97b',
                    backgroundColor: 'rgba(67, 233, 123, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }
  };

  const timeButtons = [
    { label: '5m', value: '5m' }, { label: '10m', value: '10m' }, { label: '15m', value: '15m' },
    { label: '30m', value: '30m' }, { label: '60m', value: '60m' },
    { label: '3h', value: '3h' }, { label: '6h', value: '6h' },
    { label: '12h', value: '12h' }, { label: '24h', value: '24h' },
    { label: '3d', value: '3d' }, { label: '7d', value: '7d' },
    { label: '1mo', value: '1mo' }, { label: '3mo', value: '3mo' },
    { label: '6mo', value: '6mo' }, { label: '1y', value: '1y' }
  ];

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

    React.createElement('div', {
      key: 'stats',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }
    }, [
      React.createElement(StatBox, { key: 'players', title: 'Total Players', value: stats?.players || 0, color: '#667eea', icon: '👥' }),
      React.createElement(StatBox, { key: 'messages', title: 'Total Messages', value: stats?.messages || 0, color: '#764ba2', icon: '💬' }),
      React.createElement(StatBox, { key: 'validMessages', title: 'Valid Messages', value: stats?.validMessages || 0, color: '#43e97b', icon: '✅' }),
      React.createElement(StatBox, { key: 'aiResponses', title: 'AI Responses', value: stats?.aiResponses || 0, color: '#4facfe', icon: '🤖' }),
      React.createElement(StatBox, { key: 'lfgResponses', title: 'LFG Responses', value: stats?.lfgResponses || 0, color: '#f093fb', icon: '🎮' }),
      React.createElement(StatBox, { key: 'activePlayers', title: 'Active Players', value: stats?.activePlayers || 0, color: '#00f2fe', icon: '🟢' }),
      React.createElement(StatBox, { key: 'messagesPerMin', title: 'Messages/Min', value: stats?.messagesPerMinute || 0, color: '#a8edea', icon: '⚡', isDecimal: true }),
      React.createElement(StatBox, { key: 'validMessagesPerMin', title: 'Valid Msgs/Min', value: stats?.validMessagesPerMinute || 0, color: '#38ef7d', icon: '📈', isDecimal: true })
    ]),

    React.createElement('div', {
      key: 'charts',
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '30px'
      }
    }, [
      React.createElement('div', {
        key: 'messagesChartContainer',
        style: {
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }
      }, [
        React.createElement('div', {
          key: 'chart-header',
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }
        }, [
          React.createElement('h3', {
            key: 'title',
            style: { color: '#333', fontSize: '18px', fontWeight: '600', margin: 0 }
          }, 'Messages Over Time'),
          React.createElement('div', { key: 'buttons' }, timeButtons.map(btn => React.createElement('button', {
            key: btn.value,
            onClick: () => setTimeRange(btn.value),
            style: {
              background: timeRange === btn.value ? '#667eea' : '#f8f9fa',
              color: timeRange === btn.value ? 'white' : '#333',
              border: '1px solid #e2e8f0',
              padding: '8px 12px',
              marginLeft: '5px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }
          }, btn.label)))
        ]),
        React.createElement('div', {
          key: 'canvas-container',
          style: { height: '350px', position: 'relative' }
        }, React.createElement('canvas', {
          id: 'messagesChart',
          style: { width: '100%', height: '100%' }
        }))
      ]),
      React.createElement('div', {
        key: 'platformChartContainer',
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
      const target = e.currentTarget;
      target.style.transform = 'translateY(-2px)';
      target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
    },
    onMouseLeave: (e) => {
      const target = e.currentTarget;
      target.style.transform = 'translateY(0)';
      target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
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

