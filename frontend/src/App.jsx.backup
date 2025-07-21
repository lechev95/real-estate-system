// frontend/src/App.jsx - Correct Structure
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginForm from './components/LoginForm.jsx';
import UserManagement from './components/UserManagement.jsx';
import Properties from './components/Properties.jsx';
import Buyers from './components/Buyers.jsx';
import Sellers from './components/Sellers.jsx';
import Tasks from './components/Tasks.jsx';

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <MainApp />
      </div>
    </AuthProvider>
  );
};

// Main Application Logic
const MainApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">Зареждане...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');

  const tabs = [
    { id: 'properties', name: 'Имоти', icon: '🏠', component: Properties },
    { id: 'buyers', name: 'Купувачи', icon: '👤', component: Buyers },
    { id: 'sellers', name: 'Продавачи', icon: '👥', component: Sellers },
    { id: 'tasks', name: 'Задачи', icon: '📋', component: Tasks },
    ...(user?.role === 'admin' ? [{ id: 'users', name: 'Потребители', icon: '👑', component: UserManagement }] : [])
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Properties;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">
                М&Ю Консулт CRM
              </h1>
              <span className="text-sm text-gray-500 hidden md:block">
                Система за управление на недвижими имоти
              </span>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {user.role === 'admin' ? '👑 Администратор' : '👤 Агент'}
                </div>
              </div>
              
              {/* User Avatar */}
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                title="Изход"
              >
                <span className="hidden sm:inline">Изход</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ActiveComponent />
      </main>
    </div>
  );
};

export default App;