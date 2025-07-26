import { useState } from 'react';
import './table.css';

export function DataTable({ data, loading, onDataPointSelect, selectedDataPoint }) {
  const [sortField, setSortField] = useState('time');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    if (sortField === 'time') {
      aValue = new Date(`2025-01-01 ${aValue}`);
      bValue = new Date(`2025-01-01 ${bValue}`);
    }
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleRowClick = (rowData) => {
    if (onDataPointSelect) {
      onDataPointSelect(rowData);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="data-table">
        <div className="table-header">
          <h3>Stock Data Table</h3>
        </div>
        <div className="loading-table">Loading data...</div>
      </div>
    );
  }

  // Show no data state
  if (!data || data.length === 0) {
    return (
      <div className="data-table">
        <div className="table-header">
          <h3>Stock Data Table</h3>
        </div>
        <div className="no-data">No data available</div>
      </div>
    );
  }

  // If a row is selected, show chart/details for that row
  if (selectedDataPoint) {
    return (
      <div>
        <button onClick={() => onDataPointSelect(null)}>Back to Table</button>
        <div>
          <h4>Chart for {selectedDataPoint.time}</h4>
          {/* Replace below with your chart component */}
          <pre>{JSON.stringify(selectedDataPoint, null, 2)}</pre>
        </div>
      </div>
    );
  }

  // Otherwise, show the table
  return (
    <div className="data-table">
      <div className="table-header">
        <h3>Stock Data Table</h3>
        <div className="table-info">
          <span>Total Records: {data.length}</span>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('time')} className="sortable">
                Time {getSortIcon('time')}
              </th>
              <th onClick={() => handleSort('open')} className="sortable">
                Open {getSortIcon('open')}
              </th>
              <th onClick={() => handleSort('high')} className="sortable">
                High {getSortIcon('high')}
              </th>
              <th onClick={() => handleSort('low')} className="sortable">
                Low {getSortIcon('low')}
              </th>
              <th onClick={() => handleSort('close')} className="sortable">
                Close {getSortIcon('close')}
              </th>
              <th onClick={() => handleSort('volume')} className="sortable">
                Volume {getSortIcon('volume')}
              </th>
              <th className="change-column">Change</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => {
              const change = index > 0 ? row.close - sortedData[index - 1].close : 0;
              const changePercent = index > 0 ? (change / sortedData[index - 1].close) * 100 : 0;
              const isPositive = change >= 0;
              return (
                <tr 
                  key={index} 
                  onClick={() => handleRowClick(row)}
                  className="clickable"
                >
                  <td>{row.time}</td>
                  <td>₹{row.open.toFixed(2)}</td>
                  <td>₹{row.high.toFixed(2)}</td>
                  <td>₹{row.low.toFixed(2)}</td>
                  <td>₹{row.close.toFixed(2)}</td>
                  <td>{row.volume.toLocaleString()}</td>
                  <td className={isPositive ? 'positive' : 'negative'}>
                    {change !== 0 ? (
                      <>
                        {isPositive ? '+' : ''}{change.toFixed(2)} 
                        ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
                      </>
                    ) : (
                      '0.00 (0.00%)'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
          </div>
  );
}