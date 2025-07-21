// frontend/src/App.jsx - Minimal working version
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <MainApp />
      </div>
    </AuthProvider>
  );
};

const MainApp = () => {
  const { user, loading, logout } = useAuth();

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

  return <Dashboard />;
};

// Simple Login Form
const LoginForm = () => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            М&Ю Консулт CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Влезте в системата за управление на недвижими имоти
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email адрес
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email адрес"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Парола
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Парола"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Влизане...' : 'Влезте'}
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Demo акаунти:</p>
              <p>👑 Админ: admin@myucons.bg / admin123</p>
              <p>👤 Агент: agent@myucons.bg / agent123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple Dashboard
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');

  const tabs = [
    { id: 'properties', name: 'Имоти', icon: '🏠' },
    { id: 'buyers', name: 'Купувачи', icon: '👤' },
    { id: 'sellers', name: 'Продавачи', icon: '👥' },
    { id: 'tasks', name: 'Задачи', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">
                М&Ю Консулт CRM
              </h1>
              <span className="text-sm text-gray-500 hidden md:block">
                Система за управление на недвижими имоти
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {user.role === 'admin' ? '👑 Администратор' : '👤 Агент'}
                </div>
              </div>
              
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>

              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Изход
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <SimpleContent activeTab={activeTab} />
      </main>
    </div>
  );
};

// Simple Content Component
const SimpleContent = ({ activeTab }) => {
  const { getProperties, getBuyers, getSellers, getTasks } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result = { data: [] };
      
      switch (activeTab) {
        case 'properties':
          result = await getProperties();
          setData(result.properties || []);
          break;
        case 'buyers':
          result = await getBuyers();
          setData(result.buyers || []);
          break;
        case 'sellers':
          result = await getSellers();
          setData(result.sellers || []);
          break;
        case 'tasks':
          result = await getTasks();
          setData(result.tasks || []);
          break;
        default:
          setData([]);
      }
    } catch (error) {
      console.error(`Error loading ${activeTab}:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Зареждане...</div>
      </div>
    );
  }

  const getIcon = () => {
    switch (activeTab) {
      case 'properties': return '🏠';
      case 'buyers': return '👤';
      case 'sellers': return '👥';
      case 'tasks': return '📋';
      default: return '📄';
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'properties': return 'Имоти';
      case 'buyers': return 'Купувачи';
      case 'sellers': return 'Продавачи';
      case 'tasks': return 'Задачи';
      default: return 'Данни';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {getIcon()} {getTitle()}
        </h2>
        <div className="text-sm text-gray-500">
          Общо: {data.length} записа
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">{getIcon()}</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Няма данни
          </h3>
          <p className="text-gray-600">
            {activeTab === 'properties' && 'Няма добавени имоти'}
            {activeTab === 'buyers' && 'Няма добавени купувачи'}
            {activeTab === 'sellers' && 'Няма добавени продавачи'}
            {activeTab === 'tasks' && 'Няма добавени задачи'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, index) => (
            <div key={item.id || index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeTab === 'properties' && item.title}
                    {activeTab === 'buyers' && `${item.firstName} ${item.lastName}`}
                    {activeTab === 'sellers' && `${item.firstName} ${item.lastName}`}
                    {activeTab === 'tasks' && item.title}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    {activeTab === 'properties' && (
                      <>
                        <div>📍 {item.location}</div>
                        <div>💰 {item.price ? `${parseInt(item.price).toLocaleString('bg-BG')} лв.` : 'Без цена'}</div>
                        <div>🏠 {item.type}</div>
                      </>
                    )}
                    
                    {(activeTab === 'buyers' || activeTab === 'sellers') && (
                      <>
                        <div>📞 {item.phone}</div>
                        <div>📧 {item.email}</div>
                        {activeTab === 'buyers' && item.budget && (
                          <div>💰 {parseInt(item.budget).toLocaleString('bg-BG')} лв.</div>
                        )}
                        {activeTab === 'sellers' && item.propertyAddress && (
                          <div>🏠 {item.propertyAddress}</div>
                        )}
                      </>
                    )}
                    
                    {activeTab === 'tasks' && (
                      <>
                        <div>{item.description}</div>
                        {item.dueDate && (
                          <div>📅 {new Date(item.dueDate).toLocaleDateString('bg-BG')}</div>
                        )}
                        <div>🎯 {item.priority === 'high' ? 'Висок' : item.priority === 'medium' ? 'Среден' : 'Нисък'} приоритет</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;