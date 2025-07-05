import './index.css'

function App() {
  return (
    <div className="app">
      <div className="success-icon">✓</div>
      <h1 className="title">🏠 Real Estate System</h1>
      <p className="subtitle">✅ Успешно стартиране!</p>
      
      <div className="info-box">
        <div className="info-row">
          <span>Frontend:</span>
          <span>localhost:3000</span>
        </div>
        <div className="info-row">
          <span>Backend:</span>
          <span>localhost:3001</span>
        </div>
      </div>
      
      <div className="success-message">
        🎉 Системата е готова за разработка!
      </div>
    </div>
  )
}

export default App