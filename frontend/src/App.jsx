import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Sidebar } from './component/Sidebar';
import { Header } from './component/header';
import { DataVisualizer } from './component/DataVisualizer';
import './App.css'

// Import companies array from Sidebar component
const companies = [
  { name: 'BAJAJ-AUTO' },
  { name: 'BHARTIARTL'},
  { name: 'ICICIBANK' },
  { name: 'RELIANCE' },
  { name: 'TCS' },
];

function App() {
  const [selectedCompanyIndex, setSelectedCompanyIndex] = useState(0);
  
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div className="app-container">
        <Sidebar onSelect={setSelectedCompanyIndex} selected={selectedCompanyIndex} companies={companies} />
        <DataVisualizer selectedCompany={companies[selectedCompanyIndex]} />
      </div>
    </div>
  )
}

export default App
