// frontend/src/App.jsx - Working version with Archive module
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

// Login Form
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
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email адрес"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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

// Dashboard with Archive Module
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');

  const tabs = [
    { id: 'properties', name: 'Имоти', icon: '🏠' },
    { id: 'buyers', name: 'Купувачи', icon: '👤' },
    { id: 'sellers', name: 'Продавачи', icon: '👥' },
    { id: 'tasks', name: 'Задачи', icon: '📋' },
    { id: 'archive', name: 'Архив', icon: '📦' }
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
        {activeTab === 'archive' ? <ArchiveModule /> : <ContentModule activeTab={activeTab} />}
      </main>
    </div>
  );
};

// Archive Module
const ArchiveModule = () => {
  const { getProperties, getBuyers, getSellers, deleteProperty, deleteBuyer, deleteSeller } = useAuth();
  const [selectedType, setSelectedType] = useState('properties');
  const [archivedData, setArchivedData] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadArchivedData();
  }, [selectedType]);

  const loadArchivedData = async () => {
    setLoading(true);
    try {
      let result = [];
      
      switch (selectedType) {
        case 'properties':
          const props = await getProperties();
          result = (props.properties || []).filter(p => p.isArchived);
          break;
        case 'buyers':
          const buyers = await getBuyers();
          result = (buyers.buyers || []).filter(b => b.isArchived);
          break;
        case 'sellers':
          const sellers = await getSellers();
          result = (sellers.sellers || []).filter(s => s.isArchived);
          break;
      }
      
      setArchivedData(result);
    } catch (error) {
      console.error('Error loading archived data:', error);
      setArchivedData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете окончателно този запис? Това действие е необратимо!')) {
      return;
    }

    try {
      switch (selectedType) {
        case 'properties':
          await deleteProperty(id);
          break;
        case 'buyers':
          await deleteBuyer(id);
          break;
        case 'sellers':
          await deleteSeller(id);
          break;
      }
      loadArchivedData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const getIcon = () => {
    switch (selectedType) {
      case 'properties': return '🏠';
      case 'buyers': return '👤';
      case 'sellers': return '👥';
      default: return '📦';
    }
  };

  const getTitle = () => {
    switch (selectedType) {
      case 'properties': return 'Архивирани имоти';
      case 'buyers': return 'Архивирани купувачи';
      case 'sellers': return 'Архивирани продавачи';
      default: return 'Архив';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📦 Архив</h2>
          <p className="text-gray-600">Управление на архивирани записи</p>
        </div>
      </div>

      {/* Archive Type Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Изберете тип архив:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'properties', name: 'Архивирани имоти', icon: '🏠', color: 'blue' },
            { id: 'buyers', name: 'Архивирани купувачи', icon: '👤', color: 'green' },
            { id: 'sellers', name: 'Архивирани продавачи', icon: '👥', color: 'orange' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedType === type.id
                  ? `border-${type.color}-500 bg-${type.color}-50`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className={`font-medium ${
                  selectedType === type.id ? `text-${type.color}-700` : 'text-gray-700'
                }`}>
                  {type.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Archive Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {getIcon()} {getTitle()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Общо: {archivedData.length} архивирани записа
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-gray-600">Зареждане на архив...</div>
            </div>
          ) : archivedData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Няма архивирани записи
              </h3>
              <p className="text-gray-600">
                В този тип архив няма записи в момента
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedData.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-75">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-700">
                        {selectedType === 'properties' && item.title}
                        {(selectedType === 'buyers' || selectedType === 'sellers') && 
                          `${item.firstName} ${item.lastName}`}
                      </h4>
                      <div className="text-sm text-gray-500 mt-1">
                        📦 Архивиран
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    {selectedType === 'properties' && (
                      <>
                        <div>📍 {item.location}</div>
                        <div>💰 {item.price ? `${parseInt(item.price).toLocaleString('bg-BG')} лв.` : 'Без цена'}</div>
                        <div>🏠 {item.type}</div>
                      </>
                    )}
                    
                    {(selectedType === 'buyers' || selectedType === 'sellers') && (
                      <>
                        <div>📞 {item.phone}</div>
                        <div>📧 {item.email}</div>
                        {selectedType === 'buyers' && item.budget && (
                          <div>💰 {parseInt(item.budget).toLocaleString('bg-BG')} лв.</div>
                        )}
                        {selectedType === 'sellers' && item.propertyAddress && (
                          <div>🏠 {item.propertyAddress}</div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePermanentDelete(item.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded text-sm font-medium transition-colors duration-200"
                    >
                      🗑️ Изтриване окончателно
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Content Module for other tabs
const ContentModule = ({ activeTab }) => {
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
          setData((result.properties || []).filter(p => !p.isArchived));
          break;
        case 'buyers':
          result = await getBuyers();
          setData((result.buyers || []).filter(b => !b.isArchived));
          break;
        case 'sellers':
          result = await getSellers();
          setData((result.sellers || []).filter(s => !s.isArchived));
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

  const getColor = () => {
    switch (activeTab) {
      case 'properties': return 'blue';
      case 'buyers': return 'green';
      case 'sellers': return 'orange';
      case 'tasks': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {getIcon()} {getTitle()}
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Общо: {data.length} записа
          </div>
          <button className={`bg-${getColor()}-600 hover:bg-${getColor()}-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200`}>
            + Добавяне
          </button>
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
            <div key={item.id || index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
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
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>💰</span>
                          <span className="font-semibold text-green-600">
                            {item.price ? `${parseInt(item.price).toLocaleString('bg-BG')} лв.` : 'Без цена'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🏠</span>
                          <span>{item.type}</span>
                        </div>
                      </>
                    )}
                    
                    {(activeTab === 'buyers' || activeTab === 'sellers') && (
                      <>
                        <div className="flex items-center gap-2">
                          <span>📞</span>
                          <span>{item.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📧</span>
                          <span>{item.email}</span>
                        </div>
                        {activeTab === 'buyers' && item.budget && (
                          <div className="flex items-center gap-2">
                            <span>💰</span>
                            <span className="font-semibold text-green-600">
                              {parseInt(item.budget).toLocaleString('bg-BG')} лв.
                            </span>
                          </div>
                        )}
                        {activeTab === 'sellers' && item.propertyAddress && (
                          <div className="flex items-center gap-2">
                            <span>🏠</span>
                            <span>{item.propertyAddress}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {activeTab === 'tasks' && (
                      <>
                        {item.description && (
                          <div className="text-gray-600 mb-2">{item.description}</div>
                        )}
                        {item.dueDate && (
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{new Date(item.dueDate).toLocaleDateString('bg-BG')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span>🎯</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.priority === 'high' ? 'bg-red-100 text-red-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority === 'high' ? 'Висок' : item.priority === 'medium' ? 'Среден' : 'Нисък'} приоритет
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className={`flex-1 bg-${getColor()}-50 hover:bg-${getColor()}-100 text-${getColor()}-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200`}>
                  ✏️ Редактиране
                </button>
                <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                  📦 Архивиране
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;