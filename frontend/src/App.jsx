// frontend/src/App.jsx - Пълна версия с всички компоnenти
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Импортираме компонентите (ще създадем опростени версии)
function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: '📊 Табло', icon: '📊' },
    { id: 'properties', name: '🏠 Имоти', icon: '🏠' },
    { id: 'buyers', name: '👤 Купувачи', icon: '👤' },
    { id: 'sellers', name: '👥 Продавачи', icon: '👥' },
    { id: 'tasks', name: '📋 Задачи', icon: '📋' },
    { id: 'archive', name: '📦 Архив', icon: '📦' },
    ...(user?.role === 'admin' ? [{ id: 'users', name: '👑 Потребители', icon: '👑' }] : [])
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'properties':
        return React.createElement(Properties);
      case 'buyers':
        return React.createElement(Buyers);
      case 'sellers':
        return React.createElement(Sellers);
      case 'tasks':
        return React.createElement(Tasks);
      case 'archive':
        return React.createElement(Archive);
      case 'users':
        return user?.role === 'admin' ? React.createElement(UserManagement) : React.createElement(DashboardHome);
      default:
        return React.createElement(DashboardHome);
    }
  };

  return React.createElement('div', { className: "min-h-screen bg-gray-50" },
    // Header
    React.createElement('header', { className: "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 shadow-lg" },
      React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
        React.createElement('div', { className: "flex justify-between items-center py-4" },
          React.createElement('div', { className: "flex items-center gap-4" },
            React.createElement('div', { className: "text-white" },
              React.createElement('div', { className: "text-2xl font-bold" }, '🏢 М&Ю Консулт'),
              React.createElement('div', { className: "text-blue-100 text-sm" }, 'CRM Система за недвижими имоти')
            )
          ),
          React.createElement('div', { className: "flex items-center gap-4" },
            React.createElement('div', { className: "text-white text-right" },
              React.createElement('div', { className: "font-semibold" }, `${user?.firstName} ${user?.lastName}`),
              React.createElement('div', { className: "text-blue-100 text-sm" },
                user?.role === 'admin' ? '👑 Администратор' : '👤 Агент'
              )
            ),
            React.createElement('button', {
              onClick: logout,
              className: "bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
            }, '🚪 Изход')
          )
        )
      )
    ),

    // Navigation
    React.createElement('nav', { className: "bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40" },
      React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
        React.createElement('div', { className: "flex space-x-8 overflow-x-auto" },
          ...tabs.map((tab) =>
            React.createElement('button', {
              key: tab.id,
              onClick: () => setActiveTab(tab.id),
              className: `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }, tab.name)
          )
        )
      )
    ),

    // Main Content
    React.createElement('main', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" },
      renderContent()
    )
  );
}

function DashboardHome() {
  const { getProperties, getBuyers, getSellers, getTasks } = useAuth();
  const [stats, setStats] = React.useState({
    properties: 0,
    buyers: 0,
    sellers: 0,
    tasks: 0,
    loading: true
  });

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [propertiesData, buyersData, sellersData, tasksData] = await Promise.all([
        getProperties().catch(() => ({ properties: [] })),
        getBuyers().catch(() => ({ buyers: [] })),
        getSellers().catch(() => ({ sellers: [] })),
        getTasks().catch(() => ({ tasks: [] }))
      ]);

      setStats({
        properties: (propertiesData.properties || []).filter(p => !p.isArchived).length,
        buyers: (buyersData.buyers || []).filter(b => !b.isArchived).length,
        sellers: (sellersData.sellers || []).filter(s => !s.isArchived).length,
        tasks: (tasksData.tasks || []).filter(t => t.status !== 'completed').length,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return React.createElement('div', { className: "flex justify-center items-center py-12" },
      React.createElement('div', { className: "flex items-center gap-3" },
        React.createElement('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }),
        React.createElement('span', { className: "text-lg text-gray-600" }, 'Зареждане на статистики...')
      )
    );
  }

  return React.createElement('div', { className: "space-y-6" },
    React.createElement('div', null,
      React.createElement('h2', { className: "text-2xl font-bold text-gray-900" }, '📊 Общ преглед'),
      React.createElement('p', { className: "text-gray-600" }, 'Статистики за вашия CRM')
    ),

    // Stats Grid
    React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" },
      React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500" },
        React.createElement('div', { className: "flex items-center justify-between" },
          React.createElement('div', null,
            React.createElement('p', { className: "text-sm font-medium text-gray-600" }, 'Активни имоти'),
            React.createElement('p', { className: "text-3xl font-bold text-blue-600" }, stats.properties)
          ),
          React.createElement('div', { className: "text-4xl" }, '🏠')
        )
      ),

      React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500" },
        React.createElement('div', { className: "flex items-center justify-between" },
          React.createElement('div', null,
            React.createElement('p', { className: "text-sm font-medium text-gray-600" }, 'Активни купувачи'),
            React.createElement('p', { className: "text-3xl font-bold text-green-600" }, stats.buyers)
          ),
          React.createElement('div', { className: "text-4xl" }, '👤')
        )
      ),

      React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500" },
        React.createElement('div', { className: "flex items-center justify-between" },
          React.createElement('div', null,
            React.createElement('p', { className: "text-sm font-medium text-gray-600" }, 'Активни продавачи'),
            React.createElement('p', { className: "text-3xl font-bold text-orange-600" }, stats.sellers)
          ),
          React.createElement('div', { className: "text-4xl" }, '👥')
        )
      ),

      React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500" },
        React.createElement('div', { className: "flex items-center justify-between" },
          React.createElement('div', null,
            React.createElement('p', { className: "text-sm font-medium text-gray-600" }, 'Активни задачи'),
            React.createElement('p', { className: "text-3xl font-bold text-purple-600" }, stats.tasks)
          ),
          React.createElement('div', { className: "text-4xl" }, '📋')
        )
      )
    ),

    // Welcome Message
    React.createElement('div', { className: "bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white" },
      React.createElement('h3', { className: "text-2xl font-bold mb-4" }, '🎉 Добре дошли в М&Ю Консулт CRM!'),
      React.createElement('p', { className: "text-lg mb-6" }, 'Вашата професионална система за управление на недвижими имоти е готова за работа.'),
      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" },
        React.createElement('div', null,
          React.createElement('h4', { className: "font-semibold mb-2" }, '🚀 Възможности:'),
          React.createElement('ul', { className: "space-y-1" },
            React.createElement('li', null, '• Управление на имоти'),
            React.createElement('li', null, '• Проследяване на купувачи'),
            React.createElement('li', null, '• Работа с продавачи'),
            React.createElement('li', null, '• Задачи и календар')
          )
        ),
        React.createElement('div', null,
          React.createElement('h4', { className: "font-semibold mb-2" }, '⭐ Функции:'),
          React.createElement('ul', { className: "space-y-1" },
            React.createElement('li', null, '• Архивиране на записи'),
            React.createElement('li', null, '• Управление на потребители'),
            React.createElement('li', null, '• Красив responsive дизайн'),
            React.createElement('li', null, '• Модулярна архитектура')
          )
        )
      )
    )
  );
}

// Опростени компоненти (placeholder-и)
function Properties() {
  return React.createElement('div', { className: "text-center py-12" },
    React.createElement('div', { className: "text-8xl mb-6" }, '🏠'),
    React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-4" }, 'Имоти модул'),
    React.createElement('p', { className: "text-gray-600" }, 'Тук ще бъде модулът за управление на имоти')
  );
}

function Buyers() {
  return React.createElement('div', { className: "text-center py-12" },
    React.createElement('div', { className: "text-8xl mb-6" }, '👤'),
    React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-4" }, 'Купувачи модул'),
    React.createElement('p', { className: "text-gray-600" }, 'Тук ще бъде модулът за управление на купувачи')
  );
}

function Sellers() {
  return React.createElement('div', { className: "text-center py-12" },
    React.createElement('div', { className: "text-8xl mb-6" }, '👥'),
    React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-4" }, 'Продавачи модул'),
    React.createElement('p', { className: "text-gray-600" }, 'Тук ще бъде модулът за управление на продавачи')
  );
}

function Tasks() {
  return React.createElement('div', { className: "text-center py-12" },
    React.createElement('div', { className: "text-8xl mb-6" }, '📋'),
    React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-4" }, 'Задачи модул'),
    React.createElement('p', { className: "text-gray-600" }, 'Тук ще бъде модулът за управление на задачи')
  );
}

function Archive() {
  return React.createElement('div', { className: "text-center py-12" },
    React.createElement('div', { className: "text-8xl mb-6" }, '📦'),
    React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-4" }, 'Архив модул'),
    React.createElement('p', { className: "text-gray-600" }, 'Тук ще бъде архивният модул')
  );
}

function UserManagement() {
  return React.createElement('div', { className: "text-center py-12" },
    React.createElement('div', { className: "text-8xl mb-6" }, '👑'),
    React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-4" }, 'Потребители модул'),
    React.createElement('p', { className: "text-gray-600" }, 'Тук ще бъде модулът за управление на потребители')
  );
}

// Login Form компонент
function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('admin@myucons.bg');
  const [password, setPassword] = React.useState('admin123');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

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

        React.createElement('div', { className: "mt-6 p-4 bg-blue-50 rounded-lg" },
          React.createElement('p', { className: "text-sm text-blue-800 font-medium mb-2" }, '🔐 Demo акаунти:'),
          React.createElement('div', { className: "text-sm text-blue-700 space-y-1" },
            React.createElement('div', null, React.createElement('strong', null, 'Админ:'), ' admin@myucons.bg / admin123'),
            React.createElement('div', null, React.createElement('strong', null, 'Агент:'), ' agent@myucons.bg / agent123')
          )
        )
      )
    )
  );
}

// Main App Component
function App() {
  return React.createElement(AuthProvider, null,
    React.createElement(AppContent, null)
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return React.createElement('div', {
      className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
    },
      React.createElement('div', { className: "text-center" },
        React.createElement('div', { className: "animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" }),
        React.createElement('div', { className: "text-xl font-semibold text-gray-700" }, 'Зареждане на М&Ю Консулт CRM...')
      )
    );
  }

  if (!user) {
    return React.createElement(LoginForm, null);
  }

  return React.createElement(Dashboard, null);
}

export default App;