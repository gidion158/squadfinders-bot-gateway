import React, { useState } from 'react';

const ExportButton = (props) => {
  const [isExporting, setIsExporting] = useState(false);
  const { resource, records } = props;

  const exportToCSV = async () => {
    setIsExporting(true);
    
    try {
      // Get current filters from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const filters = {};
      
      // Extract filter parameters
      for (const [key, value] of urlParams.entries()) {
        if (key.startsWith('filters.')) {
          const filterKey = key.replace('filters.', '');
          filters[filterKey] = value;
        }
      }

      // Make API call to export endpoint
      const response = await fetch(`/api/${resource.id}/export?${new URLSearchParams(filters)}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Get the CSV content
      const csvContent = await response.text();
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${resource.id}_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return React.createElement('button', {
    onClick: exportToCSV,
    disabled: isExporting,
    style: {
      backgroundColor: '#43e97b',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: isExporting ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      opacity: isExporting ? 0.6 : 1
    }
  }, [
    React.createElement('span', { key: 'icon' }, '📊'),
    React.createElement('span', { key: 'text' }, isExporting ? 'Exporting...' : 'Export CSV')
  ]);
};

export default ExportButton;