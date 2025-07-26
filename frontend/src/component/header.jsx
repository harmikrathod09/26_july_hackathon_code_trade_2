import './Header.css';

export function Header() {
  return (
    <header className="header" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px 0',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      <div className="header-content" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="logo">
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>📈 Stock Market Analytics</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>Real-time data visualization and analysis</p>
        </div>
        <div className="header-info" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
     
          <div className="info-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span className="label" style={{ fontSize: '12px', opacity: 0.8 }}>Last Updated:</span>
            <span className="value" style={{ fontSize: '14px', fontWeight: 600 }}>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}