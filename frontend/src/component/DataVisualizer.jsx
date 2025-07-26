import { useState, useEffect, useRef } from 'react';
import { DataTable } from './table';
import { detectPatterns } from '../utils/patterns';
import './DataVisualizer.css';

// Helper functions for pattern analysis
function getSignalType(patternName) {
  const bullishPatterns = ['Hammer', 'Dragonfly Doji', 'Three White Soldiers', 'Rising Window'];
  const bearishPatterns = ['Evening Star'];
  
  if (bullishPatterns.includes(patternName)) return 'BULLISH';
  if (bearishPatterns.includes(patternName)) return 'BEARISH';
  return 'UNKNOWN';
}

function getPatternDescription(patternName) {
  const descriptions = {
    'Hammer': 'Bullish reversal pattern with long lower shadow',
    'Dragonfly Doji': 'Bullish reversal with very small body and long lower shadow',
    'Rising Window': 'Bullish gap indicating strong upward momentum',
    'Evening Star': 'Bearish reversal pattern with three candles',
    'Three White Soldiers': 'Strong bullish trend continuation'
  };
  return descriptions[patternName] || 'Pattern detected';
}

function getPatternColor(patternName) {
  // All are bullish, so always green
  return '#28a745';
}

function getSignalColor(signalType) {
  switch (signalType) {
    case 'BULLISH': return '#fff';
    case 'BEARISH': return '#fff';
    case 'NEUTRAL': return '#495057';
    default: return '#6c757d';
  }
}

function getSignalBgColor(signalType) {
  switch (signalType) {
    case 'BULLISH': return '#28a745';
    case 'BEARISH': return '#dc3545';
    case 'NEUTRAL': return '#ffc107';
    default: return '#6c757d';
  }
}

function getMostCommonPattern(patterns) {
  const patternCounts = {};
  patterns.forEach(pattern => {
    const patternName = pattern.split(' - ')[1];
    patternCounts[patternName] = (patternCounts[patternName] || 0) + 1;
  });
  
  const mostCommon = Object.entries(patternCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return mostCommon ? `${mostCommon[0]} (${mostCommon[1]} times)` : 'None';
}

const INTERVAL_OPTIONS = [
  { label: '1 min', value: 1 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
];

export function DataVisualizer({ selectedCompany }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('01-01-2025');
  const [chartType, setChartType] = useState('candlestick');
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [interval, setInterval] = useState(5);
  const [patterns, setPatterns] = useState([]);
  const canvasRef = useRef(null);

  // Dummy data for testing frontend
  const dummyData = [
    { time: '09:15', open: 1500.50, high: 1520.75, low: 1495.25, close: 1510.00, volume: 125000 },
    { time: '09:20', open: 1510.00, high: 1535.50, low: 1508.00, close: 1525.25, volume: 145000 },
    { time: '09:25', open: 1525.25, high: 1540.00, low: 1520.50, close: 1535.75, volume: 135000 },
    { time: '09:30', open: 1535.75, high: 1550.25, low: 1530.00, close: 1545.50, volume: 155000 },
    { time: '09:35', open: 1545.50, high: 1560.00, low: 1540.25, close: 1555.75, volume: 165000 },
    { time: '09:40', open: 1555.75, high: 1570.50, low: 1550.00, close: 1565.25, volume: 175000 },
    { time: '09:45', open: 1565.25, high: 1580.00, low: 1560.50, close: 1575.75, volume: 185000 },
    { time: '09:50', open: 1575.75, high: 1590.25, low: 1570.00, close: 1585.50, volume: 195000 },
    { time: '09:55', open: 1585.50, high: 1600.00, low: 1580.25, close: 1595.75, volume: 205000 },
    { time: '10:00', open: 1595.75, high: 1610.50, low: 1590.00, close: 1605.25, volume: 215000 }
  ];

  // Get available dates for the selected company
  const getAvailableDates = () => {
    return [
      '01-01-2025', '01-04-2025', '01-07-2025', '02-01-2025', '02-04-2025',
      '02-05-2025', '02-06-2025', '02-07-2025', '03-01-2025', '03-02-2025',
      '03-03-2025', '03-04-2025', '03-06-2025', '03-07-2025', '04-02-2025',
      '04-03-2025', '04-04-2025', '04-06-2025', '04-07-2025', '05-02-2025',
      '05-03-2025', '05-05-2025', '05-06-2025', '06-01-2025', '06-02-2025',
      '06-03-2025', '06-05-2025', '06-06-2025', '07-01-2025', '07-02-2025',
      '07-03-2025', '07-04-2025', '07-05-2025', '07-07-2025', '08-01-2025',
      '08-04-2025', '08-05-2025', '08-07-2025', '09-01-2025', '09-04-2025',
      '09-05-2025', '09-06-2025', '09-07-2025', '10-01-2025', '10-02-2025',
      '10-03-2025', '10-06-2025', '10-07-2025', '11-02-2025', '11-03-2025',
      '11-04-2025', '11-06-2025', '11-07-2025', '12-02-2025', '12-03-2025',
      '12-05-2025', '12-06-2025', '13-01-2025', '13-02-2025', '13-03-2025',
      '13-05-2025', '13-06-2025', '14-01-2025', '14-02-2025', '14-05-2025',
      '14-07-2025', '15-01-2025', '15-04-2025', '15-05-2025', '15-07-2025',
      '16-01-2025', '16-04-2025', '16-05-2025', '16-06-2025', '16-07-2025',
      '17-01-2025', '17-02-2025', '17-03-2025', '17-04-2025', '17-06-2025',
      '17-07-2025', '18-02-2025', '18-03-2025', '18-06-2025', '18-07-2025',
      '19-02-2025', '19-03-2025', '19-06-2025', '20-01-2025', '20-02-2025',
      '20-03-2025', '20-05-2025', '20-06-2025', '21-01-2025', '21-02-2025',
      '21-03-2025', '21-04-2025', '21-05-2025', '21-07-2025', '22-01-2025',
      '22-04-2025', '22-05-2025', '22-07-2025', '23-01-2025', '23-04-2025',
      '23-05-2025', '23-06-2025', '23-07-2025', '24-01-2025', '24-02-2025',
      '24-03-2025', '24-04-2025', '24-06-2025', '24-07-2025', '25-02-2025',
      '25-03-2025', '25-04-2025', '25-06-2025', '26-03-2025', '26-05-2025',
      '26-06-2025', '27-01-2025', '27-02-2025', '27-03-2025', '27-05-2025',
      '27-06-2025', '28-01-2025', '28-02-2025', '28-03-2025', '28-04-2025',
      '28-05-2025', '29-01-2025', '29-04-2025', '29-05-2025', '30-01-2025',
      '30-04-2025', '30-05-2025', '30-06-2025', '31-01-2025'
    ];
  };

  // Load CSV data
  const loadData = async (company, date) => {
    setLoading(true);
    try {
      console.log('Loading data for:', company, date);
      const response = await fetch(`/dataset/${company}/${date}.csv`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      console.log('CSV text length:', csvText.length);
      
      // Parse CSV
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
      console.log('Headers:', headers);
      
      const parsedData = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        // CSV format: date,time,open,high,low,close,volume,oi,exchangecode,symbolcode,expiry
        return {
          time: values[1], // time is in second column
          open: parseFloat(values[2]) || 0, // open is in third column
          high: parseFloat(values[3]) || 0, // high is in fourth column
          low: parseFloat(values[4]) || 0,  // low is in fifth column
          close: parseFloat(values[5]) || 0, // close is in sixth column
          volume: parseInt(values[6]) || 0   // volume is in seventh column
        };
      });
      
      console.log('Parsed data length:', parsedData.length);
      console.log('First few records:', parsedData.slice(0, 3));
      
      // Detect patterns in the parsed data
      const dataWithPatterns = detectPatterns(parsedData);
      const detectedPatterns = dataWithPatterns
        .filter(d => d.patterns && d.patterns.length > 0)
        .flatMap(d => d.patterns.map(pattern => `${d.time} - ${pattern}`));
      
      setData(parsedData);
      setPatterns(detectedPatterns);
      setSelectedDataPoint(null); // Reset selected data point when new data is loaded
    } catch (error) {
      console.error('Error loading data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCompany) {
      console.log('Selected company changed:', selectedCompany.name);
      loadData(selectedCompany.name, selectedDate);
    }
  }, [selectedCompany, selectedDate]);

  // Handle data point selection from table
  const handleDataPointSelect = (dataPoint) => {
    console.log('Data point selected:', dataPoint);
    setSelectedDataPoint(dataPoint);
  };

  // Group data by interval
  function groupDataByInterval(data, intervalMinutes) {
    if (!data || data.length === 0) {
      console.log('No data to group');
      return [];
    }
    
    console.log('Grouping data with interval:', intervalMinutes, 'minutes');
    console.log('Original data length:', data.length);
    
    const grouped = [];
    let group = null;
    let lastGroupTime = null;
    
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      
      // Skip invalid data
      if (!d.time || isNaN(d.open) || isNaN(d.high) || isNaN(d.low) || isNaN(d.close) || isNaN(d.volume)) {
        console.log('Skipping invalid data:', d);
        continue;
      }
      
      // Parse time as minutes since midnight (handle HH:MM:SS format)
      const timeParts = d.time.split(':');
      if (timeParts.length < 2) {
        console.log('Invalid time format:', d.time);
        continue;
      }
      
      const [h, m] = timeParts.map(Number);
      if (isNaN(h) || isNaN(m)) {
        console.log('Invalid time values:', h, m);
        continue;
      }
      
      const totalMinutes = h * 60 + m;
      const groupStart = Math.floor(totalMinutes / intervalMinutes) * intervalMinutes;
      
      if (lastGroupTime !== groupStart) {
        if (group) grouped.push(group);
        group = {
          time: `${String(Math.floor(groupStart / 60)).padStart(2, '0')}:${String(groupStart % 60).padStart(2, '0')}`,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: d.volume,
        };
        lastGroupTime = groupStart;
      } else {
        group.high = Math.max(group.high, d.high);
        group.low = Math.min(group.low, d.low);
        group.close = d.close;
        group.volume += d.volume;
      }
    }
    
    if (group) grouped.push(group);
    
    console.log('Grouped data length:', grouped.length);
    console.log('First few grouped records:', grouped.slice(0, 3));
    
    return grouped;
  }

  // Compute grouped data for chart and pattern analysis - use dummy data if no real data
  const dataToUse = data && data.length > 0 ? data : dummyData;
  const groupedData = groupDataByInterval(dataToUse, interval);
  
  // When preparing data for chart and pattern detection:
  const last20Data = groupedData.slice(-20);

  // Use last20Data for chart rendering and pattern detection
  useEffect(() => {
    if (last20Data && last20Data.length > 0) {
      const dataWithPatterns = detectPatterns(last20Data);
      const detectedPatterns = dataWithPatterns
        .filter(d => d.patterns && d.patterns.length > 0)
        .flatMap(d => d.patterns.map(pattern => `${selectedDate} ${d.time} - ${pattern}`));
      setPatterns(detectedPatterns);
    } else {
      setPatterns([]);
    }
  }, [last20Data, selectedDate, interval]);

  console.log('=== DEBUG INFO ===');
  console.log('Data length:', data?.length);
  console.log('Dummy data length:', dummyData.length);
  console.log('Data to use length:', dataToUse.length);
  console.log('Grouped data length:', groupedData.length);
  console.log('Current loading state:', loading);
  console.log('Current selected data point:', selectedDataPoint);
  console.log('First few grouped records:', groupedData.slice(0, 3));
  console.log('==================');

  // Draw candlestick chart
  const drawCandlestickChart = (ctx, data) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 60;
    
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    if (data.length === 0) return;
    
    // Calculate price range
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices) * 0.999;
    const maxPrice = Math.max(...prices) * 1.001;
    const priceRange = maxPrice - minPrice;
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Vertical grid lines (fewer for cleaner look)
    const step = Math.max(1, Math.floor(data.length / 10));
    for (let i = 0; i < data.length; i += step) {
      const x = padding + (i * chartWidth / (data.length - 1));
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    
    // Draw candlesticks
    const candleWidth = Math.max(1, chartWidth / data.length - 2);
    
    data.forEach((d, i) => {
      const x = padding + (i * chartWidth / (data.length - 1));
      const openY = padding + ((maxPrice - d.open) / priceRange) * chartHeight;
      const closeY = padding + ((maxPrice - d.close) / priceRange) * chartHeight;
      const highY = padding + ((maxPrice - d.high) / priceRange) * chartHeight;
      const lowY = padding + ((maxPrice - d.low) / priceRange) * chartHeight;
      
      const isGreen = d.close >= d.open;
      
      // Draw wick
      ctx.strokeStyle = isGreen ? '#4CAF50' : '#F44336';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // Draw body
      const bodyY = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      
      ctx.fillStyle = isGreen ? '#4CAF50' : '#F44336';
      ctx.fillRect(x - 4, bodyY, 8, bodyHeight);
      
      // Highlight selected data point
      if (selectedDataPoint && selectedDataPoint.time === d.time) {
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 6, bodyY - 2, 12, bodyHeight + 4);
      }
    });
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (i * priceRange / 5);
      const y = padding + (i * chartHeight / 5);
      ctx.fillText(`₹${price.toFixed(2)}`, padding - 10, y + 4);
    }
    
    // X-axis labels
    ctx.textAlign = 'center';
    for (let i = 0; i < data.length; i += Math.max(1, Math.floor(data.length / 8))) {
      const x = padding + (i * chartWidth / (data.length - 1));
      ctx.fillText(data[i].time, x, height - 20);
    }
    
    // Chart title
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${selectedCompany?.name} - ${selectedDate} - Candlestick Chart`, width / 2, 20);
  };

  // Draw line chart
  const drawLineChart = (ctx, data) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 60;
    
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    if (data.length === 0) return;
    
    // Calculate price range
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices) * 0.999;
    const maxPrice = Math.max(...prices) * 1.001;
    const priceRange = maxPrice - minPrice;
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    const step = Math.max(1, Math.floor(data.length / 10));
    for (let i = 0; i < data.length; i += step) {
      const x = padding + (i * chartWidth / (data.length - 1));
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    
    // Draw line
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    data.forEach((d, i) => {
      const x = padding + (i * chartWidth / (data.length - 1));
      const y = padding + ((maxPrice - d.close) / priceRange) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#2196F3';
    data.forEach((d, i) => {
      const x = padding + (i * chartWidth / (data.length - 1));
      const y = padding + ((maxPrice - d.close) / priceRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Highlight selected data point
      if (selectedDataPoint && selectedDataPoint.time === d.time) {
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (i * priceRange / 5);
      const y = padding + (i * chartHeight / 5);
      ctx.fillText(`₹${price.toFixed(2)}`, padding - 10, y + 4);
    }
    
    // X-axis labels
    ctx.textAlign = 'center';
    for (let i = 0; i < data.length; i += Math.max(1, Math.floor(data.length / 8))) {
      const x = padding + (i * chartWidth / (data.length - 1));
      ctx.fillText(data[i].time, x, height - 20);
    }
    
    // Chart title
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${selectedCompany?.name} - ${selectedDate} - Line Chart`, width / 2, 20);
  };

  // Draw volume chart
  const drawVolumeChart = (ctx, data) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 60;
    
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    if (data.length === 0) return;
    
    // Calculate volume range
    const volumes = data.map(d => d.volume);
    const maxVolume = Math.max(...volumes) * 1.1;
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    const step = Math.max(1, Math.floor(data.length / 10));
    for (let i = 0; i < data.length; i += step) {
      const x = padding + (i * chartWidth / (data.length - 1));
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    
    // Draw volume bars
    const barWidth = Math.max(1, chartWidth / data.length - 2);
    
    data.forEach((d, i) => {
      const x = padding + (i * chartWidth / (data.length - 1));
      const barHeight = (d.volume / maxVolume) * chartHeight;
      const barY = height - padding - barHeight;
      
      // Color based on price movement
      const isGreen = i > 0 ? d.close >= data[i - 1].close : true;
      ctx.fillStyle = isGreen ? '#4CAF50' : '#F44336';
      
      ctx.fillRect(x - barWidth/2, barY, barWidth, barHeight);
      
      // Highlight selected data point
      if (selectedDataPoint && selectedDataPoint.time === d.time) {
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - barWidth/2 - 2, barY - 2, barWidth + 4, barHeight + 4);
      }
    });
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const volume = (i * maxVolume / 5);
      const y = padding + (i * chartHeight / 5);
      ctx.fillText(`${(volume / 1000).toFixed(0)}K`, padding - 10, y + 4);
    }
    
    // X-axis labels
    ctx.textAlign = 'center';
    for (let i = 0; i < data.length; i += Math.max(1, Math.floor(data.length / 8))) {
      const x = padding + (i * chartWidth / (data.length - 1));
      ctx.fillText(data[i].time, x, height - 20);
    }
    
    // Chart title
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${selectedCompany?.name} - ${selectedDate} - Volume Chart`, width / 2, 20);
  };

  // Draw chart based on type
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedDataPoint) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Use groupedData for chart display
    const chartData = groupedData.length > 0 ? groupedData : dummyData;
    
    switch (chartType) {
      case 'candlestick': drawCandlestickChart(ctx, chartData); break;
      case 'line': drawLineChart(ctx, chartData); break;
      case 'volume': drawVolumeChart(ctx, chartData); break;
      default: drawCandlestickChart(ctx, chartData);
    }
  }, [groupedData, chartType, selectedDataPoint]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && selectedDataPoint) {
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Use groupedData for chart display
        const chartData = groupedData.length > 0 ? groupedData : dummyData;
        
        switch (chartType) {
          case 'candlestick': drawCandlestickChart(ctx, chartData); break;
          case 'line': drawLineChart(ctx, chartData); break;
          case 'volume': drawVolumeChart(ctx, chartData); break;
          default: drawCandlestickChart(ctx, chartData);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [groupedData, chartType, selectedDataPoint]);

  if (!selectedCompany) {
    return <div className="data-visualizer">Please select a company to view data</div>;
  }

  return (
    <div className="data-visualizer modern-ui-bg">
      {/* Header Section */}
      <div className="dv-header">
        <div className="dv-header-main" >
          <h2 className="dv-company">{selectedCompany?.name || 'Select Company'}</h2>
          <span className="dv-date">{selectedDate}</span>
        </div>
        <div className="dv-header-controls">
          <div className="control-group">
            <label>Date:</label>
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-select"
            >
              {getAvailableDates().map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Interval:</label>
            <select 
              value={interval} 
              onChange={(e) => setInterval(Number(e.target.value))}
              className="interval-select"
            >
              {INTERVAL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
        </div>
      </div>

      <div className={`main-content-layout modern-transition ${selectedDataPoint ? 'chart-mode' : ''}`}>
        {/* Show Table by default, Chart only when data point is selected */}
        {!selectedDataPoint ? (
          <>
            <div className="table-section full-width dv-card dv-fade-in">
              <div className="dv-table-header-row">
                <h3 className="dv-table-title">Stock Data Table</h3>
                <span className="dv-table-tip">💡 Click a row to view chart</span>
              </div>
              <DataTable 
                data={groupedData} 
                loading={loading} 
                onDataPointSelect={handleDataPointSelect}
                selectedDataPoint={selectedDataPoint}
              />
            </div>
            <div className="dv-divider"></div>
            <div className="data-summary dv-card">
              <h3>Data Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Open:</span>
                  <span>₹{groupedData[0]?.open?.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>High:</span>
                  <span>₹{Math.max(...groupedData.map(d => d.high)).toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Low:</span>
                  <span>₹{Math.min(...groupedData.map(d => d.low)).toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Close:</span>
                  <span>₹{groupedData[groupedData.length - 1]?.close?.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Volume:</span>
                  <span>{groupedData.reduce((sum, d) => sum + d.volume, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="chart-section dv-card dv-fade-in">
            <button className="back-to-table-btn modern-back-btn" onClick={() => setSelectedDataPoint(null)}>
              ← Back to Table
            </button>
            <div className="dv-chart-header-row">
              <h3 className="dv-chart-title">{selectedCompany?.name} - {selectedDate} - {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart</h3>
              <span className="dv-chart-tip">📊 Chart for selected row</span>
            </div>
            <div className="chart-container">
              {loading ? (
                <div className="loading">Loading data...</div>
              ) : (
                <canvas ref={canvasRef} className="chart-canvas" />
              )}
            </div>
            {patterns.length > 0 && (
              <div className="patterns-section dv-card" style={{ marginTop: 20 }}>
                <h3>📊 Candlestick Pattern Analysis</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: "100%", 
                    borderCollapse: "collapse", 
                    marginTop: 10,
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ 
                          borderBottom: "2px solid #dee2e6", 
                          textAlign: "left", 
                          padding: "12px 8px",
                          fontWeight: 'bold',
                          color: '#495057'
                        }}>Date & Time</th>
                        <th style={{ 
                          borderBottom: "2px solid #dee2e6", 
                          textAlign: "left", 
                          padding: "12px 8px",
                          fontWeight: 'bold',
                          color: '#495057'
                        }}>Pattern Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patterns.map((pattern, index) => {
                        const [date, time, , ...rest] = pattern.split(' ');
                        const patternName = rest.join(' ').replace(' - ', '');
                        const signalType = getSignalType(patternName);
                        const description = getPatternDescription(patternName);
                        
                        return (
                          <tr key={index} style={{ 
                            borderBottom: '1px solid #dee2e6',
                            backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                          }}>
                            <td style={{ 
                              padding: "12px 8px", 
                              fontWeight: '500',
                              color: '#212529'
                            }}>{`${date} ${time}`}</td>
                            <td style={{ 
                              padding: "12px 8px", 
                              fontWeight: "bold", 
                              color: getPatternColor(patternName)
                            }}>{patternName}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ 
                  marginTop: 15, 
                  padding: '12px', 
                  backgroundColor: '#e7f3ff', 
                  borderRadius: '6px',
                  border: '1px solid #b3d9ff'
                }}>
                  <strong>📈 Analysis Summary:</strong> {patterns.length} pattern(s) detected. 
                  {patterns.length > 0 && (
                    <span> Most common: {getMostCommonPattern(patterns)}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Show message when no data is available */}
      {!loading && groupedData.length === 0 && (
        <div className="instructions dv-card dv-fade-in">
          <p>📊 No data available for the selected company and date. Please try a different date or company.</p>
        </div>
      )}
    </div>
  );
} 