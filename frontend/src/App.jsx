function App() {
  return (
    <div className="container">
      <div className="success-icon">
        ✓
      </div>
      <h1 className="title">
        🏠 Real Estate System
      </h1>
      <p className="subtitle">
        ✅ Успешно стартиране!
      </p>
      
      <div className="info-box">
        <div className="info-row">
          <span className="info-label">Frontend:</span>
          <span className="info-value">localhost:3000</span>
        </div>
        <div className="info-row">
          <span className="info-label">Backend:</span>
          <span className="info-value">localhost:3001</span>
        </div>
        <div className="info-row">
          <span className="info-label">Status:</span>
          <span className="info-value status-online">
            <span className="status-indicator"></span>
            Online
          </span>
        </div>
      </div>
      
      <div className="success-message">
        🎉 Системата е готова за разработка!
        <div className="tech-stack">
          React + Vite + Node.js + Express
        </div>
      </div>
    </div>
  )
}

export default App
