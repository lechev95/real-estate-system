// frontend/src/components/LoginForm.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.error || 'Грешка при влизане');
      }
      // If successful, the AuthContext will handle the redirect
    } catch (error) {
      setError('Грешка при свързване със сървъра');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (email, password) => {
    setFormData({ email, password });
    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Грешка при влизане');
      }
    } catch (error) {
      setError('Грешка при свързване със сървъра');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 1rem'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          animation: 'slideIn 0.6s ease-out'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            🏢
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 0.5rem 0'
          }}>
            М&Ю Консулт CRM
          </h1>
          <p style={{
            color: '#6b7280',
            margin: 0
          }}>
            Влезте в системата за управление на недвижими имоти
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          animation: 'slideIn 0.6s ease-out 0.2s both'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                📧 Email адрес
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'border-color 0.15s ease-in-out',
                  backgroundColor: isLoading ? '#f9fafb' : 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="admin@myucons.bg"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                🔒 Парола
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'border-color 0.15s ease-in-out',
                  backgroundColor: isLoading ? '#f9fafb' : 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="Въведете паролата"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: '#dc2626',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#2563eb';
              }}
              onMouseOut={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#3b82f6';
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid #ffffff40',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Влизане...
                </>
              ) : (
                <>
                  🚪 Влизане в системата
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb',
          marginTop: '1rem',
          animation: 'slideIn 0.6s ease-out 0.4s both'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 1rem 0',
            textAlign: 'center'
          }}>
            🧪 Демо акаунти за тестване
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => handleDemoLogin('admin@myucons.bg', 'admin123')}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: isLoading ? '#f3f4f6' : '#dc2626',
                color: isLoading ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease-in-out'
              }}
              onMouseOver={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#b91c1c';
              }}
              onMouseOut={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#dc2626';
              }}
            >
              👑 Влизане като Администратор
            </button>
            
            <button
              onClick={() => handleDemoLogin('agent@myucons.bg', 'agent123')}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: isLoading ? '#f3f4f6' : '#059669',
                color: isLoading ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease-in-out'
              }}
              onMouseOver={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#047857';
              }}
              onMouseOut={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#059669';
              }}
            >
              👤 Влизане като Агент
            </button>
          </div>

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            color: '#0369a1'
          }}>
            💡 <strong>Администратор:</strong> Пълен достъп + управление на потребители<br/>
            💡 <strong>Агент:</strong> Стандартен достъп до CRM функциите
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#6b7280',
          fontSize: '0.875rem',
          animation: 'slideIn 0.6s ease-out 0.6s both'
        }}>
          <p style={{ margin: 0 }}>
            © 2025 М&Ю Консулт. Система за управление на недвижими имоти.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;