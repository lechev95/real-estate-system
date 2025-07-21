// frontend/src/App.jsx - Complete with Authentication
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import UserManagement from './components/UserManagement.jsx';
import Properties from './components/Properties.jsx';

// Main CRM Component with Authentication
const AuthenticatedCRM = () => {
  const { user, logout, isAdmin, token } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState({ show: false, message: '', onConfirm: null });
  
  // All state management
  const [properties, setProperties] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [editingSeller, setEditingSeller] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Archive view states
  const [viewingArchive, setViewingArchive] = useState(false);

  // API Configuration with Authentication
  const API_BASE_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';
  
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const apiRequest = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers
        }
      });

      if (response.status === 401) {
        logout();
        throw new Error('Сесията е изтекла. Моля влезте отново.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');

      const [propertiesRes, buyersRes, sellersRes, tasksRes] = await Promise.allSettled([
        apiRequest(`${API_BASE_URL}/properties`),
        apiRequest(`${API_BASE_URL}/buyers`),
        apiRequest(`${API_BASE_URL}/sellers`),
        apiRequest(`${API_BASE_URL}/tasks`)
      ]);

      // Handle properties
      if (propertiesRes.status === 'fulfilled') {
        setProperties(propertiesRes.value.properties || []);
      } else {
        console.error('Failed to load properties:', propertiesRes.reason);
      }

      // Handle buyers
      if (buyersRes.status === 'fulfilled') {
        setBuyers(buyersRes.value.buyers || []);
      } else {
        console.error('Failed to load buyers:', buyersRes.reason);
      }

      // Handle sellers
      if (sellersRes.status === 'fulfilled') {
        setSellers(sellersRes.value.sellers || []);
      } else {
        console.error('Failed to load sellers:', sellersRes.reason);
      }

      // Handle tasks
      if (tasksRes.status === 'fulfilled') {
        setTasks(tasksRes.value.tasks || []);
      } else {
        console.error('Failed to load tasks:', tasksRes.reason);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Грешка при зареждане на данни: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Custom Confirmation Dialog
  const CustomConfirm = ({ show, message, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 25px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>⚠️ Потвърждение</h3>
          <p style={{ marginBottom: '2rem', color: '#6b7280' }}>{message}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Отказ
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Потвърди
            </button>
          </div>
        </div>
      </div>
    );
  };

  const confirmAction = (message, onConfirm) => {
    setShowConfirm({
      show: true,
      message,
      onConfirm: () => {
        onConfirm();
        setShowConfirm({ show: false, message: '', onConfirm: null });
      }
    });
  };

  // Property CRUD operations
  const saveProperty = async (propertyData) => {
    try {
      const url = editingProperty 
        ? `${API_BASE_URL}/properties/${editingProperty.id}`
        : `${API_BASE_URL}/properties`;
      
      const method = editingProperty ? 'PUT' : 'POST';
      
      const savedProperty = await apiRequest(url, {
        method,
        body: JSON.stringify(propertyData)
      });

      if (editingProperty) {
        setProperties(properties.map(p => p.id === editingProperty.id ? savedProperty.property : p));
      } else {
        setProperties([...properties, savedProperty.property]);
      }

      setShowPropertyModal(false);
      setEditingProperty(null);
    } catch (error) {
      setError('Грешка при запазване на имот: ' + error.message);
    }
  };

  const archiveProperty = async (id) => {
    try {
      await apiRequest(`${API_BASE_URL}/properties/${id}/archive`, {
        method: 'PUT'
      });
      
      setProperties(properties.map(p => 
        p.id === id ? { ...p, isArchived: true } : p
      ));
    } catch (error) {
      setError('Грешка при архивиране: ' + error.message);
    }
  };

  const deleteProperty = async (id) => {
    try {
      await apiRequest(`${API_BASE_URL}/properties/${id}`, {
        method: 'DELETE'
      });
      
      setProperties(properties.filter(p => p.id !== id));
    } catch (error) {
      setError('Грешка при изтриване: ' + error.message);
    }
  };

  // Buyer CRUD operations
  const saveBuyer = async (buyerData) => {
    try {
      const url = editingBuyer 
        ? `${API_BASE_URL}/buyers/${editingBuyer.id}`
        : `${API_BASE_URL}/buyers`;
      
      const method = editingBuyer ? 'PUT' : 'POST';
      
      const savedBuyer = await apiRequest(url, {
        method,
        body: JSON.stringify(buyerData)
      });

      if (editingBuyer) {
        setBuyers(buyers.map(b => b.id === editingBuyer.id ? savedBuyer.buyer : b));
      } else {
        setBuyers([...buyers, savedBuyer.buyer]);
      }

      setShowBuyerModal(false);
      setEditingBuyer(null);
    } catch (error) {
      setError('Грешка при запазване на купувач: ' + error.message);
    }
  };

  const archiveBuyer = async (id) => {
    try {
      await apiRequest(`${API_BASE_URL}/buyers/${id}/archive`, {
        method: 'PUT'
      });
      
      setBuyers(buyers.map(b => 
        b.id === id ? { ...b, isArchived: true } : b
      ));
    } catch (error) {
      setError('Грешка при архивиране на купувач: ' + error.message);
    }
  };

  const deleteBuyer = async (id) => {
    try {
      await apiRequest(`${API_BASE_URL}/buyers/${id}`, {
        method: 'DELETE'
      });
      
      setBuyers(buyers.filter(b => b.id !== id));
    } catch (error) {
      setError('Грешка при изтриване на купувач: ' + error.message);
    }
  };

  // Seller CRUD operations
  const saveSeller = async (sellerData) => {
    try {
      const url = editingSeller 
        ? `${API_BASE_URL}/sellers/${editingSeller.id}`
        : `${API_BASE_URL}/sellers`;
      
      const method = editingSeller ? 'PUT' : 'POST';
      
      const savedSeller = await apiRequest(url, {
        method,
        body: JSON.stringify(sellerData)
      });

      if (editingSeller) {
        setSellers(sellers.map(s => s.id === editingSeller.id ? savedSeller.seller : s));
      } else {
        setSellers([...sellers, savedSeller.seller]);
      }

      setShowSellerModal(false);
      setEditingSeller(null);
    } catch (error) {
      setError('Грешка при запазване на продавач: ' + error.message);
    }
  };

  const archiveSeller = async (id) => {
    try {
      await apiRequest(`${API_BASE_URL}/sellers/${id}/archive`, {
        method: 'PUT'
      });
      
      setSellers(sellers.map(s => 
        s.id === id ? { ...s, isArchived: true } : s
      ));
    } catch (error) {
      setError('Грешка при архивиране на продавач: ' + error.message);
    }
  };

  const deleteSeller = async (id) => {
    try {
      await apiRequest(`${API_BASE_URL}/sellers/${id}`, {
        method: 'DELETE'
      });
      
      setSellers(sellers.filter(s => s.id !== id));
    } catch (error) {
      setError('Грешка при изтриване на продавач: ' + error.message);
    }
  };

  // Task CRUD operations
  const saveTask = async (taskData) => {
    try {
      const url = editingTask 
        ? `${API_BASE_URL}/tasks/${editingTask.id}`
        : `${API_BASE_URL}/tasks`;
      
      const method = editingTask ? 'PUT' : 'POST';
      
      const savedTask = await apiRequest(url, {
        method,
        body: JSON.stringify(taskData)
      });

      if (editingTask) {
        setTasks(tasks.map(t => t.id === editingTask.id ? savedTask.task : t));
      } else {
        setTasks([...tasks, savedTask.task]);
      }

      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      setError('Грешка при запазване на задача: ' + error.message);
    }
  };

  const completeTask = async (id) => {
    try {
      await apiRequest(`${API_BASE_URL}/tasks/${id}/complete`, {
        method: 'PUT'
      });
      
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, status: 'completed', completedAt: new Date().toISOString() } : t
      ));
    } catch (error) {
      setError('Грешка при завършване на задача: ' + error.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await apiRequest(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE'
      });
      
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      setError('Грешка при изтриване на задача: ' + error.message);
    }
  };

  // Filter functions
  const getActiveProperties = () => properties.filter(p => !p.isArchived);
  const getArchivedProperties = () => properties.filter(p => p.isArchived);
  const getActiveBuyers = () => buyers.filter(b => !b.isArchived);
  const getArchivedBuyers = () => buyers.filter(b => b.isArchived);
  const getActiveSellers = () => sellers.filter(s => !s.isArchived);
  const getArchivedSellers = () => sellers.filter(s => s.isArchived);

  // Statistics
  const getPropertyStats = () => {
    const active = getActiveProperties();
    const archived = getArchivedProperties();
    const totalValue = active.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
    const avgPrice = active.length > 0 ? totalValue / active.length : 0;
    
    return {
      total: active.length,
      archived: archived.length,
      totalValue: totalValue.toLocaleString('bg-BG'),
      avgPrice: avgPrice.toLocaleString('bg-BG')
    };
  };

  const getBuyerStats = () => {
    const active = getActiveBuyers();
    const archived = getArchivedBuyers();
    const totalBudget = active.reduce((sum, b) => sum + (parseFloat(b.budget) || 0), 0);
    const avgBudget = active.length > 0 ? totalBudget / active.length : 0;
    
    return {
      total: active.length,
      archived: archived.length,
      totalBudget: totalBudget.toLocaleString('bg-BG'),
      avgBudget: avgBudget.toLocaleString('bg-BG')
    };
  };

  const getSellerStats = () => {
    const active = getActiveSellers();
    const archived = getArchivedSellers();
    const totalCommission = active.reduce((sum, s) => sum + (parseFloat(s.commission) || 0), 0);
    const avgCommission = active.length > 0 ? totalCommission / active.length : 0;
    
    return {
      total: active.length,
      archived: archived.length,
      avgCommission: avgCommission.toFixed(1)
    };
  };

  const getTaskStats = () => {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    
    return { total: tasks.length, pending, inProgress, completed, overdue };
  };

  // Form components
  const PropertyForm = ({ property, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: property?.title || '',
      description: property?.description || '',
      price: property?.price || '',
      location: property?.location || '',
      type: property?.type || 'Апартамент',
      bedrooms: property?.bedrooms || '',
      bathrooms: property?.bathrooms || '',
      area: property?.area || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Заглавие"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <input
            type="text"
            placeholder="Локация"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>
        <textarea
          placeholder="Описание"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <input
            type="number"
            placeholder="Цена (лв.)"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          >
            <option>Апартамент</option>
            <option>Къща</option>
            <option>Офис</option>
            <option>Парцел</option>
          </select>
          <input
            type="number"
            placeholder="Стаи"
            value={formData.bedrooms}
            onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <input
            type="number"
            step="0.1"
            placeholder="Площ (кв.м)"
            value={formData.area}
            onChange={(e) => setFormData({...formData, area: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Отказ
          </button>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Запазване
          </button>
        </div>
      </form>
    );
  };

  const BuyerForm = ({ buyer, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      firstName: buyer?.firstName || '',
      lastName: buyer?.lastName || '',
      email: buyer?.email || '',
      phone: buyer?.phone || '',
      budget: buyer?.budget || '',
      preferredLocation: buyer?.preferredLocation || '',
      notes: buyer?.notes || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Име"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <input
            type="number"
            placeholder="Бюджет (лв.)"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>
        <input
          type="text"
          placeholder="Предпочитана локация"
          value={formData.preferredLocation}
          onChange={(e) => setFormData({...formData, preferredLocation: e.target.value})}
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
        <textarea
          placeholder="Бележки"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows={3}
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Отказ
          </button>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Запазване
          </button>
        </div>
      </form>
    );
  };

  const SellerForm = ({ seller, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      firstName: seller?.firstName || '',
      lastName: seller?.lastName || '',
      email: seller?.email || '',
      phone: seller?.phone || '',
      propertyAddress: seller?.propertyAddress || '',
      askingPrice: seller?.askingPrice || '',
      commission: seller?.commission || '',
      notes: seller?.notes || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Име"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>
        <input
          type="text"
          placeholder="Адрес на имота"
          value={formData.propertyAddress}
          onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
          required
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input
            type="number"
            placeholder="Искана цена (лв.)"
            value={formData.askingPrice}
            onChange={(e) => setFormData({...formData, askingPrice: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <input
            type="number"
            step="0.1"
            placeholder="Комисионна (%)"
            value={formData.commission}
            onChange={(e) => setFormData({...formData, commission: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>
        <textarea
          placeholder="Бележки"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows={3}
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Отказ
          </button>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Запазване
          </button>
        </div>
      </form>
    );
  };

  const TaskForm = ({ task, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate || '',
      priority: task?.priority || 'medium',
      assignedTo: task?.assignedTo || `${user?.firstName} ${user?.lastName}`,
      relatedType: task?.relatedType || '',
      relatedId: task?.relatedId || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Заглавие на задачата"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
        <textarea
          placeholder="Описание"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <select
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          >
            <option value="low">Нисък приоритет</option>
            <option value="medium">Среден приоритет</option>
            <option value="high">Висок приоритет</option>
          </select>
          <input
            type="text"
            placeholder="Възложено на"
            value={formData.assignedTo}
            onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Отказ
          </button>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Запазване
          </button>
        </div>
      </form>
    );
  };

  // Main render
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid #f3f4f6',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span>Зареждане на данни...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Header with User Menu */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            🏢 М&Ю Консулт CRM
          </h1>
        </div>

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <div style={{
              width: '2rem',
              height: '2rem',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {user?.role === 'admin' ? '👑 Администратор' : '👤 Агент'}
              </div>
            </div>
            <span style={{ fontSize: '0.75rem' }}>▼</span>
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
              minWidth: '200px',
              zIndex: 1000
            }}>
              <div style={{ padding: '0.5rem' }}>
                <div style={{
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  📧 {user?.email}
                </div>
                
                {isAdmin() && (
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setShowUserMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      borderRadius: '0.25rem'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    👥 Потребители
                  </button>
                )}
                
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#dc2626',
                    borderRadius: '0.25rem'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🚪 Изход
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {[
            { id: 'properties', label: '🏠 Имоти', color: '#3b82f6' },
            { id: 'buyers', label: '👤 Купувачи', color: '#10b981' },
            { id: 'sellers', label: '🏪 Продавачи', color: '#f59e0b' },
            { id: 'tasks', label: '📅 Задачи', color: '#8b5cf6' },
            { id: 'archive', label: '📦 Архив', color: '#6b7280' },
            ...(isAdmin() ? [{ id: 'users', label: '👥 Потребители', color: '#dc2626' }] : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 0',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                color: activeTab === tab.id ? tab.color : '#6b7280',
                fontWeight: activeTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#dc2626'
          }}>
            ⚠️ {error}
            <button
              onClick={() => setError('')}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                🏠 Имоти
              </h2>
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setShowPropertyModal(true);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                ➕ Добавяне на имот
              </button>
            </div>

            {/* Properties Statistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {(() => {
                const stats = getPropertyStats();
                return [
                  { label: 'Общо имоти', value: stats.total, color: '#3b82f6', icon: '🏠' },
                  { label: 'Архивирани', value: stats.archived, color: '#6b7280', icon: '📦' },
                  { label: 'Обща стойност', value: stats.totalValue + ' лв.', color: '#10b981', icon: '💰' },
                  { label: 'Средна цена', value: stats.avgPrice + ' лв.', color: '#f59e0b', icon: '📊' }
                ].map(stat => (
                  <div key={stat.label} style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: `2px solid ${stat.color}20`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{stat.label}</span>
                      <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: stat.color
                    }}>
                      {stat.value}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Properties Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {getActiveProperties().map(property => (
                <div key={property.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {property.title}
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    📍 {property.location} • 💰 {parseInt(property.price || 0).toLocaleString('bg-BG')} лв.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setEditingProperty(property);
                        setShowPropertyModal(true);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      ✏️ Редактиране
                    </button>
                    <button
                      onClick={() => confirmAction(
                        'Сигурни ли сте, че искате да архивирате този имот?',
                        () => archiveProperty(property.id)
                      )}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      📦 Архивиране
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {getActiveProperties().length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
                <h3>Няма добавени имоти</h3>
                <p>Започнете с добавяне на първия имот</p>
              </div>
            )}
          </div>
        )}

        {/* Buyers Tab */}
        {activeTab === 'buyers' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                👤 Купувачи
              </h2>
              <button
                onClick={() => {
                  setEditingBuyer(null);
                  setShowBuyerModal(true);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                ➕ Добавяне на купувач
              </button>
            </div>

            {/* Buyers Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {getActiveBuyers().map(buyer => (
                <div key={buyer.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {buyer.firstName} {buyer.lastName}
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    📞 {buyer.phone} • 💰 {parseInt(buyer.budget || 0).toLocaleString('bg-BG')} лв.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setEditingBuyer(buyer);
                        setShowBuyerModal(true);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      ✏️ Редактиране
                    </button>
                    <button
                      onClick={() => confirmAction(
                        'Сигурни ли сте, че искате да архивирате този купувач?',
                        () => archiveBuyer(buyer.id)
                      )}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      📦 Архивиране
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {getActiveBuyers().length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                <h3>Няма добавени купувачи</h3>
                <p>Започнете с добавяне на първия купувач</p>
              </div>
            )}
          </div>
        )}

        {/* Sellers Tab */}
        {activeTab === 'sellers' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                🏪 Продавачи
              </h2>
              <button
                onClick={() => {
                  setEditingSeller(null);
                  setShowSellerModal(true);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                ➕ Добавяне на продавач
              </button>
            </div>

            {/* Sellers Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {getActiveSellers().map(seller => (
                <div key={seller.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {seller.firstName} {seller.lastName}
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    📞 {seller.phone} • 🏠 {seller.propertyAddress}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setEditingSeller(seller);
                        setShowSellerModal(true);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      ✏️ Редактиране
                    </button>
                    <button
                      onClick={() => confirmAction(
                        'Сигурни ли сте, че искате да архивирате този продавач?',
                        () => archiveSeller(seller.id)
                      )}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      📦 Архивиране
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {getActiveSellers().length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
                <h3>Няма добавени продавачи</h3>
                <p>Започнете с добавяне на първия продавач</p>
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                📅 Задачи
              </h2>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                ➕ Добавяне на задача
              </button>
            </div>

            {/* Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.map(task => (
                <div key={task.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  borderLeft: `4px solid ${task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#f59e0b' : '#6b7280'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {task.title}
                      </h3>
                      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                        {task.description}
                      </p>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString('bg-BG') : 'Без срок'} • 
                        👤 {task.assignedTo} • 
                        🎯 {task.priority === 'high' ? 'Висок' : task.priority === 'medium' ? 'Среден' : 'Нисък'} приоритет
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => completeTask(task.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          ✓ Завърши
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setShowTaskModal(true);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ✏️ Редактиране
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {tasks.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <h3>Няма добавени задачи</h3>
                <p>Започнете с добавяне на първата задача</p>
              </div>
            )}
          </div>
        )}

        {/* Archive Tab */}
        {activeTab === 'archive' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
              📦 Архив
            </h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setViewingArchive('properties')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: viewingArchive === 'properties' ? '#3b82f6' : '#f3f4f6',
                  color: viewingArchive === 'properties' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Архивирани имоти ({getArchivedProperties().length})
              </button>
              <button
                onClick={() => setViewingArchive('buyers')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: viewingArchive === 'buyers' ? '#10b981' : '#f3f4f6',
                  color: viewingArchive === 'buyers' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Архивирани купувачи ({getArchivedBuyers().length})
              </button>
              <button
                onClick={() => setViewingArchive('sellers')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: viewingArchive === 'sellers' ? '#f59e0b' : '#f3f4f6',
                  color: viewingArchive === 'sellers' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Архивирани продавачи ({getArchivedSellers().length})
              </button>
            </div>

            {/* Archive Content */}
            {viewingArchive === 'properties' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
              }}>
                {getArchivedProperties().map(property => (
                  <div key={property.id} style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    opacity: 0.8
                  }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {property.title} 📦
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                      📍 {property.location} • 💰 {parseInt(property.price || 0).toLocaleString('bg-BG')} лв.
                    </p>
                    <button
                      onClick={() => confirmAction(
                        'Сигурни ли сте, че искате да изтриете окончателно този имот?',
                        () => deleteProperty(property.id)
                      )}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      🗑️ Изтриване
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Show empty state if no archived items */}
            {((viewingArchive === 'properties' && getArchivedProperties().length === 0) ||
              (viewingArchive === 'buyers' && getArchivedBuyers().length === 0) ||
              (viewingArchive === 'sellers' && getArchivedSellers().length === 0) ||
              !viewingArchive) && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                <h3>Архивът е празен</h3>
                <p>Тук ще видите архивираните записи</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab (Admin Only) */}
        {activeTab === 'users' && isAdmin() && (
          <UserManagement />
        )}
      </main>

      {/* Modals */}
      {showPropertyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>
              🏠 {editingProperty ? 'Редактиране на имот' : 'Добавяне на имот'}
            </h3>
            <PropertyForm
              property={editingProperty}
              onSave={saveProperty}
              onCancel={() => {
                setShowPropertyModal(false);
                setEditingProperty(null);
              }}
            />
          </div>
        </div>
      )}

      {showBuyerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>
              👤 {editingBuyer ? 'Редактиране на купувач' : 'Добавяне на купувач'}
            </h3>
            <BuyerForm
              buyer={editingBuyer}
              onSave={saveBuyer}
              onCancel={() => {
                setShowBuyerModal(false);
                setEditingBuyer(null);
              }}
            />
          </div>
        </div>
      )}

      {showSellerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>
              🏪 {editingSeller ? 'Редактиране на продавач' : 'Добавяне на продавач'}
            </h3>
            <SellerForm
              seller={editingSeller}
              onSave={saveSeller}
              onCancel={() => {
                setShowSellerModal(false);
                setEditingSeller(null);
              }}
            />
          </div>
        </div>
      )}

      {showTaskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>
              📅 {editingTask ? 'Редактиране на задача' : 'Добавяне на задача'}
            </h3>
            <TaskForm
              task={editingTask}
              onSave={saveTask}
              onCancel={() => {
                setShowTaskModal(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      <CustomConfirm
        show={showConfirm.show}
        message={showConfirm.message}
        onConfirm={showConfirm.onConfirm}
        onCancel={() => setShowConfirm({ show: false, message: '', onConfirm: null })}
      />

      {/* Click outside handler for user menu */}
      {showUserMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

// Main App with Authentication Provider
const App = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AuthenticatedCRM />
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default App;