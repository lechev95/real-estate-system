// import React, { useState, useEffect } from 'react';
// import { 
//   Search, Bell, Calendar, Archive, Users, Home, Building2, 
//   Plus, Phone, Mail, MapPin, Euro, Bed, Square, Eye, 
//   Clock, CheckCircle, AlertTriangle, BarChart3, DollarSign,
//   Edit, Trash2, Heart, UserCheck, Filter, Star
// } from 'lucide-react';

// // Complete data for the CRM system
// const initialProperties = [
//   {
//     id: 1,
//     property_type: "sale",
//     category: "apartment",
//     title: "Тристаен апартамент в Лозенец",
//     address: "ул. Фритьоф Нансен 25",
//     city: "София",
//     district: "Лозенец",
//     area: 95,
//     rooms: 3,
//     floor: 4,
//     total_floors: 6,
//     year_built: 2010,
//     exposure: "Юг/Изток",
//     heating: "Централно парно",
//     price_eur: 165000,
//     price_per_sqm: 1737,
//     description: "Светъл тристаен апартамент с две тераси и паркомясто.",
//     status: "available",
//     viewings: 8,
//     last_viewing: "2024-12-05",
//     seller_id: 1,
//     assigned_agent: "Мария Иванова"
//   },
//   {
//     id: 2,
//     property_type: "rent",
//     category: "apartment",
//     title: "Двустаен под наем в Студентски град",
//     address: "бул. Климент Охридски 87",
//     city: "София", 
//     district: "Студентски град",
//     area: 65,
//     rooms: 2,
//     floor: 2,
//     total_floors: 5,
//     year_built: 1985,
//     exposure: "Запад",
//     heating: "Климатици",
//     monthly_rent_eur: 600,
//     rental_conditions: "Депозит 1 месец, без домашни любимци",
//     description: "Обзаведен двустаен апартамент до НБУ.",
//     status: "rented",
//     viewings: 12,
//     last_viewing: "2024-11-30",
//     seller_id: 1,
//     assigned_agent: "Мария Иванова",
//     tenant: {
//       name: "Калин Петков",
//       phone: "+359 888 555 666",
//       contract_start: "2024-12-01",
//       deposit: 600
//     }
//   },
//   {
//     id: 3,
//     property_type: "managed",
//     category: "apartment", 
//     title: "Едностаен - управляван имот",
//     address: "ул. Васил Левски 45",
//     city: "София",
//     district: "Център",
//     area: 45,
//     rooms: 1,
//     floor: 3,
//     total_floors: 4,
//     year_built: 1960,
//     exposure: "Север",
//     heating: "Електрическо",
//     monthly_rent_eur: 450,
//     management_fee_percent: 8,
//     description: "Малък апартамент в сърцето на София.",
//     status: "managed",
//     viewings: 5,
//     seller_id: 2,
//     assigned_agent: "Петър Стойнов",
//     tenant: {
//       name: "Мила Димитрова",
//       phone: "+359 887 777 888",
//       contract_start: "2024-10-01",
//       deposit: 450
//     },
//     landlord: {
//       name: "Елена Тодорова",
//       phone: "+359 887 333 444",
//       payment_day: 5
//     }
//   },
//   {
//     id: 4,
//     property_type: "sale",
//     category: "house",
//     title: "Къща в Бояна",
//     address: "ул. Акад. Борис Стефанов 15",
//     city: "София",
//     district: "Бояна",
//     area: 180,
//     rooms: 4,
//     floor: 1,
//     total_floors: 2,
//     year_built: 2005,
//     exposure: "Юг",
//     heating: "Газово",
//     price_eur: 280000,
//     price_per_sqm: 1556,
//     description: "Красива къща с двор 400кв.м.",
//     status: "available",
//     viewings: 15,
//     last_viewing: "2024-12-06",
//     seller_id: 2,
//     assigned_agent: "Петър Стойнов"
//   }
// ];

// const initialBuyers = [
//   {
//     id: 1,
//     first_name: "Георги",
//     last_name: "Петров", 
//     phone: "+359 888 123 456",
//     email: "georgi.petrov@email.com",
//     budget_min: 80000,
//     budget_max: 120000,
//     preferred_location: "Витоша, София",
//     property_type: "apartment",
//     rooms_min: 2,
//     rooms_max: 3,
//     status: "active",
//     source: "website",
//     assigned_agent: "Мария Иванова",
//     notes: "Търси апартамент с тераса. Предпочита южно изложение.",
//     created_at: "2024-12-01"
//   },
//   {
//     id: 2,
//     first_name: "Анна",
//     last_name: "Димитрова",
//     phone: "+359 887 654 321", 
//     email: "anna.dimitrova@gmail.com",
//     budget_min: 150000,
//     budget_max: 200000,
//     preferred_location: "Лозенец, София",
//     property_type: "house",
//     rooms_min: 3,
//     rooms_max: 4,
//     status: "active",
//     source: "referral",
//     assigned_agent: "Петър Стойнов",
//     notes: "Търси къща с двор за кучето си.",
//     created_at: "2024-11-28"
//   },
//   {
//     id: 3,
//     first_name: "Иван",
//     last_name: "Николов",
//     phone: "+359 888 999 777",
//     email: "ivan.nikolov@company.com",
//     budget_min: 60000,
//     budget_max: 90000,
//     preferred_location: "Студентски град, София",
//     property_type: "apartment",
//     rooms_min: 1,
//     rooms_max: 2,
//     status: "converted",
//     source: "advertisement",
//     assigned_agent: "Мария Иванова",
//     notes: "Купи апартамент през ноември.",
//     created_at: "2024-10-15"
//   },
//   {
//     id: 4,
//     first_name: "Мария",
//     last_name: "Стоянова",
//     phone: "+359 889 444 555",
//     email: "maria.stoyanova@gmail.com",
//     budget_min: 250000,
//     budget_max: 350000,
//     preferred_location: "Бояна, София",
//     property_type: "house",
//     rooms_min: 4,
//     rooms_max: 5,
//     status: "active",
//     source: "recommendation",
//     assigned_agent: "Петър Стойнов",
//     notes: "Търси луксозна къща с голям двор.",
//     created_at: "2024-12-03"
//   }
// ];

// const initialSellers = [
//   {
//     id: 1,
//     first_name: "Стефан",
//     last_name: "Георгиев",
//     phone: "+359 889 111 222",
//     email: "stefan.georgiev@email.com",
//     property_ids: [1, 2],
//     status: "active",
//     assigned_agent: "Мария Иванова",
//     notes: "Собственик на 2 имота в центъра.",
//     created_at: "2024-11-20"
//   },
//   {
//     id: 2,
//     first_name: "Елена",
//     last_name: "Тодорова",
//     phone: "+359 887 333 444",
//     email: "elena.todorova@email.com", 
//     property_ids: [3, 4],
//     status: "active",
//     assigned_agent: "Петър Стойнов",
//     notes: "Собственик на управляван имот и къща.",
//     created_at: "2024-11-25"
//   }
// ];

// const initialTasks = [
//   {
//     id: 1,
//     title: "Обаждане до Георги Петров",
//     description: "Последващ разговор за апартамента в Лозенец",
//     due_date: "2024-12-08",
//     due_time: "14:00",
//     priority: "high",
//     status: "pending",
//     task_type: "follow_up",
//     buyer_id: 1,
//     property_id: 1,
//     assigned_agent: "Мария Иванова"
//   },
//   {
//     id: 2,
//     title: "Договор за наем - подновяване",
//     description: "Подновяване на договора с Мила Димитрова",
//     due_date: "2024-12-15",
//     due_time: "10:00", 
//     priority: "urgent",
//     status: "pending",
//     task_type: "contract_renewal",
//     property_id: 3,
//     assigned_agent: "Петър Стойнов"
//   },
//   {
//     id: 3,
//     title: "Събиране на наем",
//     description: "Месечен наем от управлявания имот",
//     due_date: "2024-12-05",
//     due_time: "09:00",
//     priority: "medium", 
//     status: "completed",
//     task_type: "payment_collection",
//     property_id: 3,
//     assigned_agent: "Петър Стойнов"
//   },
//   {
//     id: 4,
//     title: "Оглед с Анна Димитрова",
//     description: "Показване на къщата в Бояна",
//     due_date: "2024-12-10",
//     due_time: "15:30",
//     priority: "high",
//     status: "pending",
//     task_type: "viewing",
//     buyer_id: 2,
//     property_id: 4,
//     assigned_agent: "Петър Стойнов"
//   },
//   {
//     id: 5,
//     title: "Подготовка на документи",
//     description: "Юридически документи за продажба",
//     due_date: "2024-12-12",
//     due_time: "09:00",
//     priority: "medium",
//     status: "pending",
//     task_type: "documentation",
//     property_id: 1,
//     assigned_agent: "Мария Иванова"
//   }
// ];

// function RealEstateCRM() {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [currency, setCurrency] = useState('EUR');
//   const [properties, setProperties] = useState(initialProperties);
//   const [buyers, setBuyers] = useState(initialBuyers);
//   const [sellers, setSellers] = useState(initialSellers);
//   const [tasks, setTasks] = useState(initialTasks);
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [propertyFilter, setPropertyFilter] = useState('all');
//   const [buyerStatusFilter, setBuyerStatusFilter] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchType, setSearchType] = useState('properties');
//   const [searchResults, setSearchResults] = useState([]);

//   const exchangeRate = 1.95583;
//   const currentDate = new Date().toLocaleDateString('bg-BG');

//   // Currency conversion functions
//   const convertPrice = (price, from, to) => {
//     if (!price) return 0;
//     if (from === to) return price;
//     if (from === 'EUR' && to === 'BGN') return price * exchangeRate;
//     if (from === 'BGN' && to === 'EUR') return price / exchangeRate;
//     return price;
//   };
  
//   const formatCurrency = (amount, currencyCode) => {
//     if (!amount) return '0';
//     return new Intl.NumberFormat('bg-BG', {
//       style: 'currency',
//       currency: currencyCode,
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   // Check for due tasks and create notifications
//   useEffect(() => {
//     const checkDueTasks = () => {
//       const now = new Date();
//       const today = now.toISOString().split('T')[0];
      
//       const dueTasks = tasks.filter(task => {
//         return task.due_date <= today && task.status === 'pending';
//       });
      
//       setNotifications(dueTasks);
//     };
    
//     checkDueTasks();
//     const interval = setInterval(checkDueTasks, 60000);
//     return () => clearInterval(interval);
//   }, [tasks]);

//   // Search functionality
//   const performSearch = () => {
//     let results = [];
    
//     if (searchType === 'properties') {
//       results = properties.filter(item => 
//         item.id.toString().includes(searchQuery) ||
//         item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.district.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     } else if (searchType === 'buyers') {
//       results = buyers.filter(item => 
//         item.id.toString().includes(searchQuery) ||
//         item.phone.includes(searchQuery) ||
//         `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.email.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     } else if (searchType === 'sellers') {
//       results = sellers.filter(item => 
//         item.id.toString().includes(searchQuery) ||
//         item.phone.includes(searchQuery) ||
//         `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.email.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }
    
//     setSearchResults(results);
//   };

//   const stats = {
//     totalProperties: properties.length,
//     availableProperties: properties.filter(p => p.status === 'available').length,
//     activeBuyers: buyers.filter(b => b.status === 'active').length,
//     pendingTasks: tasks.filter(t => t.status === 'pending').length,
//     monthlyRevenue: properties
//       .filter(p => p.property_type === 'managed')
//       .reduce((sum, p) => sum + (p.monthly_rent_eur * (p.management_fee_percent || 8) / 100), 0),
//     averagePrice: properties
//       .filter(p => p.property_type === 'sale' && p.price_eur)
//       .reduce((sum, p, _, arr) => sum + p.price_eur / arr.length, 0)
//   };

//   const styles = {
//     container: { minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' },
//     header: { backgroundColor: '#1e293b', color: 'white', padding: '1rem' },
//     headerContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
//     title: { fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' },
//     userInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
//     currencySelector: { display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#374151', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' },
//     currencySelect: { backgroundColor: 'transparent', color: 'white', border: 'none', outline: 'none', fontSize: '0.875rem' },
//     exchangeRate: { fontSize: '0.75rem', color: '#d1d5db' },
//     notificationBell: { position: 'relative', padding: '0.5rem', backgroundColor: '#374151', borderRadius: '0.5rem', border: 'none', color: 'white', cursor: 'pointer' },
//     notificationBadge: { position: 'absolute', top: '-0.25rem', right: '-0.25rem', backgroundColor: '#ef4444', color: 'white', fontSize: '0.75rem', borderRadius: '50%', width: '1.25rem', height: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
//     navigation: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
//     navButton: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' },
//     main: { padding: '1.5rem' },
//     card: { backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1rem', border: '1px solid #e5e7eb' },
//     grid: { display: 'grid', gap: '1rem' },
//     gridCols2: { gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' },
//     gridCols3: { gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' },
//     gridCols6: { gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' },
//     button: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' },
//     buttonSecondary: { backgroundColor: '#6b7280' },
//     buttonSmall: { fontSize: '0.75rem', padding: '0.375rem 0.75rem' },
//     badge: { display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '500' },
//     badgeGreen: { backgroundColor: '#dcfce7', color: '#166534' },
//     badgeBlue: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
//     badgeGray: { backgroundColor: '#f3f4f6', color: '#374151' },
//     badgeRed: { backgroundColor: '#fee2e2', color: '#dc2626' },
//     badgeOrange: { backgroundColor: '#fed7aa', color: '#ea580c' },
//     input: { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' },
//     select: { padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', backgroundColor: 'white' },
//     propertyCard: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' },
//     propertyImage: { height: '12rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
//     propertyInfo: { padding: '1rem' },
//     priceText: { fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' },
//     priceTextRent: { fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }
//   };

//   const navItems = [
//     { id: 'dashboard', label: '📊 Dashboard', icon: BarChart3 },
//     { id: 'properties', label: '🏠 Имоти', icon: Home },
//     { id: 'buyers', label: '👥 Купувачи', icon: Users },
//     { id: 'sellers', label: '🏪 Продавачи', icon: Building2 },
//     { id: 'search', label: '🔍 Търсене', icon: Search },
//     { id: 'tasks', label: '📅 Задачи', icon: Calendar },
//     { id: 'archive', label: '📁 Архив', icon: Archive }
//   ];

//   // Property Card Component
//   const PropertyCard = ({ property }) => (
//     <div style={styles.propertyCard}>
//       <div style={styles.propertyImage}>
//         <Home size={64} style={{ color: 'white', opacity: 0.7 }} />
//         <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
//           <span style={{
//             ...styles.badge,
//             ...(property.status === 'available' ? styles.badgeGreen :
//                property.status === 'sold' ? styles.badgeGray :
//                property.status === 'rented' ? styles.badgeBlue :
//                { backgroundColor: '#e0e7ff', color: '#6366f1' })
//           }}>
//             {property.status}
//           </span>
//         </div>
//         <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
//           <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '0.375rem', cursor: 'pointer' }}>
//             <Heart size={16} />
//           </button>
//         </div>
//       </div>
      
//       <div style={styles.propertyInfo}>
//         <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
//           <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, flex: 1 }}>{property.title}</h3>
//           <div style={{ display: 'flex', gap: '0.25rem' }}>
//             {Array.from({length: 5}).map((_, i) => (
//               <Star key={i} size={12} style={{ color: i < 4 ? '#fbbf24' : '#d1d5db' }} fill={i < 4 ? '#fbbf24' : 'none'} />
//             ))}
//           </div>
//         </div>
        
//         <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', lineHeight: '1.4' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
//             <MapPin size={14} />
//             {property.address}, {property.district}
//           </div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
//               <Square size={14} />
//               {property.area}м²
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
//               <Bed size={14} />
//               {property.rooms} стаи
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
//               <Eye size={14} />
//               {property.viewings}
//             </div>
//           </div>
//         </div>
        
//         <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <div>
//               {property.property_type === 'sale' ? (
//                 <div>
//                   <p style={styles.priceText}>
//                     {formatCurrency(convertPrice(property.price_eur, 'EUR', currency), currency)}
//                   </p>
//                   <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
//                     <p style={{ margin: '0.25rem 0' }}>{formatCurrency(convertPrice(property.price_per_sqm, 'EUR', currency), currency)}/м²</p>
//                     {currency === 'EUR' ? (
//                       <p style={{ fontSize: '0.75rem', margin: 0 }}>≈ {formatCurrency(property.price_eur * exchangeRate, 'BGN')}</p>
//                     ) : (
//                       <p style={{ fontSize: '0.75rem', margin: 0 }}>≈ {formatCurrency(property.price_eur, 'EUR')}</p>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <div>
//                   <p style={styles.priceTextRent}>
//                     {formatCurrency(convertPrice(property.monthly_rent_eur, 'EUR', currency), currency)}/месец
//                   </p>
//                   <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
//                     {currency === 'EUR' ? (
//                       <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>≈ {formatCurrency(property.monthly_rent_eur * exchangeRate, 'BGN')}/месец</p>
//                     ) : (
//                       <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>≈ {formatCurrency(property.monthly_rent_eur, 'EUR')}/месец</p>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div style={{ display: 'flex', gap: '0.5rem' }}>
//               <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '0.25rem' }}>
//                 <Edit size={16} />
//               </button>
//               <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '0.25rem' }}>
//                 <Trash2 size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
        
//         {property.property_type === 'managed' && property.tenant && (
//           <div style={{
//             marginTop: '0.75rem',
//             padding: '0.75rem',
//             backgroundColor: '#dbeafe',
//             borderRadius: '0.375rem'
//           }}>
//             <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e40af', margin: '0 0 0.25rem 0' }}>👤 Наемател:</h4>
//             <p style={{ fontSize: '0.875rem', color: '#2563eb', margin: '0 0 0.25rem 0' }}>{property.tenant.name}</p>
//             <p style={{ fontSize: '0.75rem', color: '#3b82f6', margin: 0 }}>{property.tenant.phone}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   // Buyer Card Component
//   const BuyerCard = ({ buyer }) => (
//     <div style={styles.card}>
//       <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
//         <div>
//           <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{buyer.first_name} {buyer.last_name}</h3>
//           <span style={{
//             ...styles.badge,
//             ...(buyer.status === 'active' ? styles.badgeGreen :
//                buyer.status === 'converted' ? styles.badgeBlue :
//                styles.badgeGray)
//           }}>
//             {buyer.status}
//           </span>
//         </div>
//         <div style={{ display: 'flex', gap: '0.5rem' }}>
//           <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
//             <Edit size={16} />
//           </button>
//           <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
//             <Archive size={16} />
//           </button>
//         </div>
//       </div>
      
//       <div style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.6' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
//           <Phone size={14} style={{ color: '#6b7280' }} />
//           {buyer.phone}
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
//           <Mail size={14} style={{ color: '#6b7280' }} />
//           {buyer.email}
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
//           <Euro size={14} style={{ color: '#6b7280' }} />
//           <span>Бюджет: {formatCurrency(convertPrice(buyer.budget_min, 'EUR', currency), currency)} - {formatCurrency(convertPrice(buyer.budget_max, 'EUR', currency), currency)}</span>
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
//           <MapPin size={14} style={{ color: '#6b7280' }} />
//           {buyer.preferred_location}
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//           <Home size={14} style={{ color: '#6b7280' }} />
//           {buyer.property_type}, {buyer.rooms_min}-{buyer.rooms_max} стаи
//         </div>
//       </div>
      
//       {buyer.notes && (
//         <div style={{
//           backgroundColor: '#f9fafb',
//           padding: '0.75rem',
//           borderRadius: '0.375rem',
//           fontSize: '0.875rem',
//           marginBottom: '1rem'
//         }}>
//           <strong>Бележки:</strong> {buyer.notes}
//         </div>
//       )}
      
//       <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
//         <button style={{ ...styles.button, ...styles.buttonSmall }}>
//           🔍 Намери имоти
//         </button>
//         <button style={{ ...styles.button, ...styles.buttonSecondary, ...styles.buttonSmall }}>
//           📞 Обади се
//         </button>
//         <button style={{ ...styles.button, backgroundColor: '#ea580c', ...styles.buttonSmall }}>
//           ⏰ Задача
//         </button>
//       </div>
//     </div>
//   );

//   // Task Card Component
//   const TaskCard = ({ task }) => (
//     <div style={styles.card}>
//       <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
//         <div style={{ flex: 1 }}>
//           <h3 style={{ fontWeight: '600', margin: '0 0 0.25rem 0' }}>{task.title}</h3>
//           <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{task.description}</p>
//         </div>
//         <span style={{
//           ...styles.badge,
//           ...(task.priority === 'urgent' ? styles.badgeRed :
//              task.priority === 'high' ? styles.badgeOrange :
//              task.priority === 'medium' ? styles.badgeBlue :
//              styles.badgeGray)
//         }}>
//           {task.priority}
//         </span>
//       </div>
      
//       <div style={{
//         display: 'flex',
//         alignItems: 'center',
//         gap: '1rem',
//         fontSize: '0.875rem',
//         color: '#6b7280',
//         marginBottom: '0.75rem'
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
//           <Calendar size={14} />
//           {task.due_date}
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
//           <Clock size={14} />
//           {task.due_time}
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
//           <UserCheck size={14} />
//           {task.assigned_agent}
//         </div>
//       </div>
      
//       <div style={{ display: 'flex', gap: '0.5rem' }}>
//         {task.status === 'pending' ? (
//           <>
//             <button style={{ ...styles.button, backgroundColor: '#059669', ...styles.buttonSmall }}>
//               ✅ Изпълни
//             </button>
//             <button style={{ ...styles.button, backgroundColor: '#ea580c', ...styles.buttonSmall }}>
//               ⏰ Отложи
//             </button>
//           </>
//         ) : (
//           <span style={{ color: '#059669', fontSize: '0.875rem', fontWeight: '500' }}>✅ Изпълнена</span>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <div style={styles.header}>
//         <div style={styles.headerContent}>
//           <h1 style={styles.title}>
//             <Building2 size={32} />
//             Real Estate CRM
//           </h1>
          
//           <div style={styles.userInfo}>
//             <div style={styles.currencySelector}>
//               <Euro size={16} />
//               <select 
//                 value={currency}
//                 onChange={(e) => setCurrency(e.target.value)}
//                 style={styles.currencySelect}
//               >
//                 <option value="EUR">EUR</option>
//                 <option value="BGN">BGN</option>
//               </select>
//               <div style={styles.exchangeRate}>
//                 <div>1 EUR = {exchangeRate} BGN</div>
//                 <div>{currentDate}</div>
//               </div>
//             </div>
            
//             <button 
//               onClick={() => setShowNotifications(!showNotifications)}
//               style={styles.notificationBell}
//             >
//               <Bell size={20} />
//               {notifications.length > 0 && (
//                 <span style={styles.notificationBadge}>
//                   {notifications.length}
//                 </span>
//               )}
//             </button>
            
//             <div style={{ fontSize: '0.875rem' }}>
//               <div>Мария Иванова</div>
//               <div style={{ color: '#9ca3af' }}>Агент</div>
//             </div>
//           </div>
//         </div>
        
//         <nav style={styles.navigation}>
//           {navItems.map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               style={{
//                 ...styles.navButton,
//                 backgroundColor: activeTab === tab.id ? '#2563eb' : '#374151',
//                 color: 'white'
//               }}
//             >
//               <tab.icon size={16} />
//               {tab.label}
//             </button>
//           ))}
//         </nav>
//       </div>
      
//       <main style={styles.main}>
//         {/* Dashboard */}
//         {activeTab === 'dashboard' && (
//           <div style={{ ...styles.grid, gap: '1.5rem' }}>
//             <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>📊 Dashboard</h2>
            
//             {/* Stats Cards */}
//             <div style={{ ...styles.grid, ...styles.gridCols6 }}>
//               {/* Exchange Rate Card */}
//               <div style={{
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 color: 'white',
//                 borderRadius: '0.5rem',
//                 padding: '1.5rem',
//                 boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
//               }}>
//                 <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: '0 0 0.25rem 0' }}>💰 Обменен курс</p>
//                 <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>1 EUR = {exchangeRate} BGN</p>
//                 <p style={{ fontSize: '0.75rem', opacity: 0.75, margin: 0 }}>{currentDate}</p>
//               </div>
              
//               <div style={{ ...styles.card, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                 <div>
//                   <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>🏠 Общо имоти</p>
//                   <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{stats.totalProperties}</p>
//                 </div>
//                 <Home size={32} style={{ color: '#3b82f6' }} />
//               </div>
              
//               <div style={{ ...styles.card, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                 <div>
//                   <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>✅ Налични</p>
//                   <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>{stats.availableProperties}</p>
//                 </div>
//                 <CheckCircle size={32} style={{ color: '#059669' }} />
//               </div>
              
//               <div style={{ ...styles.card, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                 <div>
//                   <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>👥 Купувачи</p>
//                   <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{stats.activeBuyers}</p>
//                 </div>
//                 <Users size={32} style={{ color: '#2563eb' }} />
//               </div>
              
//               <div style={{ ...styles.card, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                 <div>
//                   <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>📅 Задачи</p>
//                   <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ea580c', margin: 0 }}>{stats.pendingTasks}</p>
//                 </div>
//                 <AlertTriangle size={32} style={{ color: '#ea580c' }} />
//               </div>
              
//               <div style={{ ...styles.card, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                 <div>
//                   <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>💰 Приход</p>
//                   <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>
//                     {formatCurrency(convertPrice(stats.monthlyRevenue, 'EUR', currency), currency)}
//                   </p>
//                 </div>
//                 <DollarSign size={32} style={{ color: '#059669' }} />
//               </div>
//             </div>

//             {/* Recent Activities */}
//             <div style={{ ...styles.grid, ...styles.gridCols2 }}>
//               <div style={styles.card}>
//                 <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>🔥 Най-гледани имоти</h3>
//                 <div style={{ ...styles.grid, gap: '0.75rem' }}>
//                   {properties
//                     .sort((a, b) => b.viewings - a.viewings)
//                     .slice(0, 4)
//                     .map(property => (
//                       <div key={property.id} style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'space-between',
//                         padding: '0.75rem',
//                         backgroundColor: '#f9fafb',
//                         borderRadius: '0.375rem'
//                       }}>
//                         <div>
//                           <p style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>{property.title}</p>
//                           <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{property.district}</p>
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                           <Eye size={16} style={{ color: '#6b7280' }} />
//                           <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{property.viewings}</span>
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               </div>
              
//               <div style={styles.card}>
//                 <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>⏰ Предстоящи задачи</h3>
//                 <div style={{ ...styles.grid, gap: '0.75rem' }}>
//                   {tasks
//                     .filter(task => task.status === 'pending')
//                     .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
//                     .slice(0, 4)
//                     .map(task => (
//                       <div key={task.id} style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'space-between',
//                         padding: '0.75rem',
//                         backgroundColor: '#f9fafb',
//                         borderRadius: '0.375rem'
//                       }}>
//                         <div>
//                           <p style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>{task.title}</p>
//                           <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{task.due_date} в {task.due_time}</p>
//                         </div>
//                         <span style={{
//                           ...styles.badge,
//                           ...(task.priority === 'urgent' ? styles.badgeRed :
//                              task.priority === 'high' ? styles.badgeOrange :
//                              styles.badgeBlue)
//                         }}>
//                           {task.priority}
//                         </span>
//                       </div>
//                     ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {/* Properties */}
//         {activeTab === 'properties' && (
//           <div style={{ ...styles.grid, gap: '1.5rem' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//               <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
//                 🏠 Имоти ({properties.filter(p => propertyFilter === 'all' || p.property_type === propertyFilter).length})
//               </h2>
//               <button style={styles.button}>
//                 <Plus size={16} />
//                 Нов имот
//               </button>
//             </div>
            
//             <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
//               {[
//                 { value: 'all', label: 'Всички', count: properties.length },
//                 { value: 'sale', label: '🏪 Продажба', count: properties.filter(p => p.property_type === 'sale').length },
//                 { value: 'rent', label: '🏠 Наем', count: properties.filter(p => p.property_type === 'rent').length },
//                 { value: 'managed', label: '🏢 Управлявани', count: properties.filter(p => p.property_type === 'managed').length }
//               ].map(filter => (
//                 <button
//                   key={filter.value}
//                   onClick={() => setPropertyFilter(filter.value)}
//                   style={{
//                     padding: '0.5rem 1rem',
//                     borderRadius: '0.5rem',
//                     border: '1px solid #d1d5db',
//                     backgroundColor: propertyFilter === filter.value ? '#2563eb' : 'white',
//                     color: propertyFilter === filter.value ? 'white' : '#374151',
//                     cursor: 'pointer',
//                     fontSize: '0.875rem'
//                   }}
//                 >
//                   {filter.label} ({filter.count})
//                 </button>
//               ))}
//             </div>
            
//             <div style={{ ...styles.grid, ...styles.gridCols3 }}>
//               {properties
//                 .filter(property => propertyFilter === 'all' || property.property_type === propertyFilter)
//                 .map(property => (
//                   <PropertyCard key={property.id} property={property} />
//                 ))}
//             </div>
//           </div>
//         )}
        
//         {/* Buyers */}
//         {activeTab === 'buyers' && (
//           <div style={{ ...styles.grid, gap: '1.5rem' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//               <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
//                 👥 Купувачи ({buyers.filter(b => buyerStatusFilter === 'all' || b.status === buyerStatusFilter).length})
//               </h2>
//               <button style={styles.button}>
//                 <Plus size={16} />
//                 Нов купувач
//               </button>
//             </div>
            
//             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
//               <div style={{ flex: 1 }}>
//                 <input
//                   type="text"
//                   placeholder="Търсене по име или телефон..."
//                   style={styles.input}
//                 />
//               </div>
//               <select 
//                 style={styles.select}
//                 value={buyerStatusFilter}
//                 onChange={(e) => setBuyerStatusFilter(e.target.value)}
//               >
//                 <option value="all">Всички статуси</option>
//                 <option value="active">Активни</option>
//                 <option value="converted">Конвертирани</option>
//                 <option value="inactive">Неактивни</option>
//               </select>
//             </div>
            
//             <div style={{ ...styles.grid, ...styles.gridCols3 }}>
//               {buyers
//                 .filter(buyer => buyerStatusFilter === 'all' || buyer.status === buyerStatusFilter)
//                 .map(buyer => (
//                   <BuyerCard key={buyer.id} buyer={buyer} />
//                 ))}
//             </div>
//           </div>
//         )}
        
//         {/* Sellers */}
//         {activeTab === 'sellers' && (
//           <div style={{ ...styles.grid, gap: '1.5rem' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//               <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>🏪 Продавачи ({sellers.length})</h2>
//               <button style={styles.button}>
//                 <Plus size={16} />
//                 Нов продавач
//               </button>
//             </div>
            
//             <div style={{ ...styles.grid, ...styles.gridCols3 }}>
//               {sellers.map(seller => (
//                 <div key={seller.id} style={styles.card}>
//                   <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
//                     <div>
//                       <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{seller.first_name} {seller.last_name}</h3>
//                       <span style={{ ...styles.badge, ...styles.badgeGreen }}>
//                         {seller.status}
//                       </span>
//                     </div>
//                     <div style={{ display: 'flex', gap: '0.5rem' }}>
//                       <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
//                         <Edit size={16} />
//                       </button>
//                       <button style={{ padding: '0.5rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
//                         <Archive size={16} />
//                       </button>
//                     </div>
//                   </div>
                  
//                   <div style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.6' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
//                       <Phone size={14} style={{ color: '#6b7280' }} />
//                       {seller.phone}
//                     </div>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
//                       <Mail size={14} style={{ color: '#6b7280' }} />
//                       {seller.email}
//                     </div>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
//                       <Building2 size={14} style={{ color: '#6b7280' }} />
//                       {seller.property_ids?.length || 0} имота
//                     </div>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                       <UserCheck size={14} style={{ color: '#6b7280' }} />
//                       {seller.assigned_agent}
//                     </div>
//                   </div>
                  
//                   {seller.notes && (
//                     <div style={{
//                       backgroundColor: '#f9fafb',
//                       padding: '0.75rem',
//                       borderRadius: '0.375rem',
//                       fontSize: '0.875rem',
//                       marginBottom: '1rem'
//                     }}>
//                       <strong>Бележки:</strong> {seller.notes}
//                     </div>
//                   )}
                  
//                   <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
//                     <button style={{ ...styles.button, ...styles.buttonSmall }}>
//                       🏠 Имоти
//                     </button>
//                     <button style={{ ...styles.button, ...styles.buttonSecondary, ...styles.buttonSmall }}>
//                       📞 Обади се
//                     </button>
//                     <button style={{ ...styles.button, backgroundColor: '#ea580c', ...styles.buttonSmall }}>
//                       ⏰ Задача
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
        
//         {/* Search */}
//         {activeTab === 'search' && (
//           <div style={{ ...styles.grid, gap: '1.5rem' }}>
//             <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>🔍 Разширено търсене</h2>
            
//             <div style={styles.card}>
//               <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
//                 {[
//                   { value: 'properties', label: '🏠 Имоти' },
//                   { value: 'buyers', label: '👥 Купувачи' },
//                   { value: 'sellers', label: '🏪 Продавачи' }
//                 ].map(type => (
//                   <button
//                     key={type.value}
//                     onClick={() => setSearchType(type.value)}
//                     style={{
//                       padding: '0.5rem 1rem',
//                       borderRadius: '0.5rem',
//                       border: '1px solid #d1d5db',
//                       backgroundColor: searchType === type.value ? '#2563eb' : 'white',
//                       color: searchType === type.value ? 'white' : '#374151',
//                       cursor: 'pointer',
//                       fontSize: '0.875rem'
//                     }}
//                   >
//                     {type.label}
//                   </button>
//                 ))}
//               </div>
              
//               <div style={{ display: 'flex', gap: '0.5rem' }}>
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Търсене по ID, телефон, име или адрес..."
//                   style={{ ...styles.input, flex: 1 }}
//                   onKeyPress={(e) => e.key === 'Enter' && performSearch()}
//                 />
//                 <button 
//                   onClick={performSearch}
//                   style={styles.button}
//                 >
//                   <Search size={16} />
//                   Търси
//                 </button>
//               </div>
//             </div>
            
//             {searchResults.length > 0 && (
//               <div style={styles.card}>
//                 <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
//                   📋 Резултати ({searchResults.length})
//                 </h3>
//                 <div style={{ ...styles.grid, gap: '0.75rem' }}>
//                   {searchResults.map(result => (
//                     <div key={result.id} style={{
//                       padding: '1rem',
//                       border: '1px solid #e5e7eb',
//                       borderRadius: '0.5rem',
//                       backgroundColor: '#f9fafb'
//                     }}>
//                       {searchType === 'properties' ? (
//                         <div>
//                           <h4 style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>🏠 {result.title}</h4>
//                           <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>📍 {result.address}, {result.district}</p>
//                           <p style={{ fontSize: '0.875rem', color: '#2563eb', margin: 0 }}>
//                             💰 {result.price_eur ? 
//                               formatCurrency(convertPrice(result.price_eur, 'EUR', currency), currency) :
//                               formatCurrency(convertPrice(result.monthly_rent_eur, 'EUR', currency), currency) + '/месец'
//                             }
//                           </p>
//                         </div>
//                       ) : (
//                         <div>
//                           <h4 style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>
//                             {searchType === 'buyers' ? '👥' : '🏪'} {result.first_name} {result.last_name}
//                           </h4>
//                           <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>📞 {result.phone}</p>
//                           <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>📧 {result.email}</p>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
            
//             {searchQuery && searchResults.length === 0 && (
//               <div style={styles.card}>
//                 <div style={{ textAlign: 'center', padding: '2rem' }}>
//                   <Search size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
//                   <p style={{ color: '#6b7280', margin: 0 }}>Няма намерени резултати за "{searchQuery}"</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
        
//         {/* Tasks */}
//         {activeTab === 'tasks' && (
//           <div style={{ ...styles.grid, gap: '1.5rem' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//               <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>📅 Задачи и напомняния ({tasks.length})</h2>
//               <button style={styles.button}>
//                 <Plus size={16} />
//                 Нова задача
//               </button>
//             </div>
            
//             <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
//               <button style={{ ...styles.button, backgroundColor: '#059669' }}>
//                 Всички ({tasks.length})
//               </button>
//               <button style={{ ...styles.button, ...styles.buttonSecondary }}>
//                 Предстоящи ({tasks.filter(t => t.status === 'pending').length})
//               </button>
//               <button style={{ ...styles.button, ...styles.buttonSecondary }}>
//                 Завършени ({tasks.filter(t => t.status === 'completed').length})
//               </button>
//               <button style={{ ...styles.button, backgroundColor: '#dc2626' }}>
//                 Просрочени ({notifications.length})
//               </button>
//             </div>
            
//             <div style={{ ...styles.grid, ...styles.gridCols3 }}>
//               {tasks.map(task => (
//                 <TaskCard key={task.id} task={task} />
//               ))}
//             </div>
//           </div>
//         )}
        
//         {/* Archive */}
//         {activeTab === 'archive' && (
//           <div style={{ ...styles.grid, gap: '1.5rem' }}>
//             <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>📁 Архив</h2>
//             <div style={{
//               ...styles.card,
//               textAlign: 'center',
//               padding: '2rem'
//             }}>
//               <Archive size={64} style={{ color: '#6b7280', margin: '0 auto 1rem' }} />
//               <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>Архивът е празен.</p>
//               <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
//                 Архивираните имоти, купувачи и продавачи ще се показват тук.
//               </p>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// export default RealEstateCRM;

import React, { useState, useEffect } from 'react';
import { propertiesAPI, buyersAPI, sellersAPI, tasksAPI, searchAPI, analyticsAPI } from './services/api';

// Exchange rate (Bulgarian National Bank fixed rate)
const EUR_TO_BGN_RATE = 1.95583;

const App = () => {
  // State management
  const [currentPage, setCurrentPage] = useState('properties');
  const [currency, setCurrency] = useState('EUR');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data state
  const [properties, setProperties] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Modal states
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [propertiesData, buyersData, sellersData, tasksData] = await Promise.all([
        propertiesAPI.getAll(),
        buyersAPI.getAll(),
        sellersAPI.getAll(),
        tasksAPI.getAll()
      ]);
      
      setProperties(propertiesData.properties || propertiesData);
      setBuyers(buyersData.buyers || buyersData);
      setSellers(sellersData.sellers || sellersData);
      setTasks(tasksData.tasks || tasksData);
    } catch (error) {
      setError('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics data for dashboard
  const loadAnalytics = async () => {
    try {
      const data = await analyticsAPI.getDashboard();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  useEffect(() => {
    if (currentPage === 'dashboard') {
      loadAnalytics();
    }
  }, [currentPage]);

  // Property CRUD operations
  const handleAddProperty = async (propertyData) => {
    try {
      const newProperty = await propertiesAPI.create(propertyData);
      setProperties(prev => [...prev, newProperty]);
      setShowPropertyModal(false);
      setEditingItem(null);
    } catch (error) {
      setError('Failed to add property');
      console.error('Error adding property:', error);
    }
  };

  const handleEditProperty = async (id, propertyData) => {
    try {
      const updatedProperty = await propertiesAPI.update(id, propertyData);
      setProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));
      setShowPropertyModal(false);
      setEditingItem(null);
    } catch (error) {
      setError('Failed to update property');
      console.error('Error updating property:', error);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този имот?')) {
      try {
        await propertiesAPI.delete(id);
        setProperties(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        setError('Failed to delete property');
        console.error('Error deleting property:', error);
      }
    }
  };

  // Buyer CRUD operations
  const handleAddBuyer = async (buyerData) => {
    try {
      const newBuyer = await buyersAPI.create(buyerData);
      setBuyers(prev => [...prev, newBuyer]);
      setShowBuyerModal(false);
      setEditingItem(null);
    } catch (error) {
      setError('Failed to add buyer');
      console.error('Error adding buyer:', error);
    }
  };

  const handleEditBuyer = async (id, buyerData) => {
    try {
      const updatedBuyer = await buyersAPI.update(id, buyerData);
      setBuyers(prev => prev.map(b => b.id === id ? updatedBuyer : b));
      setShowBuyerModal(false);
      setEditingItem(null);
    } catch (error) {
      setError('Failed to update buyer');
      console.error('Error updating buyer:', error);
    }
  };

  const handleDeleteBuyer = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този купувач?')) {
      try {
        await buyersAPI.delete(id);
        setBuyers(prev => prev.filter(b => b.id !== id));
      } catch (error) {
        setError('Failed to delete buyer');
        console.error('Error deleting buyer:', error);
      }
    }
  };

  // Task CRUD operations
  const handleAddTask = async (taskData) => {
    try {
      const newTask = await tasksAPI.create(taskData);
      setTasks(prev => [...prev, newTask]);
      setShowTaskModal(false);
      setEditingItem(null);
    } catch (error) {
      setError('Failed to add task');
      console.error('Error adding task:', error);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      const updatedTask = await tasksAPI.markComplete(id);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      setError('Failed to complete task');
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази задача?')) {
      try {
        await tasksAPI.delete(id);
        setTasks(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        setError('Failed to delete task');
        console.error('Error deleting task:', error);
      }
    }
  };

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchAPI.search(searchQuery, searchType);
      setSearchResults(results);
      setCurrentPage('search');
    } catch (error) {
      setError('Search failed');
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatPrice = (priceEur) => {
    if (!priceEur) return 'N/A';
    const price = parseFloat(priceEur);
    if (currency === 'EUR') {
      return `${price.toLocaleString()} EUR`;
    } else {
      const priceBgn = Math.round(price * EUR_TO_BGN_RATE);
      return `${priceBgn.toLocaleString()} лв.`;
    }
  };

  const getFilteredProperties = () => {
    if (propertyFilter === 'all') return properties;
    return properties.filter(property => property.propertyType === propertyFilter);
  };

  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => 
      task.status !== 'completed' && 
      new Date(task.dueDate) < today
    ).length;
  };

  const openEditModal = (item, type) => {
    setEditingItem(item);
    switch (type) {
      case 'property':
        setShowPropertyModal(true);
        break;
      case 'buyer':
        setShowBuyerModal(true);
        break;
      case 'seller':
        setShowSellerModal(true);
        break;
      case 'task':
        setShowTaskModal(true);
        break;
    }
  };

  // Rest of the component remains the same as before...
  // (Header, Navigation, Content rendering, Modals, etc.)
  // I'll continue with the header and main content structure

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">🏠 Real Estate CRM</h1>
              </div>
            </div>

            {/* Currency Selector & User Info */}
            <div className="flex items-center space-x-4">
              {/* Currency Dropdown */}
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EUR">EUR (1.00)</option>
                  <option value="BGN">BGN ({EUR_TO_BGN_RATE})</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  🔔
                  {getOverdueTasks() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getOverdueTasks()}
                    </span>
                  )}
                </button>
              </div>

              {/* User Info */}
              <div className="text-sm text-gray-700">
                <span className="font-medium">Мария Иванова</span>
                <span className="text-gray-500 ml-1">- Агент</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
              { id: 'properties', label: '🏠 Имоти', icon: '🏠' },
              { id: 'buyers', label: '👥 Купувачи', icon: '👥' },
              { id: 'sellers', label: '🏪 Продавачи', icon: '🏪' },
              { id: 'search', label: '🔍 Търсене', icon: '🔍' },
              { id: 'tasks', label: '📅 Задачи', icon: '📅' },
              { id: 'archive', label: '📁 Архив', icon: '📁' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentPage === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Зареждане...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Properties Section */}
        {currentPage === 'properties' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Имоти</h2>
              <button
                onClick={() => setShowPropertyModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Добави имот
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="mb-6 flex space-x-2">
              {[
                { key: 'all', label: `Всички (${properties.length})` },
                { key: 'sale', label: `Продажба (${properties.filter(p => p.propertyType === 'sale').length})` },
                { key: 'rent', label: `Наем (${properties.filter(p => p.propertyType === 'rent').length})` },
                { key: 'managed', label: `Управлявани (${properties.filter(p => p.propertyType === 'managed').length})` }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setPropertyFilter(filter.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    propertyFilter === filter.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredProperties().map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Property Card Content */}
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <span className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-semibold">
                        ⭐ 4/5
                      </span>
                      <button className="text-white hover:text-red-300 transition-colors">
                        ❤️
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        property.status === 'available' ? 'bg-green-500 text-white' :
                        property.status === 'rented' ? 'bg-yellow-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {property.status === 'available' ? 'Свободен' :
                         property.status === 'rented' ? 'Отдаден' :
                         'Управляван'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{property.address}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {property.propertyType === 'sale' ? 
                            formatPrice(property.priceEur) :
                            `${formatPrice(property.monthlyRentEur)}/месец`
                          }
                        </div>
                        {property.propertyType === 'sale' && currency === 'EUR' && (
                          <div className="text-sm text-gray-500">
                            ≈ {Math.round(parseFloat(property.priceEur) * EUR_TO_BGN_RATE).toLocaleString()} лв.
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{property.area} кв.м</div>
                        <div className="text-sm text-gray-500">{property.rooms} стаи</div>
                      </div>
                    </div>

                    {property.tenants && property.tenants.length > 0 && (
                      <div className="mb-4 p-2 bg-gray-50 rounded">
                        <div className="text-sm text-gray-600">
                          👤 Наемател: {property.tenants[0].firstName} {property.tenants[0].lastName}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        👁️ {property.viewings} прегледа
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(property, 'property')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Редактирай
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️ Изтрий
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other sections (buyers, sellers, tasks, etc.) would go here */}
        {/* For brevity, I'll add placeholder sections */}
        
        {currentPage === 'buyers' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Купувачи</h2>
              <button
                onClick={() => setShowBuyerModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Добави купувач
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buyers.map((buyer) => (
                <div key={buyer.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">{buyer.firstName} {buyer.lastName}</h3>
                  <p className="text-gray-600 mb-2">📞 {buyer.phone}</p>
                  <p className="text-gray-600 mb-2">✉️ {buyer.email}</p>
                  <p className="text-gray-600 mb-4">💰 Бюджет: {formatPrice(buyer.budgetMin)} - {formatPrice(buyer.budgetMax)}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      buyer.status === 'active' ? 'bg-green-100 text-green-800' :
                      buyer.status === 'potential' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {buyer.status === 'active' ? 'Активен' :
                       buyer.status === 'potential' ? 'Потенциален' :
                       'Неактивен'}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(buyer, 'buyer')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteBuyer(buyer.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue with other sections... */}
        
      </main>

      {/* Modals would go here */}
      {/* Property Modal, Buyer Modal, etc. */}
      
    </div>
  );
};

export default App;