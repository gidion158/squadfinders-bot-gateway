import React, { useState, useEffect } from 'react';

const Dashboard = (props) => {
  const [stats, setStats] = useState(null);
  const [platformDistribution, setPlatformDistribution] = useState([]);
  const [aiStatusDistribution, setAIStatusDistribution] = useState([]);
  const [messagesChartData, setMessagesChartData] = useState([]);
  const [deletedMessagesChartData, setDeletedMessagesChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [messagesChartInstance, setMessagesChartInstance] = useState(null);
  const [deletedMessagesChartInstance, setDeletedMessagesChartInstance] = useState(null);
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

        // Fetch all data in parallel
        const [
          statsResponse,
          platformResponse,
          aiStatusResponse,
          messagesChartResponse,
          deletedMessagesChartResponse
        ] = await Promise.all([
          fetch('/api/dashboard/stats', fetchOptions),
          fetch('/api/dashboard/platform-distribution', fetchOptions),
          fetch('/api/dashboard/ai-status-distribution', fetchOptions),
          fetch(`/api/dashboard/messages-chart?timeframe=${timeRange}`, fetchOptions),
          fetch(`/api/dashboard/deleted-messages-chart?timeframe=${timeRange}`, fetchOptions)
        ]);

        if (!statsResponse.ok) {
          throw new Error(`Failed to fetch stats: ${statsResponse.status}`);
        }
        const statsData = await statsResponse.json();
        setStats(statsData.counts);

        if (!platformResponse.ok) throw new Error('Failed to fetch platform data');
        const platformData = await platformResponse.json();
        setPlatformDistribution(platformData);

        if (!aiStatusResponse.ok) throw new Error('Failed to fetch AI status data');
        const aiStatusData = await aiStatusResponse.json();
        setAIStatusDistribution(aiStatusData);

        if (!messagesChartResponse.ok) throw new Error('Failed to fetch messages chart data');
        const chartData = await messagesChartResponse.json();
        setMessagesChartData(chartData);

        if (!deletedMessagesChartResponse.ok) throw new Error('Failed to fetch deleted messages chart data');
        const deletedChartData = await deletedMessagesChartResponse.json();
        setDeletedMessagesChartData(deletedChartData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  useEffect(() => {
    if (!loading && !error && messagesChartData.length > 0) {
      const loadScript = (src, onLoad) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = onLoad;
        script.onerror = () => setError(`Failed to load script: ${src}`);
        document.head.appendChild(script);
        return script;
      };

      const loadChartScripts = () => {
        if (window.Chart && window.Chart.Zoom && window.Chart._adapters) {
          createCharts();
          return;
        }

        loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js', () => {
          loadScript('https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js', () => {
            loadScript('https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js', () => {
              if (window.Chart && window.ChartZoom) {
                window.Chart.register(window.ChartZoom);
              }
              setTimeout(createCharts, 100);
            });
          });
        });
      };

      loadChartScripts();
    }
  }, [loading, error, messagesChartData, deletedMessagesChartData, platformDistribution, aiStatusDistribution]);

  const createCharts = () => {
    if (!window.Chart) return;

    ['platformChart', 'aiStatusChart', 'messagesChart', 'deletedMessagesChart'].forEach(chartId => {
        const chart = window.Chart.getChart(chartId);
        if (chart) chart.destroy();
    });

    // Platform Distribution Chart
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
            options: { 
              responsive: true, 
              maintainAspectRatio: false, 
              plugins: { 
                legend: { position: 'bottom' },
                title: { display: true, text: 'Platform Distribution' }
              } 
            }
        });
    }

    // AI Status Distribution Chart with static colors
    const aiStatusCtx = document.getElementById('aiStatusChart');
    if (aiStatusCtx && aiStatusDistribution.length > 0) {
        // Filter out null/undefined values and map to proper labels
        const validStatuses = aiStatusDistribution.filter(item => item._id != null);
        
        const statusConfig = {
          'pending': { label: 'Pending', color: '#ffd93d' },
          'processing': { label: 'Processing', color: '#6bcf7f' },
          'completed': { label: 'Completed', color: '#4d96ff' },
          'failed': { label: 'Failed', color: '#ff6b6b' },
          'expired': { label: 'Expired', color: '#a8a8a8' }
        };
        
        const labels = validStatuses.map(item => {
          const config = statusConfig[item._id];
          return config ? config.label : item._id;
        });
        
        const colors = validStatuses.map(item => {
          const config = statusConfig[item._id];
          return config ? config.color : '#cccccc';
        });
        
        const data = validStatuses.map(item => item.count);
        
        new window.Chart(aiStatusCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors
                }]
            },
            options: { 
              responsive: true, 
              maintainAspectRatio: false, 
              plugins: { 
                legend: { position: 'bottom' },
                title: { display: true, text: 'AI Processing Status' }
              } 
            }
        });
    }

    // Messages Over Time Chart
    const messagesCtx = document.getElementById('messagesChart');
    if (messagesCtx && messagesChartData) {
      const newChartInstance = new window.Chart(messagesCtx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Total Messages',
            data: messagesChartData.map(item => ({ x: new Date(item.date), y: item.totalCount })),
            borderColor: '#4facfe',
            backgroundColor: 'rgba(79, 172, 254, 0.1)',
            tension: 0.4,
            fill: true
          }, {
            label: 'Valid Messages',
            data: messagesChartData.map(item => ({ x: new Date(item.date), y: item.validCount })),
            borderColor: '#43e97b',
            backgroundColor: 'rgba(67, 233, 123, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                tooltipFormat: 'PP pp'
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Count'
              }
            }
          },
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'x',
              },
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'x',
                drag: {
                  enabled: true,
                  backgroundColor: 'rgba(102, 126, 234, 0.2)',
                  borderColor: '#667eea',
                  borderWidth: 1
                }
              }
            },
            title: {
              display: true,
              text: 'Messages Over Time'
            }
          }
        }
      });
      setMessagesChartInstance(newChartInstance);
    }

    // Deleted Messages Chart
    const deletedMessagesCtx = document.getElementById('deletedMessagesChart');
    if (deletedMessagesCtx && deletedMessagesChartData.length > 0) {
      const newDeletedChartInstance = new window.Chart(deletedMessagesCtx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Deleted Messages',
            data: deletedMessagesChartData.map(item => ({ x: new Date(item.date), y: item.count })),
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4,
            fill: true
          }, {
            label: 'Avg Deletion Time (min)',
            data: deletedMessagesChartData.map(item => ({ x: new Date(item.date), y: item.avgDeletionTimeMinutes })),
            borderColor: '#ffa726',
            backgroundColor: 'rgba(255, 167, 38, 0.1)',
            tension: 0.4,
            fill: false,
            yAxisID: 'y1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                tooltipFormat: 'PP'
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Deleted Messages Count'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Avg Deletion Time (minutes)'
              },
              grid: {
                drawOnChartArea: false,
              },
            }
          },
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'x',
              },
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'x',
                drag: {
                  enabled: true,
                  backgroundColor: 'rgba(255, 107, 107, 0.2)',
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
    return React.createElement('div', { style: { padding: '40px', textAlign: 'center', backgroundColor: '#f8f9fa', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}, [
      React.createElement('div', { key: 'loader' }, [
        React.createElement('div', { key: 'spinner', style: { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}),
        React.createElement('h2', { key: 'text', style: { color: '#666', margin: 0 }}, 'Loading Dashboard...')
      ])
    ]);
  }

  if (error) {
    return React.createElement('div', { style: { padding: '40px', textAlign: 'center', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', margin: '20px', color: '#c53030'}}, [
      React.createElement('h2', { key: 'title', style: { marginBottom: '10px' }}, 'Dashboard Error'),
      React.createElement('p', { key: 'message', style: { margin: 0 }}, error)
    ]);
  }

  return React.createElement('div', { style: { padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}, [
    React.createElement('style', { key: 'styles' }, `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`),
    React.createElement('h1', { key: 'title', style: { marginBottom: '30px', color: '#333', fontSize: '28px', fontWeight: 'bold' }}, 'SquadFinders Dashboard'),
    
    // Statistics Grid
    React.createElement('div', { key: 'stats', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}, [
      React.createElement(StatBox, { key: 'players', title: 'Total Players', value: stats?.players || 0, color: '#667eea', icon: '👥' }),
      React.createElement(StatBox, { key: 'messages', title: 'Total Messages', value: stats?.messages || 0, color: '#764ba2', icon: '💬' }),
      React.createElement(StatBox, { key: 'validMessages', title: 'Valid Messages', value: stats?.validMessages || 0, color: '#43e97b', icon: '✅' }),
      React.createElement(StatBox, { key: 'lfgMessages', title: 'LFG Messages', value: stats?.lfgMessages || 0, color: '#f093fb', icon: '🎮' }),
      React.createElement(StatBox, { key: 'activePlayers', title: 'Active Players', value: stats?.activePlayers || 0, color: '#00f2fe', icon: '🟢' }),
      React.createElement(StatBox, { key: 'pendingMessages', title: 'Pending Messages', value: stats?.pendingMessages || 0, color: '#ffd93d', icon: '⏳' }),
      React.createElement(StatBox, { key: 'processingMessages', title: 'Processing Messages', value: stats?.processingMessages || 0, color: '#6bcf7f', icon: '⚙️' }),
      React.createElement(StatBox, { key: 'completedMessages', title: 'Completed Messages', value: stats?.completedMessages || 0, color: '#4d96ff', icon: '✅' }),
      React.createElement(StatBox, { key: 'failedMessages', title: 'Failed Messages', value: stats?.failedMessages || 0, color: '#ff6b6b', icon: '❌' }),
      React.createElement(StatBox, { key: 'expiredMessages', title: 'Expired Messages', value: stats?.expiredMessages || 0, color: '#a8a8a8', icon: '⏰' }),
      React.createElement(StatBox, { key: 'messagesToday', title: 'Messages Today', value: stats?.messagesToday || 0, color: '#38ef7d', icon: '📅' }),
      React.createElement(StatBox, { key: 'validMessagesToday', title: 'Valid Today', value: stats?.validMessagesToday || 0, color: '#a8edea', icon: '✨' }),
      React.createElement(StatBox, { key: 'messagesPerMin', title: 'Messages/Min', value: stats?.messagesPerMinute || 0, color: '#667eea', icon: '⚡', isDecimal: true }),
      React.createElement(StatBox, { key: 'validMessagesPerMin', title: 'Valid/Min', value: stats?.validMessagesPerMinute || 0, color: '#43e97b', icon: '📈', isDecimal: true })
    ]),
    
    // Charts Grid
    React.createElement('div', { key: 'charts', style: { display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}, [
      // Messages Over Time Chart
      React.createElement('div', { key: 'messagesChartContainer', style: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}, [
        React.createElement('div', { key: 'chart-header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}, [
          React.createElement('h3', { key: 'title', style: { color: '#333', fontSize: '18px', fontWeight: '600', margin: 0 }}, 'Messages Over Time'),
          React.createElement('div', { key: 'buttons' },
            timeButtons.map(btn => React.createElement('button', {
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
            }, btn.label)),
            React.createElement('button', {
              key: 'reset-zoom',
              onClick: () => messagesChartInstance && messagesChartInstance.resetZoom(),
              style: {
                background: '#f8f9fa', 
                color: '#333', 
                border: '1px solid #e2e8f0', 
                padding: '8px 12px', 
                marginLeft: '10px', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: '500'
              }
            }, 'Reset Zoom')
          )
        ]),
        React.createElement('div', { key: 'canvas-container', style: { height: '350px', position: 'relative' }}, 
          React.createElement('canvas', { id: 'messagesChart', style: { width: '100%', height: '100%' } })
        )
      ]),
      
      // Charts Row
      React.createElement('div', { key: 'chartsRow', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}, [
        // Platform Distribution Chart
        React.createElement('div', { key: 'platformChartContainer', style: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}, [
          React.createElement('h3', { key: 'title', style: { marginBottom: '20px', color: '#333', fontSize: '18px', fontWeight: '600' }}, 'Platform Distribution'),
          React.createElement('div', { key: 'canvas-container', style: { height: '300px', position: 'relative' }}, 
            React.createElement('canvas', { id: 'platformChart', style: { width: '100%', height: '100%' } })
          )
        ]),
        
        // AI Status Distribution Chart
        React.createElement('div', { key: 'aiStatusChartContainer', style: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}, [
          React.createElement('h3', { key: 'title', style: { marginBottom: '20px', color: '#333', fontSize: '18px', fontWeight: '600' }}, 'AI Processing Status'),
          React.createElement('div', { key: 'canvas-container', style: { height: '300px', position: 'relative' }}, 
            React.createElement('canvas', { id: 'aiStatusChart', style: { width: '100%', height: '100%' } })
          )
        ])
      ])
    ])
  ]);
};

const StatBox = ({ title, value, color, icon, isDecimal = false }) => {
  const displayValue = isDecimal ? (typeof value === 'number' ? value.toFixed(2) : value) : (typeof value === 'number' ? value.toLocaleString() : value);
  return React.createElement('div', {
    style: {
      backgroundColor: 'white', 
      padding: '20px', 
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
    React.createElement('div', { key: 'header', style: { display: 'flex', alignItems: 'center', marginBottom: '12px' }}, [
      React.createElement('span', { key: 'icon', style: { fontSize: '20px', marginRight: '8px' }}, icon),
      React.createElement('h3', { key: 'title', style: { margin: 0, fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}, title)
    ]),
    React.createElement('div', { key: 'value', style: { fontSize: '24px', fontWeight: 'bold', color: color, lineHeight: '1' }}, displayValue)
  ]);
};

export default Dashboard;