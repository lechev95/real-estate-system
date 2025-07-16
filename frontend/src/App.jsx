import React, { useState, useEffect } from 'react';
// В началото на App.jsx добавете:
import { propertiesAPI, buyersAPI } from './services/api';

// // Премахнете embedded API код

// // API Configuration
// const API_BASE_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';

// API Service Functions
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

const propertiesAPI = {
  getAll: async () => apiCall('/properties'),
  create: async (data) => apiCall('/properties', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id, data) => apiCall(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id) => apiCall(`/properties/${id}`, { method: 'DELETE' }),
};

const buyersAPI = {
  getAll: async () => apiCall('/buyers'),
  create: async (data) => apiCall('/buyers', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id, data) => apiCall(`/buyers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id) => apiCall(`/buyers/${id}`, { method: 'DELETE' }),
};

// Exchange rate
const EUR_TO_BGN_RATE = 1.95583;

// Inline Styles for reliable rendering
const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #e5e7eb'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  currencySelect: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    fontSize: '0.875rem'
  },
  nav: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    gap: '2rem'
  },
  navButton: {
    padding: '1rem 0',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
  },
  navButtonActive: {
    borderBottomColor: '#3b82f6',
    color: '#3b82f6'
  },
  navButtonInactive: {
    color: '#6b7280'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  addButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  filterButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardImage: {
    height: '200px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardImageIcon: {
    fontSize: '4rem',
    color: 'white',
    opacity: 0.7
  },
  statusBadge: {
    position: 'absolute',
    bottom: '1rem',
    left: '1rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white'
  },
  cardContent: {
    padding: '1.5rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  cardAddress: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  priceContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#059669'
  },
  priceSecondary: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6'
  },
  actionButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  editButton: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem 0.75rem 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    width: '2.5rem',
    height: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: '2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    resize: 'vertical',
    minHeight: '100px'
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    backgroundColor: 'white'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #f3f4f6'
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#6b7280'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#374151'
  },
  loadingOverlay: {
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
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  spinner: {
    width: '2rem',
    height: '2rem',
    border: '2px solid #f3f4f6',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.875rem',
    fontWeight: '500'
  }
};

// Property Modal Component
const PropertyModal = ({ show, onClose, onSave, property = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'sale',
    category: 'apartment',
    address: '',
    city: 'София',
    district: '',
    area: '',
    rooms: '',
    floor: '',
    totalFloors: '',
    yearBuilt: '',
    exposure: '',
    heating: '',
    priceEur: '',
    monthlyRentEur: '',
    description: ''
  });

  useEffect(() => {
    if (property && isEdit) {
      setFormData({
        title: property.title || '',
        propertyType: property.propertyType || 'sale',
        category: property.category || 'apartment',
        address: property.address || '',
        city: property.city || 'София',
        district: property.district || '',
        area: property.area?.toString() || '',
        rooms: property.rooms?.toString() || '',
        floor: property.floor?.toString() || '',
        totalFloors: property.totalFloors?.toString() || '',
        yearBuilt: property.yearBuilt?.toString() || '',
        exposure: property.exposure || '',
        heating: property.heating || '',
        priceEur: property.priceEur || '',
        monthlyRentEur: property.monthlyRentEur || '',
        description: property.description || ''
      });
    } else {
      setFormData({
        title: '',
        propertyType: 'sale',
        category: 'apartment',
        address: '',
        city: 'София',
        district: '',
        area: '',
        rooms: '',
        floor: '',
        totalFloors: '',
        yearBuilt: '',
        exposure: '',
        heating: '',
        priceEur: '',
        monthlyRentEur: '',
        description: ''
      });
    }
  }, [property, isEdit, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.address || !formData.area || !formData.rooms) {
      alert('Моля попълнете всички задължителни полета!');
      return;
    }

    if (formData.propertyType === 'sale' && !formData.priceEur) {
      alert('Моля въведете цена за продажба!');
      return;
    }

    if ((formData.propertyType === 'rent' || formData.propertyType === 'managed') && !formData.monthlyRentEur) {
      alert('Моля въведете месечна наема!');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        area: parseInt(formData.area),
        rooms: parseInt(formData.rooms),
        floor: formData.floor ? parseInt(formData.floor) : null,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
      };

      await onSave(dataToSend);
      onClose();
    } catch (error) {
      alert('Грешка при запазване: ' + error.message);
    }
  };

  if (!show) return null;

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>
              {isEdit ? '✏️ Редактирай имот' : '🏠 Добави нов имот'}
            </h2>
            <button onClick={onClose} style={styles.closeButton}>
              ×
            </button>
          </div>

          <div style={styles.modalBody}>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                  <label style={styles.label}>Заглавие *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    style={styles.input}
                    placeholder="напр. Тристаен апартамент в Лозенец"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Тип имот *</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                    style={styles.select}
                  >
                    <option value="sale">Продажба</option>
                    <option value="rent">Наем</option>
                    <option value="managed">Управляван</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Категория *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={styles.select}
                  >
                    <option value="apartment">Апартамент</option>
                    <option value="house">Къща</option>
                    <option value="office">Офис</option>
                    <option value="commercial">Търговски</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Град *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Район</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    style={styles.input}
                    placeholder="напр. Лозенец, Център"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Квадратура (кв.м) *</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    style={styles.input}
                    required
                    min="1"
                    placeholder="100"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Брой стаи *</label>
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => setFormData({...formData, rooms: e.target.value})}
                    style={styles.input}
                    required
                    min="1"
                    placeholder="3"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Етаж</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    style={styles.input}
                    placeholder="4"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Общо етажи</label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({...formData, totalFloors: e.target.value})}
                    style={styles.input}
                    placeholder="6"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Година на строеж</label>
                  <input
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                    style={styles.input}
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="2010"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Изложение</label>
                  <select
                    value={formData.exposure}
                    onChange={(e) => setFormData({...formData, exposure: e.target.value})}
                    style={styles.select}
                  >
                    <option value="">Изберете</option>
                    <option value="Север">Север</option>
                    <option value="Юг">Юг</option>
                    <option value="Изток">Изток</option>
                    <option value="Запад">Запад</option>
                    <option value="Югоизток">Югоизток</option>
                    <option value="Югозапад">Югозапад</option>
                    <option value="Североизток">Североизток</option>
                    <option value="Северозапад">Северозапад</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Отопление</label>
                  <select
                    value={formData.heating}
                    onChange={(e) => setFormData({...formData, heating: e.target.value})}
                    style={styles.select}
                  >
                    <option value="">Изберете</option>
                    <option value="Централно парно">Централно парно</option>
                    <option value="Газово">Газово</option>
                    <option value="Електрическо">Електрическо</option>
                    <option value="Климатици">Климатици</option>
                    <option value="Печка">Печка</option>
                    <option value="Няма">Няма</option>
                  </select>
                </div>

                {formData.propertyType === 'sale' && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Цена (EUR) *</label>
                    <input
                      type="number"
                      value={formData.priceEur}
                      onChange={(e) => setFormData({...formData, priceEur: e.target.value})}
                      style={styles.input}
                      required={formData.propertyType === 'sale'}
                      min="0"
                      placeholder="165000"
                    />
                  </div>
                )}

                {(formData.propertyType === 'rent' || formData.propertyType === 'managed') && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Месечен наем (EUR) *</label>
                    <input
                      type="number"
                      value={formData.monthlyRentEur}
                      onChange={(e) => setFormData({...formData, monthlyRentEur: e.target.value})}
                      style={styles.input}
                      required={formData.propertyType !== 'sale'}
                      min="0"
                      placeholder="600"
                    />
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Адрес *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={styles.input}
                  required
                  placeholder="ул. Фритьоф Нансен 25"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={styles.textarea}
                  placeholder="Светъл тристаен апартамент с две тераси и паркомясто..."
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={onClose} style={styles.cancelButton}>
                  Отказ
                </button>
                <button type="submit" style={styles.submitButton}>
                  {isEdit ? 'Обнови' : 'Създай'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// Buyer Modal Component
const BuyerModal = ({ show, onClose, onSave, buyer = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    budgetMin: '',
    budgetMax: '',
    preferredPropertyType: 'any',
    preferredAreas: '',
    preferredRooms: '',
    notes: '',
    status: 'potential'
  });

  useEffect(() => {
    if (buyer && isEdit) {
      setFormData({
        firstName: buyer.firstName || '',
        lastName: buyer.lastName || '',
        phone: buyer.phone || '',
        email: buyer.email || '',
        budgetMin: buyer.budgetMin || '',
        budgetMax: buyer.budgetMax || '',
        preferredPropertyType: buyer.preferredPropertyType || 'any',
        preferredAreas: Array.isArray(buyer.preferredAreas) ? buyer.preferredAreas.join(', ') : '',
        preferredRooms: buyer.preferredRooms?.toString() || '',
        notes: buyer.notes || '',
        status: buyer.status || 'potential'
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        budgetMin: '',
        budgetMax: '',
        preferredPropertyType: 'any',
        preferredAreas: '',
        preferredRooms: '',
        notes: '',
        status: 'potential'
      });
    }
  }, [buyer, isEdit, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      alert('Моля попълнете всички задължителни полета!');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        preferredAreas: formData.preferredAreas ? formData.preferredAreas.split(',').map(area => area.trim()) : [],
        preferredRooms: formData.preferredRooms ? parseInt(formData.preferredRooms) : null,
      };

      await onSave(dataToSend);
      onClose();
    } catch (error) {
      alert('Грешка при запазване: ' + error.message);
    }
  };

  if (!show) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={{...styles.modalHeader, background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'}}>
          <h2 style={styles.modalTitle}>
            {isEdit ? '✏️ Редактирай купувач' : '👤 Добави нов купувач'}
          </h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <div style={styles.modalBody}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Име *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  style={styles.input}
                  placeholder="Мария"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Фамилия *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  style={styles.input}
                  placeholder="Стоянова"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Телефон *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.input}
                  placeholder="+359 889 444 555"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  placeholder="maria@gmail.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Минимален бюджет (EUR)</label>
                <input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({...formData, budgetMin: e.target.value})}
                  style={styles.input}
                  min="0"
                  placeholder="100000"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Максимален бюджет (EUR)</label>
                <input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({...formData, budgetMax: e.target.value})}
                  style={styles.input}
                  min="0"
                  placeholder="200000"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Предпочитан тип имот</label>
                <select
                  value={formData.preferredPropertyType}
                  onChange={(e) => setFormData({...formData, preferredPropertyType: e.target.value})}
                  style={styles.select}
                >
                  <option value="any">Всички</option>
                  <option value="sale">Продажба</option>
                  <option value="rent">Наем</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Предпочитан брой стаи</label>
                <input
                  type="number"
                  value={formData.preferredRooms}
                  onChange={(e) => setFormData({...formData, preferredRooms: e.target.value})}
                  style={styles.input}
                  min="1"
                  placeholder="3"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={styles.select}
                >
                  <option value="potential">Потенциален</option>
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                  <option value="converted">Клиент</option>
                </select>
              </div>

              <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                <label style={styles.label}>Предпочитани райони (разделени със запетая)</label>
                <input
                  type="text"
                  value={formData.preferredAreas}
                  onChange={(e) => setFormData({...formData, preferredAreas: e.target.value})}
                  style={styles.input}
                  placeholder="Лозенец, Център, Витоша"
                />
              </div>

              <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                <label style={styles.label}>Бележки</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={styles.textarea}
                  placeholder="Допълнителна информация за купувача..."
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button type="button" onClick={onClose} style={styles.cancelButton}>
                Отказ
              </button>
              <button type="submit" style={styles.submitButton}>
                {isEdit ? 'Обнови' : 'Създай'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('properties');
  const [currency, setCurrency] = useState('EUR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [propertyFilter, setPropertyFilter] = useState('all');

  // Data state
  const [properties, setProperties] = useState([]);
  const [buyers, setBuyers] = useState([]);

  // Modal states
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingBuyer, setEditingBuyer] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadProperties();
    loadBuyers();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await propertiesAPI.getAll();
      setProperties(response.properties || response);
    } catch (error) {
      setError('Failed to load properties');
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBuyers = async () => {
    try {
      const response = await buyersAPI.getAll();
      setBuyers(response.buyers || response);
    } catch (error) {
      console.error('Error loading buyers:', error);
    }
  };

  // Property CRUD operations
  const handleAddProperty = async (propertyData) => {
    try {
      setLoading(true);
      const newProperty = await propertiesAPI.create(propertyData);
      setProperties(prev => [...prev, newProperty]);
      setShowPropertyModal(false);
      setEditingProperty(null);
    } catch (error) {
      setError('Failed to add property');
      console.error('Error adding property:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditProperty = async (propertyData) => {
    try {
      setLoading(true);
      const updatedProperty = await propertiesAPI.update(editingProperty.id, propertyData);
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? updatedProperty : p));
      setShowPropertyModal(false);
      setEditingProperty(null);
    } catch (error) {
      setError('Failed to update property');
      console.error('Error updating property:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този имот?')) {
      try {
        setLoading(true);
        await propertiesAPI.delete(id);
        setProperties(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        setError('Failed to delete property');
        console.error('Error deleting property:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Buyer CRUD operations
  const handleAddBuyer = async (buyerData) => {
    try {
      setLoading(true);
      const newBuyer = await buyersAPI.create(buyerData);
      setBuyers(prev => [...prev, newBuyer]);
      setShowBuyerModal(false);
      setEditingBuyer(null);
    } catch (error) {
      setError('Failed to add buyer');
      console.error('Error adding buyer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditBuyer = async (buyerData) => {
    try {
      setLoading(true);
      const updatedBuyer = await buyersAPI.update(editingBuyer.id, buyerData);
      setBuyers(prev => prev.map(b => b.id === editingBuyer.id ? updatedBuyer : b));
      setShowBuyerModal(false);
      setEditingBuyer(null);
    } catch (error) {
      setError('Failed to update buyer');
      console.error('Error updating buyer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBuyer = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този купувач?')) {
      try {
        setLoading(true);
        await buyersAPI.delete(id);
        setBuyers(prev => prev.filter(b => b.id !== id));
      } catch (error) {
        setError('Failed to delete buyer');
        console.error('Error deleting buyer:', error);
      } finally {
        setLoading(false);
      }
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

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {...styles.statusBadge};
    switch(status) {
      case 'available':
        return {...baseStyle, backgroundColor: '#10b981'};
      case 'rented':
        return {...baseStyle, backgroundColor: '#f59e0b'};
      case 'managed':
        return {...baseStyle, backgroundColor: '#3b82f6'};
      default:
        return {...baseStyle, backgroundColor: '#6b7280'};
    }
  };

  const getBuyerStatusBadge = (status) => {
    const colors = {
      active: '#10b981',
      potential: '#f59e0b',
      converted: '#3b82f6',
      inactive: '#6b7280'
    };
    
    const labels = {
      active: 'Активен',
      potential: 'Потенциален', 
      converted: 'Клиент',
      inactive: 'Неактивен'
    };

    return {
      backgroundColor: colors[status] || colors.inactive,
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-block'
    };
  };

  const openEditPropertyModal = (property) => {
    setEditingProperty(property);
    setShowPropertyModal(true);
  };

  const openEditBuyerModal = (buyer) => {
    setEditingBuyer(buyer);
    setShowBuyerModal(true);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span>🏠</span>
            <span>Real Estate CRM</span>
          </div>

          <div style={styles.userInfo}>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={styles.currencySelect}
            >
              <option value="EUR">EUR (1.00)</option>
              <option value="BGN">BGN ({EUR_TO_BGN_RATE})</option>
            </select>

            <div style={{fontSize: '0.875rem', color: '#374151'}}>
              <div style={{fontWeight: '600'}}>Мария Иванова</div>
              <div style={{color: '#6b7280'}}>Агент</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          {[
            { id: 'properties', label: '🏠 Имоти' },
            { id: 'buyers', label: '👥 Купувачи' },
            { id: 'sellers', label: '🏪 Продавачи' },
            { id: 'tasks', label: '📅 Задачи' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentPage(tab.id)}
              style={{
                ...styles.navButton,
                ...(currentPage === tab.id ? styles.navButtonActive : styles.navButtonInactive)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Error Message */}
      {error && (
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '1rem'}}>
          <div style={styles.errorAlert}>
            <div style={styles.errorText}>{error}</div>
            <button 
              onClick={() => setError(null)}
              style={{background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer'}}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner}></div>
            <span>Зареждане...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={styles.main}>
        {/* Properties Section */}
        {currentPage === 'properties' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>🏠 Имоти</h2>
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setShowPropertyModal(true);
                }}
                style={{
                  ...styles.addButton,
                  ':hover': {backgroundColor: '#2563eb'}
                }}
              >
                + Добави имот
              </button>
            </div>

            {/* Filter Buttons */}
            <div style={styles.filterButtons}>
              {[
                { key: 'all', label: `Всички (${properties.length})` },
                { key: 'sale', label: `Продажба (${properties.filter(p => p.propertyType === 'sale').length})` },
                { key: 'rent', label: `Наем (${properties.filter(p => p.propertyType === 'rent').length})` },
                { key: 'managed', label: `Управлявани (${properties.filter(p => p.propertyType === 'managed').length})` }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setPropertyFilter(filter.key)}
                  style={{
                    ...styles.filterButton,
                    ...(propertyFilter === filter.key ? styles.filterButtonActive : {})
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Properties Grid */}
            <div style={styles.grid}>
              {getFilteredProperties().map((property) => (
                <div 
                  key={property.id} 
                  style={{
                    ...styles.card,
                    ':hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <div style={styles.cardImage}>
                    <div style={styles.cardImageIcon}>🏠</div>
                    <div style={getStatusBadgeStyle(property.status)}>
                      {property.status === 'available' ? 'Свободен' :
                       property.status === 'rented' ? 'Отдаден' :
                       'Управляван'}
                    </div>
                  </div>

                  <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>{property.title}</h3>
                    <div style={styles.cardAddress}>📍 {property.address}</div>
                    
                    <div style={styles.priceContainer}>
                      <div>
                        <div style={styles.price}>
                          {property.propertyType === 'sale' ? 
                            formatPrice(property.priceEur) :
                            `${formatPrice(property.monthlyRentEur)}/месец`
                          }
                        </div>
                        {property.propertyType === 'sale' && currency === 'EUR' && property.priceEur && (
                          <div style={styles.priceSecondary}>
                            ≈ {Math.round(parseFloat(property.priceEur) * EUR_TO_BGN_RATE).toLocaleString()} лв.
                          </div>
                        )}
                      </div>
                      <div style={styles.details}>
                        <div>📐 {property.area} кв.м</div>
                        <div>🚪 {property.rooms} стаи</div>
                      </div>
                    </div>

                    {property.tenants && property.tenants.length > 0 && (
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: '#eff6ff',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        color: '#1e40af'
                      }}>
                        👤 Наемател: {property.tenants[0].firstName} {property.tenants[0].lastName}
                      </div>
                    )}

                    <div style={styles.cardActions}>
                      <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        👁️ {property.viewings || 0} прегледа
                      </div>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          onClick={() => openEditPropertyModal(property)}
                          style={{...styles.actionButton, ...styles.editButton}}
                        >
                          ✏️ Редактирай
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          style={{...styles.actionButton, ...styles.deleteButton}}
                        >
                          🗑️ Изтрий
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {getFilteredProperties().length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🏠</div>
                <div style={styles.emptyTitle}>Няма имоти за показване</div>
                <div>Добавете първия си имот, за да започнете</div>
              </div>
            )}
          </div>
        )}

        {/* Buyers Section */}
        {currentPage === 'buyers' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>👥 Купувачи</h2>
              <button
                onClick={() => {
                  setEditingBuyer(null);
                  setShowBuyerModal(true);
                }}
                style={{...styles.addButton, backgroundColor: '#10b981'}}
              >
                + Добави купувач
              </button>
            </div>
            
            <div style={styles.grid}>
              {buyers.map((buyer) => (
                <div key={buyer.id} style={styles.card}>
                  <div style={styles.cardContent}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {buyer.firstName[0]}{buyer.lastName[0]}
                      </div>
                      <div>
                        <h3 style={styles.cardTitle}>{buyer.firstName} {buyer.lastName}</h3>
                        <span style={getBuyerStatusBadge(buyer.status)}>
                          {buyer.status === 'active' ? 'Активен' :
                           buyer.status === 'potential' ? 'Потенциален' :
                           buyer.status === 'converted' ? 'Клиент' :
                           'Неактивен'}
                        </span>
                      </div>
                    </div>

                    <div style={{marginBottom: '1rem'}}>
                      <div style={{marginBottom: '0.5rem'}}>📞 {buyer.phone}</div>
                      {buyer.email && <div style={{marginBottom: '0.5rem'}}>✉️ {buyer.email}</div>}
                      {(buyer.budgetMin || buyer.budgetMax) && (
                        <div>💰 Бюджет: {buyer.budgetMin ? formatPrice(buyer.budgetMin) : '0'} - {buyer.budgetMax ? formatPrice(buyer.budgetMax) : '∞'}</div>
                      )}
                    </div>
                    
                    <div style={styles.cardActions}>
                      <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        Контакт: {buyer.lastContact ? new Date(buyer.lastContact).toLocaleDateString('bg-BG') : 'Няма'}
                      </div>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          onClick={() => openEditBuyerModal(buyer)}
                          style={{...styles.actionButton, backgroundColor: '#10b981', color: 'white'}}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteBuyer(buyer.id)}
                          style={{...styles.actionButton, ...styles.deleteButton}}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {buyers.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>👥</div>
                <div style={styles.emptyTitle}>Няма купувачи за показване</div>
                <div>Добавете първия си купувач, за да започнете</div>
              </div>
            )}
          </div>
        )}

        {/* Other sections placeholders */}
        {currentPage === 'sellers' && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏪</div>
            <div style={styles.emptyTitle}>Продавачи</div>
            <div>Тази секция ще бъде добавена скоро...</div>
          </div>
        )}

        {currentPage === 'tasks' && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📅</div>
            <div style={styles.emptyTitle}>Задачи</div>
            <div>Тази секция ще бъде добавена скоро...</div>
          </div>
        )}
      </main>

      {/* Modals */}
      <PropertyModal
        show={showPropertyModal}
        onClose={() => {
          setShowPropertyModal(false);
          setEditingProperty(null);
        }}
        onSave={editingProperty ? handleEditProperty : handleAddProperty}
        property={editingProperty}
        isEdit={!!editingProperty}
      />

      <BuyerModal
        show={showBuyerModal}
        onClose={() => {
          setShowBuyerModal(false);
          setEditingBuyer(null);
        }}
        onSave={editingBuyer ? handleEditBuyer : handleAddBuyer}
        buyer={editingBuyer}
        isEdit={!!editingBuyer}
      />
    </div>
  );
};

export default App;