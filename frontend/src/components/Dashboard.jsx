// frontend/src/components/Dashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import Properties from './Properties.jsx';
import Buyers from './Buyers.jsx';
import Sellers from './Sellers.jsx';
import Tasks from './Tasks.jsx';
import Archive from './Archive.jsx';
import UserManagement from './UserManagement.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');

  const tabs = [
    { id: 'properties', name: '🏠 Имоти', component: Properties },
    { id: 'buyers', name: '👤 Купувачи', component: Buyers },
    { id: 'sellers', name: '👥 Продавачи', component: Sellers },
    { id: 'tasks', name: '📋 Задачи', component: Tasks },
    { id: 'archive', name: '📦 Архив', component: Archive },
    ...(user?.role === 'admin' ? [{ id: 'users', name: '👑 Потребители', component: UserManagement }] : [])
  ];

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;
  const ActiveComponent = activeComponent || Properties;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="text-white">
                <div className="text-2xl font-bold">🏢 М&Ю Консулт</div>
                <div className="text-blue-100 text-sm">CRM Система за недвижими имоти</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-white text-right">
                <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
                <div className="text-blue-100 text-sm">
                  {user?.role === 'admin' ? '👑 Администратор' : '👤 Агент'}
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
              >
                🚪 Изход
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveComponent />
      </main>
    </div>
  );
};

export default Dashboard;