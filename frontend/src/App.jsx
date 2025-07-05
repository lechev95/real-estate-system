function App() {
  const styles = {
    body: {
      margin: 0,
      padding: 0,
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    app: {
      background: 'white',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      textAlign: 'center',
      maxWidth: '500px',
      width: '100%'
    },
    successIcon: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(45deg, #10B981, #059669)',
      borderRadius: '50%',
      margin: '0 auto 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '40px',
      fontWeight: 'bold'
    },
    title: {
      fontSize: '2.5rem',
      color: '#1F2937',
      marginBottom: '10px',
      fontWeight: 'bold'
    },
    subtitle: {
      color: '#10B981',
      fontSize: '1.2rem',
      marginBottom: '30px'
    },
    infoBox: {
      background: '#F8F9FA',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #E5E7EB'
    },
    successMessage: {
      background: 'linear-gradient(45deg, #3B82F6, #10B981)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      fontWeight: '600'
    }
  }

  return (
    <div style={styles.body}>
      <div style={styles.app}>
        <div style={styles.successIcon}>✓</div>
        <h1 style={styles.title}>🏠 Real Estate System</h1>
        <p style={styles.subtitle}>✅ Успешно стартиране!</p>
        
        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span>Frontend:</span>
            <span>localhost:3000</span>
          </div>
          <div style={styles.infoRow}>
            <span>Backend:</span>
            <span>localhost:3001</span>
          </div>
          <div style={{...styles.infoRow, borderBottom: 'none'}}>
            <span>Status:</span>
            <span style={{color: '#10B981'}}>🟢 Online</span>
          </div>
        </div>
        
        <div style={styles.successMessage}>
          🎉 Системата е готова за разработка!
          <br />
          <small>React + Vite + Node.js + Express</small>
        </div>
      </div>
    </div>
  )
}

export default App