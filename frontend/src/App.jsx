// frontend/src/App.jsx - Минимална версия за debug
import React, { useState, useEffect } from 'react';

// Опростен AuthContext
const AuthContext = React.createContext();

const API_BASE_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Login failed:', response.status, errorData);
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login success:', data);
      
      setUser(data.user);
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Skip token validation for now, just set loading to false
      setTimeout(() => setLoading(false), 500);
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

function LoginForm() {
  const { login } = React.useContext(AuthContext);
  const [email, setEmail] = useState('admin@myucons.bg');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      setError(error.message || 'Грешка при вход');
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement('div', {
    className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
  }, 
    React.createElement('div', {
      className: "bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
    },
      React.createElement('div', { className: "text-center mb-8" },
        React.createElement('h1', { className: "text-3xl font-bold text-gray-900 mb-2" }, '🏢 М&Ю Консулт'),
        React.createElement('p', { className: "text-gray-600" }, 'CRM Система за недвижими имоти')
      ),

      error && React.createElement('div', {
        className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
      },
        React.createElement('p', { className: "font-medium" }, 'Грешка:'),
        React.createElement('p', null, error)
      ),

      React.createElement('form', { onSubmit: handleSubmit, className: "space-y-6" },
        React.createElement('div', null,
          React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, '📧 Email'),
          React.createElement('input', {
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500",
            placeholder: "admin@myucons.bg",
            required: true
          })
        ),

        React.createElement('div', null,
          React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, '🔒 Парола'),
          React.createElement('input', {
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500",
            placeholder: "admin123",
            required: true
          })
        ),

        React.createElement('button', {
          type: "submit",
          disabled: isLoading,
          className: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300"
        }, isLoading ? 'Влизане...' : '🚪 Влизане в системата'),

        React.createElement('div', { className: "mt-4 text-center text-sm text-gray-600" },
          React.createElement('p', null, 'URL тест: ', API_BASE_URL)
        )
      )
    )
  );
}

function Dashboard() {
  const { user, logout } = React.useContext(AuthContext);

  return React.createElement('div', { className: "min-h-screen bg-gray-50" },
    React.createElement('header', { className: "bg-blue-600 text-white p-6" },
      React.createElement('div', { className: "flex justify-between items-center" },
        React.createElement('h1', { className: "text-2xl font-bold" }, `Добре дошли, ${user?.firstName || 'Потребител'}!`),
        React.createElement('button', {
          onClick: logout,
          className: "bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
        }, '🚪 Изход')
      )
    ),
    React.createElement('main', { className: "p-6" },
      React.createElement('div', { className: "bg-white rounded-lg p-6 shadow" },
        React.createElement('h2', { className: "text-xl font-bold mb-4" }, '✅ Success!'),
        React.createElement('p', null, 'Authentication работи! TypeScript грешките са поправени.'),
        React.createElement('pre', { className: "mt-4 p-4 bg-gray-100 rounded text-sm" }, 
          JSON.stringify(user, null, 2)
        )
      )
    )
  );
}

function App() {
  return React.createElement(AuthProvider, null,
    React.createElement(AppContent, null)
  );
}

function AppContent() {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return React.createElement('div', {
      className: "min-h-screen bg-gray-100 flex items-center justify-center"
    },
      React.createElement('div', { className: "text-center" },
        React.createElement('div', { className: "animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" }),
        React.createElement('div', { className: "text-xl font-semibold text-gray-700" }, 'Зареждане...')
      )
    );
  }

  if (!user) {
    return React.createElement(LoginForm, null);
  }

  return React.createElement(Dashboard, null);
}

export default App;