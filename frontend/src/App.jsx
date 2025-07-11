import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, Calendar, Archive, Users, Home, Building2, 
  Plus, Phone, Mail, MapPin, Euro, Bed, Square, Eye, 
  Clock, CheckCircle, AlertTriangle,
  Filter, ArrowUpDown, Edit, Trash2, Star, Heart,
  BarChart3, TrendingUp, DollarSign, UserCheck
} from 'lucide-react';

// Dummy data
const initialBuyers = [
  {
    id: 1,
    first_name: "Георги",
    last_name: "Петров", 
    phone: "+359 888 123 456",
    email: "georgi.petrov@email.com",
    budget_min: 80000,
    budget_max: 120000,
    preferred_location: "Витоша, София",
    property_type: "apartment",
    rooms_min: 2,
    rooms_max: 3,
    status: "active",
    source: "website",
    assigned_agent: "Мария Иванова",
    notes: "Търси апартамент с тераса. Предпочита южно изложение.",
    created_at: "2024-12-01"
  },
  {
    id: 2,
    first_name: "Анна",
    last_name: "Димитрова",
    phone: "+359 887 654 321", 
    email: "anna.dimitrova@gmail.com",
    budget_min: 150000,
    budget_max: 200000,
    preferred_location: "Лозенец, София",
    property_type: "house",
    rooms_min: 3,
    rooms_max: 4,
    status: "active",
    source: "referral",
    assigned_agent: "Петър Стойнов",
    notes: "Търси къща с двор за кучето си.",
    created_at: "2024-11-28"
  },
  {
    id: 3,
    first_name: "Иван",
    last_name: "Николов",
    phone: "+359 888 999 777",
    email: "ivan.nikolov@company.com",
    budget_min: 60000,
    budget_max: 90000,
    preferred_location: "Студентски град, София",
    property_type: "apartment",
    rooms_min: 1,
    rooms_max: 2,
    status: "converted",
    source: "advertisement",
    assigned_agent: "Мария Иванова",
    notes: "Купи апартамент през ноември.",
    created_at: "2024-10-15"
  }
];

const initialSellers = [
  {
    id: 1,
    first_name: "Стефан",
    last_name: "Георгиев",
    phone: "+359 889 111 222",
    email: "stefan.georgiev@email.com",
    property_ids: [1, 2],
    status: "active",
    assigned_agent: "Мария Иванова",
    notes: "Собственик на 2 имота в центъра.",
    created_at: "2024-11-20"
  },
  {
    id: 2,
    first_name: "Елена",
    last_name: "Тодорова",
    phone: "+359 887 333 444",
    email: "elena.todorova@email.com", 
    property_ids: [3],
    status: "active",
    assigned_agent: "Петър Стойнов",
    notes: "Наследи апартамента от баба си.",
    created_at: "2024-11-25"
  }
];

const initialProperties = [
  {
    id: 1,
    property_type: "sale",
    category: "apartment",
    title: "Тристаен апартамент в Лозенец",
    address: "ул. Фритьоф Нансен 25",
    city: "София",
    district: "Лозенец",
    area: 95,
    rooms: 3,
    floor: 4,
    total_floors: 6,
    year_built: 2010,
    exposure: "Юг/Изток",
    layout: "Преминаващи стаи",
    heating: "Централно парно",
    price_eur: 165000,
    price_bgn: 322950,
    price_per_sqm: 1737,
    description: "Светъл тристаен апартамент с две тераси.",
    status: "available",
    viewings: 8,
    last_viewing: "2024-12-05",
    seller_id: 1,
    assigned_agent: "Мария Иванова",
    created_at: "2024-11-20"
  },
  {
    id: 2,
    property_type: "rent",
    category: "apartment",
    title: "Двустаен под наем в Студентски град",
    address: "бул. Климент Охридски 87",
    city: "София", 
    district: "Студентски град",
    area: 65,
    rooms: 2,
    floor: 2,
    total_floors: 5,
    year_built: 1985,
    exposure: "Запад",
    layout: "Непреминаващи стаи",
    heating: "Климатици",
    monthly_rent_eur: 600,
    monthly_rent_bgn: 1174,
    rental_conditions: "Депозит 1 месец, без домашни любимци",
    description: "Обзаведен двустаен апартамент до НБУ.",
    status: "rented",
    viewings: 12,
    last_viewing: "2024-11-30",
    seller_id: 1,
    assigned_agent: "Мария Иванова",
    tenant: {
      name: "Калин Петков",
      phone: "+359 888 555 666",
      contract_start: "2024-12-01",
      deposit: 600
    },
    created_at: "2024-11-15"
  },
  {
    id: 3,
    property_type: "managed",
    category: "apartment", 
    title: "Едностаен - управляван имот",
    address: "ул. Васил Левски 45",
    city: "София",
    district: "Център",
    area: 45,
    rooms: 1,
    floor: 3,
    total_floors: 4,
    year_built: 1960,
    exposure: "Север",
    layout: "Студио",
    heating: "Електрическо",
    monthly_rent_eur: 450,
    monthly_rent_bgn: 881,
    management_fee_percent: 8,
    description: "Малък апартамент в сърцето на София.",
    status: "managed",
    viewings: 5,
    seller_id: 2,
    assigned_agent: "Петър Стойнов",
    tenant: {
      name: "Мила Димитрова",
      phone: "+359 887 777 888",
      contract_start: "2024-10-01",
      deposit: 450
    },
    landlord: {
      name: "Елена Тодорова",
      phone: "+359 887 333 444",
      payment_day: 5
    },
    created_at: "2024-10-01"
  }
];

const initialTasks = [
  {
    id: 1,
    title: "Обаждане до Георги Петров",
    description: "Последващ разговор за апартамента в Лозенец",
    due_date: "2024-12-08",
    due_time: "14:00",
    priority: "high",
    status: "pending",
    task_type: "follow_up",
    buyer_id: 1,
    property_id: 1,
    assigned_agent: "Мария Иванова"
  },
  {
    id: 2,
    title: "Договор за наем - подновяване",
    description: "Подновяване на договора с Мила Димитрова",
    due_date: "2024-12-15",
    due_time: "10:00", 
    priority: "urgent",
    status: "pending",
    task_type: "contract_renewal",
    property_id: 3,
    assigned_agent: "Петър Стойнов"
  },
  {
    id: 3,
    title: "Събиране на наем",
    description: "Месечен наем от управлявания имот",
    due_date: "2024-12-05",
    due_time: "09:00",
    priority: "medium", 
    status: "completed",
    task_type: "payment_collection",
    property_id: 3,
    assigned_agent: "Петър Стойнов"
  }
];

const RealEstateCRM = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [buyers, setBuyers] = useState(initialBuyers);
  const [sellers, setSellers] = useState(initialSellers);
  const [properties, setProperties] = useState(initialProperties);
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Currency settings
  const [currency, setCurrency] = useState('EUR');
  const exchangeRate = 1.95583; // Fixed EUR/BGN rate for Bulgaria
  const currentDate = new Date().toLocaleDateString('bg-BG');
  
  // Currency conversion functions
  const convertPrice = (price, from, to) => {
    if (!price) return 0;
    if (from === to) return price;
    if (from === 'EUR' && to === 'BGN') return price * exchangeRate;
    if (from === 'BGN' && to === 'EUR') return price / exchangeRate;
    return price;
  };
  
  const formatCurrency = (amount, currencyCode) => {
    if (!amount) return '0';
    const formatted = new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return formatted;
  };

  // Check for due tasks and create notifications
  useEffect(() => {
    const checkDueTasks = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const dueTasks = tasks.filter(task => {
        return task.due_date <= today && task.status === 'pending';
      });
      
      setNotifications(dueTasks);
    };
    
    checkDueTasks();
    const interval = setInterval(checkDueTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  const stats = {
    totalProperties: properties.length,
    availableProperties: properties.filter(p => p.status === 'available').length,
    activeBuyers: buyers.filter(b => b.status === 'active').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    monthlyRevenue: properties
      .filter(p => p.property_type === 'managed')
      .reduce((sum, p) => sum + (p.monthly_rent_eur * p.management_fee_percent / 100), 0)
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      backgroundColor: '#1e293b',
      color: 'white',
      padding: '1rem'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    currencySelector: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      backgroundColor: '#374151',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem'
    },
    currencySelect: {
      backgroundColor: 'transparent',
      color: 'white',
      border: 'none',
      outline: 'none',
      fontSize: '0.875rem'
    },
    exchangeRate: {
      fontSize: '0.75rem',
      color: '#d1d5db'
    },
    notificationBell: {
      position: 'relative',
      padding: '0.5rem',
      backgroundColor: '#374151',
      borderRadius: '0.5rem',
      border: 'none',
      color: 'white',
      cursor: 'pointer'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-0.25rem',
      right: '-0.25rem',
      backgroundColor: '#ef4444',
      color: 'white',
      fontSize: '0.75rem',
      borderRadius: '50%',
      width: '1.25rem',
      height: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    navigation: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    navButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '0.875rem'
    },
    navButtonActive: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    navButtonInactive: {
      backgroundColor: '#374151',
      color: '#d1d5db'
    },
    main: {
      padding: '1.5rem'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    grid: {
      display: 'grid',
      gap: '1rem'
    },
    gridCols2: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
    },
    gridCols3: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
    },
    gridCols6: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statNumber: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    buttonSecondary: {
      backgroundColor: '#6b7280'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    badgeGreen: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    badgeBlue: {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8'
    },
    badgeGray: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    propertyImage: {
      height: '12rem',
      background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.5rem 0.5rem 0 0',
      position: 'relative'
    },
    propertyCard: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    propertyInfo: {
      padding: '1rem'
    },
    priceText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#059669'
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem'
    },
    select: {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      backgroundColor: 'white'
    }
  };

  const Navigation = () => (
    <div style={styles.header}>
      <div style={styles.headerContent}>
        <h1 style={styles.title}>
          <Building2 size={32} />
          Real Estate CRM
        </h1>
        
        <div style={styles.userInfo}>
          <div style={styles.currencySelector}>
            <Euro size={16} />
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={styles.currencySelect}
            >
              <option value="EUR">EUR</option>
              <option value="BGN">BGN</option>
            </select>
            <div style={styles.exchangeRate}>
              <div>1 EUR = {exchangeRate} BGN</div>
              <div>{currentDate}</div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={styles.notificationBell}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={styles.notificationBadge}>
                {notifications.length}
              </span>
            )}
          </button>
          
          <div style={{ fontSize: '0.875rem' }}>
            <div>Мария Иванова</div>
            <div style={{ color: '#9ca3af' }}>Агент</div>
          </div>
        </div>
      </div>
      
      <nav style={styles.navigation}>
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: BarChart3 },
          { id: 'properties', label: '🏠 Имоти', icon: Home },
          { id: 'buyers', label: '👥 Купувачи', icon: Users },
          { id: 'sellers', label: '🏪 Продавачи', icon: Building2 },
          { id: 'search', label: '🔍 Търсене', icon: Search },
          { id: 'tasks', label: '📅 Задачи', icon: Calendar },
          { id: 'archive', label: '📁 Архив', icon: Archive }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : styles.navButtonInactive)
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const Dashboard = () => (
    <div style={{ ...styles.grid, gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>📊 Dashboard</h2>
      
      {/* Stats Cards */}
      <div style={{ ...styles.grid, ...styles.gridCols6 }}>
        {/* Exchange Rate Card */}
        <div style={{
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          color: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: '0 0 0.25rem 0' }}>Обменен курс</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>1 EUR = {exchangeRate} BGN</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.75, margin: 0 }}>{currentDate}</p>
          </div>
          <Euro size={32} style={{ opacity: 0.75 }} />
        </div>
        
        <div style={styles.statCard}>
          <div>
            <p style={styles.statLabel}>Общо имоти</p>
            <p style={styles.statNumber}>{stats.totalProperties}</p>
          </div>
          <Home size={32} style={{ color: '#3b82f6' }} />
        </div>
        
        <div style={styles.statCard}>
          <div>
            <p style={styles.statLabel}>Налични</p>
            <p style={{ ...styles.statNumber, color: '#059669' }}>{stats.availableProperties}</p>
          </div>
          <CheckCircle size={32} style={{ color: '#059669' }} />
        </div>
        
        <div style={styles.statCard}>
          <div>
            <p style={styles.statLabel}>Активни купувачи</p>
            <p style={{ ...styles.statNumber, color: '#2563eb' }}>{stats.activeBuyers}</p>
          </div>
          <Users size={32} style={{ color: '#2563eb' }} />
        </div>
        
        <div style={styles.statCard}>
          <div>
            <p style={styles.statLabel}>Задачи</p>
            <p style={{ ...styles.statNumber, color: '#ea580c' }}>{stats.pendingTasks}</p>
          </div>
          <AlertTriangle size={32} style={{ color: '#ea580c' }} />
        </div>
        
        <div style={styles.statCard}>
          <div>
            <p style={styles.statLabel}>Месечен приход</p>
            <p style={{ ...styles.statNumber, color: '#059669' }}>
              {formatCurrency(convertPrice(stats.monthlyRevenue, 'EUR', currency), currency)}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              {currency === 'EUR' ? 
                `≈ ${formatCurrency(stats.monthlyRevenue * exchangeRate, 'BGN')}` :
                `≈ ${formatCurrency(stats.monthlyRevenue, 'EUR')}`
              }
            </p>
          </div>
          <DollarSign size={32} style={{ color: '#059669' }} />
        </div>
      </div>

      {/* Recent Activities */}
      <div style={{ ...styles.grid, ...styles.gridCols2 }}>
        <div style={styles.card}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>🔥 Най-гледани имоти</h3>
          <div style={{ ...styles.grid, gap: '0.75rem' }}>
            {properties
              .sort((a, b) => b.viewings - a.viewings)
              .slice(0, 3)
              .map(property => (
                <div key={property.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem'
                }}>
                  <div>
                    <p style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>{property.title}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{property.district}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Eye size={16} style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{property.viewings}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        <div style={styles.card}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>⏰ Предстоящи задачи</h3>
          <div style={{ ...styles.grid, gap: '0.75rem' }}>
            {tasks
              .filter(task => task.status === 'pending')
              .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
              .slice(0, 3)
              .map(task => (
                <div key={task.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem'
                }}>
                  <div>
                    <p style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>{task.title}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{task.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>{task.due_date}</p>
                    <span style={{
                      ...styles.badge,
                      ...(task.priority === 'urgent' ? { backgroundColor: '#fecaca', color: '#dc2626' } :
                         task.priority === 'high' ? { backgroundColor: '#fed7aa', color: '#ea580c' } :
                         { backgroundColor: '#dbeafe', color: '#2563eb' })
                    }}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const PropertiesView = () => {
    const [propertyFilter, setPropertyFilter] = useState('all');
    
    const filteredProperties = properties.filter(property => {
      if (propertyFilter === 'all') return true;
      return property.property_type === propertyFilter;
    });

    const PropertyCard = ({ property }) => (
      <div style={styles.propertyCard}>
        <div style={styles.propertyImage}>
          <Home size={64} style={{ color: 'white', opacity: 0.5 }} />
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem'
          }}>
            <span style={{
              ...styles.badge,
              ...(property.status === 'available' ? styles.badgeGreen :
                 property.status === 'sold' ? styles.badgeGray :
                 property.status === 'rented' ? styles.badgeBlue :
                 { backgroundColor: '#e0e7ff', color: '#6366f1' })
            }}>
              {property.status}
            </span>
          </div>
        </div>
        
        <div style={styles.propertyInfo}>
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{property.title}</h3>
            <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
              <Heart size={20} />
            </button>
          </div>
          
          <div style={{ ...styles.grid, gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} />
              {property.address}, {property.district}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Square size={16} />
                {property.area}м²
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Bed size={16} />
                {property.rooms} стаи
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Eye size={16} />
                {property.viewings}
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                {property.property_type === 'sale' ? (
                  <div>
                    <p style={styles.priceText}>
                      {formatCurrency(convertPrice(property.price_eur, 'EUR', currency), currency)}
                    </p>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      <p style={{ margin: '0.25rem 0' }}>{formatCurrency(convertPrice(property.price_per_sqm, 'EUR', currency), currency)}/м²</p>
                      {currency === 'EUR' ? (
                        <p style={{ fontSize: '0.75rem', margin: 0 }}>≈ {formatCurrency(property.price_eur * exchangeRate, 'BGN')}</p>
                      ) : (
                        <p style={{ fontSize: '0.75rem', margin: 0 }}>≈ {formatCurrency(property.price_eur, 'EUR')}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ ...styles.priceText, color: '#2563eb' }}>
                      {formatCurrency(convertPrice(property.monthly_rent_eur, 'EUR', currency), currency)}/месец
                    </p>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {currency === 'EUR' ? (
                        <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>≈ {formatCurrency(property.monthly_rent_eur * exchangeRate, 'BGN')}/месец</p>
                      ) : (
                        <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>≈ {formatCurrency(property.monthly_rent_eur, 'EUR')}/месец</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Edit size={16} />
                </button>
                <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {property.property_type === 'managed' && property.tenant && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: '#dbeafe',
              borderRadius: '0.375rem'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e40af', margin: '0 0 0.25rem 0' }}>👤 Наемател:</h4>
              <p style={{ fontSize: '0.875rem', color: '#2563eb', margin: '0 0 0.25rem 0' }}>{property.tenant.name}</p>
              <p style={{ fontSize: '0.75rem', color: '#3b82f6', margin: 0 }}>{property.tenant.phone}</p>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div style={{ ...styles.grid, gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>🏠 Имоти ({filteredProperties.length})</h2>
          <button style={styles.button}>
            <Plus size={16} />
            Нов имот
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'Всички', count: properties.length },
            { value: 'sale', label: '🏪 Продажба', count: properties.filter(p => p.property_type === 'sale').length },
            { value: 'rent', label: '🏠 Наем', count: properties.filter(p => p.property_type === 'rent').length },
            { value: 'managed', label: '🏢 Управлявани', count: properties.filter(p => p.property_type === 'managed').length }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setPropertyFilter(filter.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                backgroundColor: propertyFilter === filter.value ? '#2563eb' : 'white',
                color: propertyFilter === filter.value ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
        
        <div style={{ ...styles.grid, ...styles.gridCols3 }}>
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    );
  };

  const BuyersView = () => {
    const BuyerCard = ({ buyer }) => (
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{buyer.first_name} {buyer.last_name}</h3>
            <span style={{
              ...styles.badge,
              ...(buyer.status === 'active' ? styles.badgeGreen :
                 buyer.status === 'converted' ? styles.badgeBlue :
                 styles.badgeGray)
            }}>
              {buyer.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Edit size={16} />
            </button>
            <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Archive size={16} />
            </button>
          </div>
        </div>
        
        <div style={{ ...styles.grid, gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={16} style={{ color: '#6b7280' }} />
            {buyer.phone}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={16} style={{ color: '#6b7280' }} />
            {buyer.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Euro size={16} style={{ color: '#6b7280' }} />
            Бюджет: {formatCurrency(convertPrice(buyer.budget_min, 'EUR', currency), currency)} - {formatCurrency(convertPrice(buyer.budget_max, 'EUR', currency), currency)}
            {currency === 'EUR' ? (
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                (≈ {formatCurrency(buyer.budget_min * exchangeRate, 'BGN')} - {formatCurrency(buyer.budget_max * exchangeRate, 'BGN')})
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                (≈ {formatCurrency(buyer.budget_min, 'EUR')} - {formatCurrency(buyer.budget_max, 'EUR')})
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} style={{ color: '#6b7280' }} />
            {buyer.preferred_location}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={16} style={{ color: '#6b7280' }} />
            {buyer.property_type}, {buyer.rooms_min}-{buyer.rooms_max} стаи
          </div>
        </div>
        
        {buyer.notes && (
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>
            <strong>Бележки:</strong> {buyer.notes}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button style={{ ...styles.button, fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            🔍 Намери имоти
          </button>
          <button style={{ ...styles.button, ...styles.buttonSecondary, fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            📞 Обади се
          </button>
          <button style={{ ...styles.button, backgroundColor: '#ea580c', fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            ⏰ Задача
          </button>
        </div>
      </div>
    );

    return (
      <div style={{ ...styles.grid, gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>👥 Купувачи ({buyers.length})</h2>
          <button style={styles.button}>
            <Plus size={16} />
            Нов купувач
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Търсене по име или телефон..."
              style={styles.input}
            />
          </div>
          <select style={styles.select}>
            <option value="all">Всички статуси</option>
            <option value="active">Активни</option>
            <option value="converted">Конвертирани</option>
            <option value="inactive">Неактивни</option>
          </select>
        </div>
        
        <div style={{ ...styles.grid, ...styles.gridCols3 }}>
          {buyers.map(buyer => (
            <BuyerCard key={buyer.id} buyer={buyer} />
          ))}
        </div>
      </div>
    );
  };

  const SellersView = () => {
    const SellerCard = ({ seller }) => (
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{seller.first_name} {seller.last_name}</h3>
            <span style={{
              ...styles.badge,
              ...(seller.status === 'active' ? styles.badgeGreen : styles.badgeGray)
            }}>
              {seller.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Edit size={16} />
            </button>
            <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Archive size={16} />
            </button>
          </div>
        </div>
        
        <div style={{ ...styles.grid, gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={16} style={{ color: '#6b7280' }} />
            {seller.phone}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={16} style={{ color: '#6b7280' }} />
            {seller.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={16} style={{ color: '#6b7280' }} />
            {seller.property_ids?.length || 0} имота
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={16} style={{ color: '#6b7280' }} />
            {seller.assigned_agent}
          </div>
        </div>
        
        {seller.notes && (
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>
            <strong>Бележки:</strong> {seller.notes}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button style={{ ...styles.button, fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            🏠 Имоти
          </button>
          <button style={{ ...styles.button, ...styles.buttonSecondary, fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            📞 Обади се
          </button>
          <button style={{ ...styles.button, backgroundColor: '#ea580c', fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            ⏰ Задача
          </button>
        </div>
      </div>
    );

    return (
      <div style={{ ...styles.grid, gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>🏪 Продавачи ({sellers.length})</h2>
          <button style={styles.button}>
            <Plus size={16} />
            Нов продавач
          </button>
        </div>
        
        <div style={{ ...styles.grid, ...styles.gridCols3 }}>
          {sellers.map(seller => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      </div>
    );
  };

  const SearchView = () => {
    const [searchType, setSearchType] = useState('properties');
    const [quickSearchQuery, setQuickSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    const performQuickSearch = () => {
      let results = [];
      
      if (searchType === 'properties') {
        results = properties.filter(item => 
          item.id.toString().includes(quickSearchQuery) ||
          item.title.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
          item.address.toLowerCase().includes(quickSearchQuery.toLowerCase())
        );
      } else if (searchType === 'buyers') {
        results = buyers.filter(item => 
          item.id.toString().includes(quickSearchQuery) ||
          item.phone.includes(quickSearchQuery) ||
          `${item.first_name} ${item.last_name}`.toLowerCase().includes(quickSearchQuery.toLowerCase())
        );
      } else if (searchType === 'sellers') {
        results = sellers.filter(item => 
          item.id.toString().includes(quickSearchQuery) ||
          item.phone.includes(quickSearchQuery) ||
          `${item.first_name} ${item.last_name}`.toLowerCase().includes(quickSearchQuery.toLowerCase())
        );
      }
      
      setSearchResults(results);
    };

    return (
      <div style={{ ...styles.grid, gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>🔍 Разширено търсене</h2>
        
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { value: 'properties', label: '🏠 Имоти' },
              { value: 'buyers', label: '👥 Купувачи' },
              { value: 'sellers', label: '🏪 Продавачи' }
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setSearchType(type.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: searchType === type.value ? '#2563eb' : 'white',
                  color: searchType === type.value ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={quickSearchQuery}
              onChange={(e) => setQuickSearchQuery(e.target.value)}
              placeholder="Търсене по ID, телефон или име..."
              style={{ ...styles.input, flex: 1 }}
              onKeyPress={(e) => e.key === 'Enter' && performQuickSearch()}
            />
            <button 
              onClick={performQuickSearch}
              style={styles.button}
            >
              Търси
            </button>
          </div>
        </div>
        
        {searchResults.length > 0 && (
          <div style={styles.card}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Резултати ({searchResults.length})
            </h3>
            <div style={{ ...styles.grid, gap: '0.75rem' }}>
              {searchResults.map(result => (
                <div key={result.id} style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  {searchType === 'properties' ? (
                    <div>
                      <h4 style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>{result.title}</h4>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>{result.address}</p>
                      <p style={{ fontSize: '0.875rem', color: '#2563eb', margin: 0 }}>
                        {result.price_eur ? 
                          formatCurrency(convertPrice(result.price_eur, 'EUR', currency), currency) :
                          formatCurrency(convertPrice(result.monthly_rent_eur, 'EUR', currency), currency) + '/месец'
                        }
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>{result.first_name} {result.last_name}</h4>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>{result.phone}</p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{result.email}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const TasksView = () => {
    const TaskCard = ({ task }) => (
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: '600', margin: '0 0 0.25rem 0' }}>{task.title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{task.description}</p>
          </div>
          <span style={{
            ...styles.badge,
            ...(task.priority === 'urgent' ? { backgroundColor: '#fecaca', color: '#dc2626' } :
               task.priority === 'high' ? { backgroundColor: '#fed7aa', color: '#ea580c' } :
               task.priority === 'medium' ? { backgroundColor: '#dbeafe', color: '#2563eb' } :
               { backgroundColor: '#f3f4f6', color: '#374151' })
          }}>
            {task.priority}
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={16} />
            {task.due_date}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={16} />
            {task.due_time}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <UserCheck size={16} />
            {task.assigned_agent}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {task.status === 'pending' ? (
            <>
              <button style={{ ...styles.button, backgroundColor: '#059669', fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                ✅ Изпълни
              </button>
              <button style={{ ...styles.button, backgroundColor: '#ea580c', fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                ⏰ Отложи
              </button>
            </>
          ) : (
            <span style={{ color: '#059669', fontSize: '0.875rem', fontWeight: '500' }}>✅ Изпълнена</span>
          )}
        </div>
      </div>
    );

    return (
      <div style={{ ...styles.grid, gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>📅 Задачи и напомняния</h2>
          <button style={styles.button}>
            <Plus size={16} />
            Нова задача
          </button>
        </div>
        
        <div style={{ ...styles.grid, ...styles.gridCols3 }}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  const ArchiveView = () => (
    <div style={{ ...styles.grid, gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>📁 Архив</h2>
      <div style={{
        ...styles.card,
        textAlign: 'center',
        padding: '2rem'
      }}>
        <Archive size={64} style={{ color: '#6b7280', margin: '0 auto 1rem' }} />
        <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>Архивът е празен.</p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
          Архивираните имоти, купувачи и продавачи ще се показват тук.
        </p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <Navigation />
      
      <main style={styles.main}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'properties' && <PropertiesView />}
        {activeTab === 'buyers' && <BuyersView />}
        {activeTab === 'sellers' && <SellersView />}
        {activeTab === 'search' && <SearchView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'archive' && <ArchiveView />}
      </main>
    </div>
  );
};

export default RealEstateCRM;