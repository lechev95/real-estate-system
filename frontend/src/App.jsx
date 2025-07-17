import React, { useState, useEffect } from 'react';
import { propertiesAPI, buyersAPI, sellersAPI, tasksAPI } from './services/api';

// Exchange rate
const EUR_TO_BGN_RATE = 1.95583;

// Global styles (including keyframes)
const globalStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

// Enhanced Inline Styles for professional UI
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
    fontSize: '0.875rem',
    cursor: 'pointer'
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
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
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
    gap: '1.5rem',
    animation: 'fadeIn 0.6s ease-out'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'visible',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative'
  },
  cardImage: {
    height: '200px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '0.75rem 0.75rem 0 0'
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
  archivedBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#6b7280',
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
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  editButton: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white'
  },
  archiveButton: {
    backgroundColor: '#6b7280',
    color: 'white'
  },
  menuButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db'
  },
  actionMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    zIndex: 9999,
    minWidth: '180px',
    maxHeight: '300px',
    overflowY: 'auto',
    marginTop: '0.25rem'
  },
  menuItem: {
    display: 'block',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
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
    overflow: 'auto',
    animation: 'slideIn 0.3s ease-out'
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
    justifyContent: 'center',
    transition: 'background-color 0.2s'
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
    backgroundColor: 'white',
    cursor: 'pointer'
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
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
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
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  successText: {
    color: '#15803d',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  relationshipInfo: {
    padding: '0.75rem',
    backgroundColor: '#eff6ff',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    color: '#1e40af'
  },
  buyerAvatar: {
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.5rem'
  }
};

// Enhanced Property Modal Component with validation
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

  const [validationErrors, setValidationErrors] = useState([]);

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
    } else if (show) {
      // Reset form when opening new property modal
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
    setValidationErrors([]);
  }, [property, isEdit, show]);

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title?.trim()) errors.push('Заглавието е задължително');
    if (!formData.address?.trim()) errors.push('Адресът е задължителен');
    if (!formData.area || parseInt(formData.area) <= 0) errors.push('Квадратурата трябва да бъде положително число');
    if (!formData.rooms || parseInt(formData.rooms) <= 0) errors.push('Броя стаи трябва да бъде положително число');
    
    if (formData.propertyType === 'sale' && (!formData.priceEur || parseFloat(formData.priceEur) <= 0)) {
      errors.push('Цената за продажба е задължителна');
    }
    
    if ((formData.propertyType === 'rent' || formData.propertyType === 'managed') && 
        (!formData.monthlyRentEur || parseFloat(formData.monthlyRentEur) <= 0)) {
      errors.push('Месечният наем е задължителен');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        title: formData.title.trim(),
        address: formData.address.trim(),
        area: parseInt(formData.area) || 0,
        rooms: parseInt(formData.rooms) || 0,
        floor: formData.floor ? parseInt(formData.floor) : null,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        priceEur: formData.priceEur ? parseFloat(formData.priceEur) : null,
        monthlyRentEur: formData.monthlyRentEur ? parseFloat(formData.monthlyRentEur) : null
      };

      await onSave(dataToSend);
    } catch (error) {
      setValidationErrors(['Грешка при запазване: ' + (error.message || 'Неочаквана грешка')]);
    }
  };

  if (!show) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {isEdit ? '✏️ Редактирай имот' : '🏠 Добави нов имот'}
          </h2>
          <button 
            onClick={onClose} 
            style={styles.closeButton}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <div style={styles.modalBody}>
          {validationErrors.length > 0 && (
            <div style={styles.errorAlert}>
              <div>
                {validationErrors.map((error, index) => (
                  <div key={index} style={styles.errorText}>• {error}</div>
                ))}
              </div>
              <button 
                onClick={() => setValidationErrors([])}
                style={{background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#dc2626'}}
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                <label style={styles.label}>📝 Заглавие *</label>
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
                <label style={styles.label}>🏠 Тип имот *</label>
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
                <label style={styles.label}>🏢 Категория *</label>
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
                <label style={styles.label}>🌍 Град *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📍 Район</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  style={styles.input}
                  placeholder="напр. Лозенец, Център"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📐 Квадратура (кв.м) *</label>
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
                <label style={styles.label}>🚪 Брой стаи *</label>
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
                <label style={styles.label}>🏗️ Етаж</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  style={styles.input}
                  placeholder="4"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>🏢 Общо етажи</label>
                <input
                  type="number"
                  value={formData.totalFloors}
                  onChange={(e) => setFormData({...formData, totalFloors: e.target.value})}
                  style={styles.input}
                  placeholder="6"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📅 Година на строеж</label>
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
                <label style={styles.label}>☀️ Изложение</label>
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
                <label style={styles.label}>🔥 Отопление</label>
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
                  <label style={styles.label}>💰 Цена (EUR) *</label>
                  <input
                    type="number"
                    value={formData.priceEur}
                    onChange={(e) => setFormData({...formData, priceEur: e.target.value})}
                    style={styles.input}
                    required={formData.propertyType === 'sale'}
                    min="0"
                    step="0.01"
                    placeholder="165000"
                  />
                </div>
              )}

              {(formData.propertyType === 'rent' || formData.propertyType === 'managed') && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>💵 Месечен наем (EUR) *</label>
                  <input
                    type="number"
                    value={formData.monthlyRentEur}
                    onChange={(e) => setFormData({...formData, monthlyRentEur: e.target.value})}
                    style={styles.input}
                    required={formData.propertyType !== 'sale'}
                    min="0"
                    step="0.01"
                    placeholder="600"
                  />
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>📍 Адрес *</label>
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
              <label style={styles.label}>📝 Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={styles.textarea}
                placeholder="Светъл тристаен апартамент с две тераси и паркомясто..."
              />
            </div>

            <div style={styles.modalActions}>
              <button 
                type="button" 
                onClick={onClose} 
                style={styles.cancelButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                Отказ
              </button>
              <button 
                type="submit" 
                style={styles.submitButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                {isEdit ? 'Обнови' : 'Създай'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Enhanced Seller Modal Component
const SellerModal = ({ show, onClose, onSave, seller = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    bankAccount: '',
    commission: '',
    notes: '',
    status: 'active'
  });

  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (seller && isEdit) {
      setFormData({
        firstName: seller.firstName || '',
        lastName: seller.lastName || '',
        phone: seller.phone || '',
        email: seller.email || '',
        address: seller.address || '',
        nationalId: seller.nationalId || '',
        bankAccount: seller.bankAccount || '',
        commission: seller.commission?.toString() || '',
        notes: seller.notes || '',
        status: seller.status || 'active'
      });
    } else if (show) {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        nationalId: '',
        bankAccount: '',
        commission: '',
        notes: '',
        status: 'active'
      });
    }
    setValidationErrors([]);
  }, [seller, isEdit, show]);

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName?.trim()) errors.push('Името е задължително');
    if (!formData.lastName?.trim()) errors.push('Фамилията е задължителна');
    if (!formData.phone?.trim()) errors.push('Телефонът е задължителен');
    
    if (formData.email && !formData.email.includes('@')) {
      errors.push('Моля въведете валиден имейл адрес');
    }
    
    if (formData.commission && (parseFloat(formData.commission) < 0 || parseFloat(formData.commission) > 100)) {
      errors.push('Комисионата трябва да бъде между 0 и 100%');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || '',
        nationalId: formData.nationalId?.trim() || '',
        bankAccount: formData.bankAccount?.trim() || '',
        commission: formData.commission ? parseFloat(formData.commission) : 0,
        notes: formData.notes?.trim() || ''
      };

      await onSave(dataToSend);
    } catch (error) {
      setValidationErrors(['Грешка при запазване: ' + (error.message || 'Неочаквана грешка')]);
    }
  };

  if (!show) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={{...styles.modalHeader, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
          <h2 style={styles.modalTitle}>
            {isEdit ? '✏️ Редактирай продавач' : '🏪 Добави нов продавач'}
          </h2>
          <button 
            onClick={onClose} 
            style={styles.closeButton}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <div style={styles.modalBody}>
          {validationErrors.length > 0 && (
            <div style={styles.errorAlert}>
              <div>
                {validationErrors.map((error, index) => (
                  <div key={index} style={styles.errorText}>• {error}</div>
                ))}
              </div>
              <button 
                onClick={() => setValidationErrors([])}
                style={{background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#dc2626'}}
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>👤 Име *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  style={styles.input}
                  placeholder="Иван"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>👤 Фамилия *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  style={styles.input}
                  placeholder="Петров"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📞 Телефон *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.input}
                  placeholder="+359 888 123 456"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>✉️ Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  placeholder="ivan@email.bg"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>💰 Комисионна (%)</label>
                <input
                  type="number"
                  value={formData.commission}
                  onChange={(e) => setFormData({...formData, commission: e.target.value})}
                  style={styles.input}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="2.5"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📊 Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={styles.select}
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                  <option value="pending">В процес</option>
                </select>
              </div>

              <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                <label style={styles.label}>📍 Адрес</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={styles.input}
                  placeholder="ул. Раковски 15, София"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>🆔 ЕГН</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                  style={styles.input}
                  placeholder="8012031234"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>🏦 Банкова сметка</label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                  style={styles.input}
                  placeholder="BG80BNBG96611020345678"
                />
              </div>

              <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                <label style={styles.label}>📝 Бележки</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={styles.textarea}
                  placeholder="Допълнителна информация за продавача..."
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button 
                type="button" 
                onClick={onClose} 
                style={styles.cancelButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                Отказ
              </button>
              <button 
                type="submit" 
                style={{...styles.submitButton, backgroundColor: '#f59e0b'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
              >
                {isEdit ? 'Обнови' : 'Създай'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Task Modal Component
const TaskModal = ({ show, onClose, onSave, task = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    propertyId: '',
    buyerId: '',
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (task && isEdit) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        propertyId: task.propertyId?.toString() || '',
        buyerId: task.buyerId?.toString() || '',
        notes: task.notes || ''
      });
    } else if (show) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        propertyId: '',
        buyerId: '',
        notes: ''
      });
    }
    setValidationErrors([]);
  }, [task, isEdit, show]);

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title?.trim()) errors.push('Заглавието е задължително');
    if (!formData.dueDate) errors.push('Крайният срок е задължителен');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        dueDate: new Date(formData.dueDate),
        propertyId: formData.propertyId ? parseInt(formData.propertyId) : null,
        buyerId: formData.buyerId ? parseInt(formData.buyerId) : null,
        notes: formData.notes?.trim() || ''
      };

      await onSave(dataToSend);
    } catch (error) {
      setValidationErrors(['Грешка при запазване: ' + (error.message || 'Неочаквана грешка')]);
    }
  };

  if (!show) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={{...styles.modalHeader, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
          <h2 style={styles.modalTitle}>
            {isEdit ? '✏️ Редактирай задача' : '📅 Добави нова задача'}
          </h2>
          <button 
            onClick={onClose} 
            style={styles.closeButton}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <div style={styles.modalBody}>
          {validationErrors.length > 0 && (
            <div style={styles.errorAlert}>
              <div>
                {validationErrors.map((error, index) => (
                  <div key={index} style={styles.errorText}>• {error}</div>
                ))}
              </div>
              <button 
                onClick={() => setValidationErrors([])}
                style={{background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#dc2626'}}
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                <label style={styles.label}>📝 Заглавие *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={styles.input}
                  placeholder="напр. Покажи апартамент на ул. Раковски"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>⚡ Приоритет</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  style={styles.select}
                >
                  <option value="low">Нисък</option>
                  <option value="medium">Среден</option>
                  <option value="high">Висок</option>
                  <option value="urgent">Спешен</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📊 Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={styles.select}
                >
                  <option value="pending">В очакване</option>
                  <option value="in-progress">В процес</option>
                  <option value="completed">Завършена</option>
                  <option value="cancelled">Отменена</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>📅 Краен срок *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>🏠 Свързан имот (по избор)</label>
                <input
                  type="number"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                  style={styles.input}
                  placeholder="ID на имот"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>👤 Свързан купувач (по избор)</label>
                <input
                  type="number"
                  value={formData.buyerId}
                  onChange={(e) => setFormData({...formData, buyerId: e.target.value})}
                  style={styles.input}
                  placeholder="ID на купувач"
                />
              </div>

              <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                <label style={styles.label}>📝 Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={styles.textarea}
                  placeholder="Подробно описание на задачата..."
                />
              </div>

              <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                <label style={styles.label}>📝 Бележки</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={styles.textarea}
                  placeholder="Допълнителни бележки..."
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button 
                type="button" 
                onClick={onClose} 
                style={styles.cancelButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                Отказ
              </button>
              <button 
                type="submit" 
                style={{...styles.submitButton, backgroundColor: '#8b5cf6'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
              >
                {isEdit ? 'Обнови' : 'Създай'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Enhanced Buyer Modal Component
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

  const [validationErrors, setValidationErrors] = useState([]);

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
        preferredAreas: Array.isArray(buyer.preferredAreas) ? buyer.preferredAreas.join(', ') : (buyer.preferredAreas || ''),
        preferredRooms: buyer.preferredRooms?.toString() || '',
        notes: buyer.notes || '',
        status: buyer.status || 'potential'
      });
    } else if (show) {
      // Reset form when opening new buyer modal
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
    setValidationErrors([]);
  }, [buyer, isEdit, show]);

  const validateForm = () => {
    const errors = [];
    
    if (!formData.firstName?.trim()) errors.push('Името е задължително');
    if (!formData.lastName?.trim()) errors.push('Фамилията е задължителна');
    if (!formData.phone?.trim()) errors.push('Телефонът е задължителен');
    
    if (formData.email && !formData.email.includes('@')) {
      errors.push('Моля въведете валиден имейл адрес');
    }
    
    if (formData.budgetMin && formData.budgetMax && 
        parseFloat(formData.budgetMin) > parseFloat(formData.budgetMax)) {
      errors.push('Минималният бюджет не може да бъде по-голям от максималния');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || null,
        preferredAreas: formData.preferredAreas ? 
          formData.preferredAreas.split(',').map(area => area.trim()).filter(area => area) : [],
        preferredRooms: formData.preferredRooms ? parseInt(formData.preferredRooms) : null,
        budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null
      };

      await onSave(dataToSend);
    } catch (error) {
      setValidationErrors(['Грешка при запазване: ' + (error.message || 'Неочаквана грешка')]);
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
          <button 
            onClick={onClose} 
            style={styles.closeButton}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <div style={styles.modalBody}>
          {validationErrors.length > 0 && (
            <div style={styles.errorAlert}>
              <div>
                {validationErrors.map((error, index) => (
                  <div key={index} style={styles.errorText}>• {error}</div>
                ))}
              </div>
              <button 
                onClick={() => setValidationErrors([])}
                style={{background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#dc2626'}}
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>👤 Име *</label>
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
                <label style={styles.label}>👤 Фамилия *</label>
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
                <label style={styles.label}>📞 Телефон *</label>
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
                <label style={styles.label}>✉️ Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  placeholder="maria@gmail.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>💰 Минимален бюджет (EUR)</label>
                <input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({...formData, budgetMin: e.target.value})}
                  style={styles.input}
                  min="0"
                  step="0.01"
                  placeholder="100000"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>💰 Максимален бюджет (EUR)</label>
                <input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({...formData, budgetMax: e.target.value})}
                  style={styles.input}
                  min="0"
                  step="0.01"
                  placeholder="200000"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>🏠 Предпочитан тип имот</label>
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
                <label style={styles.label}>🚪 Предпочитан брой стаи</label>
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
                <label style={styles.label}>📊 Статус</label>
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
                <label style={styles.label}>📍 Предпочитани райони (разделени със запетая)</label>
                <input
                  type="text"
                  value={formData.preferredAreas}
                  onChange={(e) => setFormData({...formData, preferredAreas: e.target.value})}
                  style={styles.input}
                  placeholder="Лозенец, Център, Витоша"
                />
              </div>

              <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                <label style={styles.label}>📝 Бележки</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={styles.textarea}
                  placeholder="Допълнителна информация за купувача..."
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button 
                type="button" 
                onClick={onClose} 
                style={styles.cancelButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                Отказ
              </button>
              <button 
                type="submit" 
                style={{...styles.submitButton, backgroundColor: '#10b981'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                {isEdit ? 'Обнови' : 'Създай'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Enhanced Property Card with Action Menu
const PropertyCard = ({ 
  property, 
  currency, 
  onEdit, 
  onDelete, 
  onArchive, 
  onAssignSeller, 
  onAssignBuyer, 
  onIncrementViewing,
  formatPrice 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.action-menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {...styles.statusBadge};
    switch(status?.toLowerCase()) {
      case 'available':
        return {...baseStyle, backgroundColor: '#10b981'};
      case 'rented':
        return {...baseStyle, backgroundColor: '#f59e0b'};
      case 'managed':
        return {...baseStyle, backgroundColor: '#3b82f6'};
      case 'sold':
        return {...baseStyle, backgroundColor: '#6b7280'};
      default:
        return {...baseStyle, backgroundColor: '#6b7280'};
    }
  };

  return (
    <div 
      style={styles.card}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      <div style={styles.cardImage}>
        <div style={styles.cardImageIcon}>🏠</div>
        <div style={getStatusBadgeStyle(property.status)}>
          {property.status === 'available' ? '✅ Свободен' :
           property.status === 'rented' ? '🔶 Отдаден' :
           property.status === 'managed' ? '🔷 Управляван' :
           property.status === 'sold' ? '✅ Продаден' :
           '❓ Неопределен'}
        </div>
        {property.isArchived && (
          <div style={styles.archivedBadge}>📦 Архивиран</div>
        )}
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
                ≈ {Math.round(parseFloat(property.priceEur) * 1.95583).toLocaleString('bg-BG')} лв.
              </div>
            )}
          </div>
          <div style={styles.details}>
            <div>📐 {property.area} кв.м</div>
            <div>🚪 {property.rooms} стаи</div>
            {property.floor && <div>🏗️ {property.floor} етаж</div>}
          </div>
        </div>

        {property.sellerId && (
          <div style={styles.relationshipInfo}>
            👤 Продавач: #{property.sellerId}
          </div>
        )}

        {property.tenantId && (
          <div style={styles.relationshipInfo}>
            🏠 Наемател: #{property.tenantId}
          </div>
        )}

        <div style={styles.cardActions}>
          <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
            👁️ {property.viewings || 0} прегледа
          </div>
          
          <div style={{position: 'relative'}} className="action-menu-container">
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{...styles.actionButton, ...styles.menuButton}}
            >
              ⚙️ Действия
            </button>
            
            {showMenu && (
              <div style={styles.actionMenu}>
                <button
                  onClick={() => { onEdit(property); setShowMenu(false); }}
                  style={styles.menuItem}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ✏️ Редактирай
                </button>
                <button
                  onClick={() => { onIncrementViewing(property.id); setShowMenu(false); }}
                  style={styles.menuItem}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  👁️ Добави преглед
                </button>
                <button
                  onClick={() => { onArchive(property.id, !property.isArchived); setShowMenu(false); }}
                  style={styles.menuItem}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {property.isArchived ? '📦 Възстанови' : '📦 Архивирай'}
                </button>
                <button
                  onClick={() => { onAssignSeller(property.id); setShowMenu(false); }}
                  style={styles.menuItem}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  👤 Присвой продавач
                </button>
                <button
                  onClick={() => { onAssignBuyer(property.id); setShowMenu(false); }}
                  style={styles.menuItem}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🏠 Присвой купувач
                </button>
                <button
                  onClick={() => { onDelete(property.id); setShowMenu(false); }}
                  style={{...styles.menuItem, color: '#dc2626'}}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🗑️ Изтрий
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  // Page and UI state
  const [currentPage, setCurrentPage] = useState('properties');
  const [currency, setCurrency] = useState('EUR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [propertyFilter, setPropertyFilter] = useState('all');

  // Data state
  const [properties, setProperties] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Modal states
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [editingSeller, setEditingSeller] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProperties(),
        loadBuyers(),
        loadSellers(),
        loadTasks()
      ]);
    } catch (error) {
      setError('Грешка при зареждане на данните: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await propertiesAPI.getAll();
      const propertiesData = response?.properties || response || [];
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
    } catch (error) {
      console.error('Error loading properties:', error);
      throw error;
    }
  };

  const loadBuyers = async () => {
    try {
      const response = await buyersAPI.getAll();
      const buyersData = response?.buyers || response || [];
      setBuyers(Array.isArray(buyersData) ? buyersData : []);
    } catch (error) {
      console.error('Error loading buyers:', error);
      throw error;
    }
  };

  const loadSellers = async () => {
    try {
      const response = await sellersAPI.getAll();
      const sellersData = response?.sellers || response || [];
      setSellers(Array.isArray(sellersData) ? sellersData : []);
    } catch (error) {
      console.error('Error loading sellers:', error);
      // Don't throw error for sellers - it's not critical
    }
  };

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      const tasksData = response?.tasks || response || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Don't throw error for tasks - it's not critical
    }
  };

  // Property CRUD operations
  const handleAddProperty = async (propertyData) => {
    try {
      setLoading(true);
      const response = await propertiesAPI.create(propertyData);
      const newProperty = response?.property || response;
      setProperties(prev => [...prev, newProperty]);
      setShowPropertyModal(false);
      setEditingProperty(null);
      setSuccess('Имотът беше успешно добавен!');
      setError(null);
    } catch (error) {
      setError('Неуспешно добавяне на имот: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error adding property:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditProperty = async (propertyData) => {
    if (!editingProperty?.id) {
      throw new Error('Невалиден имот за редактиране');
    }

    try {
      setLoading(true);
      const response = await propertiesAPI.update(editingProperty.id, propertyData);
      const updatedProperty = response?.property || response;
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? updatedProperty : p));
      setShowPropertyModal(false);
      setEditingProperty(null);
      setSuccess('Имотът беше успешно обновен!');
      setError(null);
    } catch (error) {
      setError('Неуспешно обновяване на имот: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error updating property:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете този имот?')) {
      return;
    }

    try {
      setLoading(true);
      await propertiesAPI.delete(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      setSuccess('Имотът беше успешно изтрит!');
      setError(null);
    } catch (error) {
      setError('Неуспешно изтриване на имот: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error deleting property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveProperty = async (id, archive) => {
    try {
      setLoading(true);
      const response = await propertiesAPI.archive(id, archive);
      const updatedProperty = response?.property || response;
      setProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));
      setSuccess(`Имотът беше ${archive ? 'архивиран' : 'възстановен'}!`);
      setError(null);
    } catch (error) {
      setError(`Неуспешно ${archive ? 'архивиране' : 'възстановяване'} на имот: ` + (error.message || 'Неочаквана грешка'));
      console.error('Error archiving property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrementViewing = async (id) => {
    try {
      const response = await propertiesAPI.incrementViewing(id);
      const updatedProperty = response?.property || response;
      setProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));
      setSuccess('Прегледът беше отбелязан!');
    } catch (error) {
      setError('Неуспешно отбелязване на преглед: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error incrementing viewing:', error);
    }
  };

  const handleAssignSeller = async (propertyId) => {
    const sellerId = prompt('Въведете ID на продавача:');
    if (!sellerId) return;

    try {
      setLoading(true);
      const response = await propertiesAPI.assignSeller(propertyId, parseInt(sellerId));
      const updatedProperty = response?.property || response;
      setProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
      setSuccess('Продавачът беше успешно присвоен!');
      setError(null);
    } catch (error) {
      setError('Неуспешно присвояване на продавач: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error assigning seller:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBuyer = async (propertyId) => {
    const buyerId = prompt('Въведете ID на купувача/наемателя:');
    if (!buyerId) return;

    const isTenant = window.confirm('Това е наемател? (Отказ = купувач)');

    try {
      setLoading(true);
      const response = await propertiesAPI.assignBuyer(propertyId, parseInt(buyerId), isTenant);
      const updatedProperty = response?.property || response;
      setProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
      setSuccess(`${isTenant ? 'Наемателят' : 'Купувачът'} беше успешно присвоен!`);
      setError(null);
    } catch (error) {
      setError(`Неуспешно присвояване на ${isTenant ? 'наемател' : 'купувач'}: ` + (error.message || 'Неочаквана грешка'));
      console.error('Error assigning buyer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seller CRUD operations
  const handleAddSeller = async (sellerData) => {
    try {
      setLoading(true);
      const response = await sellersAPI.create(sellerData);
      const newSeller = response?.seller || response;
      setSellers(prev => [...prev, newSeller]);
      setShowSellerModal(false);
      setEditingSeller(null);
      setSuccess('Продавачът беше успешно добавен!');
      setError(null);
    } catch (error) {
      setError('Неуспешно добавяне на продавач: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error adding seller:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditSeller = async (sellerData) => {
    if (!editingSeller?.id) {
      throw new Error('Невалиден продавач за редактиране');
    }

    try {
      setLoading(true);
      const response = await sellersAPI.update(editingSeller.id, sellerData);
      const updatedSeller = response?.seller || response;
      setSellers(prev => prev.map(s => s.id === editingSeller.id ? updatedSeller : s));
      setShowSellerModal(false);
      setEditingSeller(null);
      setSuccess('Продавачът беше успешно обновен!');
      setError(null);
    } catch (error) {
      setError('Неуспешно обновяване на продавач: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error updating seller:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeller = async (id) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете този продавач?')) {
      return;
    }

    try {
      setLoading(true);
      await sellersAPI.delete(id);
      setSellers(prev => prev.filter(s => s.id !== id));
      setSuccess('Продавачът беше успешно изтрит!');
      setError(null);
    } catch (error) {
      setError('Неуспешно изтриване на продавач: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error deleting seller:', error);
    } finally {
      setLoading(false);
    }
  };

  // Task CRUD operations
  const handleAddTask = async (taskData) => {
    try {
      setLoading(true);
      const response = await tasksAPI.create(taskData);
      const newTask = response?.task || response;
      setTasks(prev => [...prev, newTask]);
      setShowTaskModal(false);
      setEditingTask(null);
      setSuccess('Задачата беше успешно добавена!');
      setError(null);
    } catch (error) {
      setError('Неуспешно добавяне на задача: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error adding task:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (taskData) => {
    if (!editingTask?.id) {
      throw new Error('Невалидна задача за редактиране');
    }

    try {
      setLoading(true);
      const response = await tasksAPI.update(editingTask.id, taskData);
      const updatedTask = response?.task || response;
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
      setShowTaskModal(false);
      setEditingTask(null);
      setSuccess('Задачата беше успешно обновена!');
      setError(null);
    } catch (error) {
      setError('Неуспешно обновяване на задача: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error updating task:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете тази задача?')) {
      return;
    }

    try {
      setLoading(true);
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setSuccess('Задачата беше успешно изтрита!');
      setError(null);
    } catch (error) {
      setError('Неуспешно изтриване на задача: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      setLoading(true);
      const response = await tasksAPI.complete(id);
      const updatedTask = response?.task || response;
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      setSuccess('Задачата беше отбелязана като завършена!');
      setError(null);
    } catch (error) {
      setError('Неуспешно завършване на задача: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error completing task:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddBuyer = async (buyerData) => {
    try {
      setLoading(true);
      const response = await buyersAPI.create(buyerData);
      const newBuyer = response?.buyer || response;
      setBuyers(prev => [...prev, newBuyer]);
      setShowBuyerModal(false);
      setEditingBuyer(null);
      setSuccess('Купувачът беше успешно добавен!');
      setError(null);
    } catch (error) {
      setError('Неуспешно добавяне на купувач: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error adding buyer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditBuyer = async (buyerData) => {
    if (!editingBuyer?.id) {
      throw new Error('Невалиден купувач за редактиране');
    }

    try {
      setLoading(true);
      const response = await buyersAPI.update(editingBuyer.id, buyerData);
      const updatedBuyer = response?.buyer || response;
      setBuyers(prev => prev.map(b => b.id === editingBuyer.id ? updatedBuyer : b));
      setShowBuyerModal(false);
      setEditingBuyer(null);
      setSuccess('Купувачът беше успешно обновен!');
      setError(null);
    } catch (error) {
      setError('Неуспешно обновяване на купувач: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error updating buyer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBuyer = async (id) => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете този купувач?')) {
      return;
    }

    try {
      setLoading(true);
      await buyersAPI.delete(id);
      setBuyers(prev => prev.filter(b => b.id !== id));
      setSuccess('Купувачът беше успешно изтрит!');
      setError(null);
    } catch (error) {
      setError('Неуспешно изтриване на купувач: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error deleting buyer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatPrice = (priceEur) => {
    if (!priceEur || isNaN(parseFloat(priceEur))) return 'N/A';
    const price = parseFloat(priceEur);
    if (currency === 'EUR') {
      return `${price.toLocaleString('bg-BG')} EUR`;
    } else {
      const priceBgn = Math.round(price * EUR_TO_BGN_RATE);
      return `${priceBgn.toLocaleString('bg-BG')} лв.`;
    }
  };

  const getFilteredProperties = () => {
    if (propertyFilter === 'all') return properties;
    return properties.filter(property => property.propertyType === propertyFilter);
  };

  const getBuyerStatusBadge = (status) => {
    const statusConfig = {
      active: { color: '#10b981', label: 'Активен' },
      potential: { color: '#f59e0b', label: 'Потенциален' },
      converted: { color: '#3b82f6', label: 'Клиент' },
      inactive: { color: '#6b7280', label: 'Неактивен' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    
    return {
      backgroundColor: config.color,
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

  const openEditSellerModal = (seller) => {
    setEditingSeller(seller);
    setShowSellerModal(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const closePropertyModal = () => {
    setShowPropertyModal(false);
    setEditingProperty(null);
  };

  const closeBuyerModal = () => {
    setShowBuyerModal(false);
    setEditingBuyer(null);
  };

  const closeSellerModal = () => {
    setShowSellerModal(false);
    setEditingSeller(null);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Global Styles */}
      <style>{globalStyles}</style>

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
              <option value="EUR">💶 EUR (1.00)</option>
              <option value="BGN">💴 BGN ({EUR_TO_BGN_RATE})</option>
            </select>

            <div style={{fontSize: '0.875rem', color: '#374151'}}>
              <div style={{fontWeight: '600'}}>👤 Мария Иванова</div>
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

      {/* Messages */}
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '1rem'}}>
        {error && (
          <div style={styles.errorAlert}>
            <div style={styles.errorText}>{error}</div>
            <button 
              onClick={() => setError(null)}
              style={{
                background: 'none', 
                border: 'none', 
                fontSize: '1.25rem', 
                cursor: 'pointer',
                color: '#dc2626'
              }}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <div style={styles.successText}>{success}</div>
            <button 
              onClick={() => setSuccess(null)}
              style={{
                background: 'none', 
                border: 'none', 
                fontSize: '1.25rem', 
                cursor: 'pointer',
                color: '#15803d'
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

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
                style={styles.addButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                ➕ Добави имот
              </button>
            </div>

            {/* Statistics Cards */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{properties.length}</div>
                <div style={styles.statLabel}>Общо имоти</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{properties.filter(p => p.status === 'available').length}</div>
                <div style={styles.statLabel}>Свободни</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{properties.filter(p => p.status === 'rented').length}</div>
                <div style={styles.statLabel}>Отдадени</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{properties.filter(p => p.status === 'sold').length}</div>
                <div style={styles.statLabel}>Продадени</div>
              </div>
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
                <PropertyCard
                  key={property.id}
                  property={property}
                  currency={currency}
                  onEdit={openEditPropertyModal}
                  onDelete={handleDeleteProperty}
                  onArchive={handleArchiveProperty}
                  onAssignSeller={handleAssignSeller}
                  onAssignBuyer={handleAssignBuyer}
                  onIncrementViewing={handleIncrementViewing}
                  formatPrice={formatPrice}
                />
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
                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                ➕ Добави купувач
              </button>
            </div>

            {/* Buyer Statistics */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{buyers.length}</div>
                <div style={styles.statLabel}>Общо купувачи</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{buyers.filter(b => b.status === 'active').length}</div>
                <div style={styles.statLabel}>Активни</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{buyers.filter(b => b.status === 'potential').length}</div>
                <div style={styles.statLabel}>Потенциални</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{buyers.filter(b => b.status === 'converted').length}</div>
                <div style={styles.statLabel}>Клиенти</div>
              </div>
            </div>
            
            <div style={styles.grid}>
              {buyers.map((buyer) => (
                <div key={buyer.id} style={styles.card}>
                  <div style={styles.cardContent}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                      <div style={styles.buyerAvatar}>
                        {buyer.firstName?.[0]?.toUpperCase() || '?'}{buyer.lastName?.[0]?.toUpperCase() || '?'}
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
                      {buyer.preferredAreas && buyer.preferredAreas.length > 0 && (
                        <div style={{marginTop: '0.5rem'}}>📍 Райони: {Array.isArray(buyer.preferredAreas) ? buyer.preferredAreas.join(', ') : buyer.preferredAreas}</div>
                      )}
                    </div>
                    
                    <div style={styles.cardActions}>
                      <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        📅 Контакт: {buyer.lastContact ? new Date(buyer.lastContact).toLocaleDateString('bg-BG') : 'Няма'}
                      </div>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          onClick={() => openEditBuyerModal(buyer)}
                          style={{...styles.actionButton, backgroundColor: '#10b981', color: 'white'}}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteBuyer(buyer.id)}
                          style={{...styles.actionButton, ...styles.deleteButton}}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
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

        {/* Sellers Section */}
        {currentPage === 'sellers' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>🏪 Продавачи</h2>
              <button
                onClick={() => {
                  setEditingSeller(null);
                  setShowSellerModal(true);
                }}
                style={{...styles.addButton, backgroundColor: '#f59e0b'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
              >
                ➕ Добави продавач
              </button>
            </div>

            {/* Seller Statistics */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{sellers.length}</div>
                <div style={styles.statLabel}>Общо продавачи</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{sellers.filter(s => s.status === 'active').length}</div>
                <div style={styles.statLabel}>Активни</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{sellers.filter(s => s.status === 'inactive').length}</div>
                <div style={styles.statLabel}>Неактивни</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>
                  {sellers.length > 0 ? 
                    (sellers.reduce((sum, s) => sum + (s.commission || 0), 0) / sellers.length).toFixed(1) + '%' : 
                    '0%'
                  }
                </div>
                <div style={styles.statLabel}>Средна комисионна</div>
              </div>
            </div>
            
            <div style={styles.grid}>
              {sellers.map((seller) => (
                <div key={seller.id} style={styles.card}>
                  <div style={styles.cardContent}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                      <div style={{...styles.buyerAvatar, backgroundColor: '#f59e0b'}}>
                        {seller.firstName?.[0]?.toUpperCase() || '?'}{seller.lastName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 style={styles.cardTitle}>{seller.firstName} {seller.lastName}</h3>
                        <span style={{
                          ...getBuyerStatusBadge(seller.status),
                          backgroundColor: seller.status === 'active' ? '#f59e0b' : '#6b7280'
                        }}>
                          {seller.status === 'active' ? 'Активен' :
                           seller.status === 'inactive' ? 'Неактивен' :
                           'В процес'}
                        </span>
                      </div>
                    </div>

                    <div style={{marginBottom: '1rem'}}>
                      <div style={{marginBottom: '0.5rem'}}>📞 {seller.phone}</div>
                      {seller.email && <div style={{marginBottom: '0.5rem'}}>✉️ {seller.email}</div>}
                      {seller.commission && (
                        <div style={{marginBottom: '0.5rem'}}>💰 Комисионна: {seller.commission}%</div>
                      )}
                      {seller.address && (
                        <div style={{marginTop: '0.5rem'}}>📍 {seller.address}</div>
                      )}
                    </div>
                    
                    <div style={styles.cardActions}>
                      <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        📅 Създаден: {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString('bg-BG') : 'Няма'}
                      </div>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          onClick={() => openEditSellerModal(seller)}
                          style={{...styles.actionButton, backgroundColor: '#f59e0b', color: 'white'}}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSeller(seller.id)}
                          style={{...styles.actionButton, ...styles.deleteButton}}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sellers.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🏪</div>
                <div style={styles.emptyTitle}>Няма продавачи за показване</div>
                <div>Добавете първия си продавач, за да започнете</div>
              </div>
            )}
          </div>
        )}

        {/* Tasks Section */}
        {currentPage === 'tasks' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>📅 Задачи</h2>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                style={{...styles.addButton, backgroundColor: '#8b5cf6'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
              >
                ➕ Добави задача
              </button>
            </div>

            {/* Task Statistics */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{tasks.length}</div>
                <div style={styles.statLabel}>Общо задачи</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{tasks.filter(t => t.status === 'pending').length}</div>
                <div style={styles.statLabel}>В очакване</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{tasks.filter(t => t.status === 'completed').length}</div>
                <div style={styles.statLabel}>Завършени</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>
                  {tasks.filter(t => 
                    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
                  ).length}
                </div>
                <div style={styles.statLabel}>Просрочени</div>
              </div>
            </div>
            
            <div style={styles.grid}>
              {tasks.map((task) => (
                <div key={task.id} style={styles.card}>
                  <div style={styles.cardContent}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem'}}>
                      <h3 style={styles.cardTitle}>{task.title}</h3>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'end'}}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: 
                            task.priority === 'urgent' ? '#dc2626' :
                            task.priority === 'high' ? '#ea580c' :
                            task.priority === 'medium' ? '#d97706' : '#65a30d',
                          color: 'white'
                        }}>
                          {task.priority === 'urgent' ? '🚨 Спешен' :
                           task.priority === 'high' ? '🔴 Висок' :
                           task.priority === 'medium' ? '🟡 Среден' : '🟢 Нисък'}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: 
                            task.status === 'completed' ? '#059669' :
                            task.status === 'in-progress' ? '#0284c7' :
                            task.status === 'cancelled' ? '#6b7280' : '#d97706',
                          color: 'white'
                        }}>
                          {task.status === 'completed' ? '✅ Завършена' :
                           task.status === 'in-progress' ? '⏳ В процес' :
                           task.status === 'cancelled' ? '❌ Отменена' : '📋 В очакване'}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <div style={{marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280'}}>
                        {task.description}
                      </div>
                    )}

                    <div style={{marginBottom: '1rem'}}>
                      {task.dueDate && (
                        <div style={{marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          📅 Краен срок: {new Date(task.dueDate).toLocaleDateString('bg-BG')}
                          {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                            <span style={{color: '#dc2626', fontWeight: '600', fontSize: '0.75rem'}}>
                              (Просрочена)
                            </span>
                          )}
                        </div>
                      )}
                      {task.propertyId && (
                        <div style={{marginBottom: '0.5rem'}}>🏠 Имот: #{task.propertyId}</div>
                      )}
                      {task.buyerId && (
                        <div style={{marginBottom: '0.5rem'}}>👤 Купувач: #{task.buyerId}</div>
                      )}
                    </div>
                    
                    <div style={styles.cardActions}>
                      <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                        📅 Създадена: {task.createdAt ? new Date(task.createdAt).toLocaleDateString('bg-BG') : 'Няма'}
                      </div>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            style={{...styles.actionButton, backgroundColor: '#059669', color: 'white'}}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                          >
                            ✅
                          </button>
                        )}
                        <button
                          onClick={() => openEditTaskModal(task)}
                          style={{...styles.actionButton, backgroundColor: '#8b5cf6', color: 'white'}}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          style={{...styles.actionButton, ...styles.deleteButton}}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {tasks.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📅</div>
                <div style={styles.emptyTitle}>Няма задачи за показване</div>
                <div>Добавете първата си задача, за да започнете</div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <PropertyModal
        show={showPropertyModal}
        onClose={closePropertyModal}
        onSave={editingProperty ? handleEditProperty : handleAddProperty}
        property={editingProperty}
        isEdit={!!editingProperty}
      />

      <BuyerModal
        show={showBuyerModal}
        onClose={closeBuyerModal}
        onSave={editingBuyer ? handleEditBuyer : handleAddBuyer}
        buyer={editingBuyer}
        isEdit={!!editingBuyer}
      />

      <SellerModal
        show={showSellerModal}
        onClose={closeSellerModal}
        onSave={editingSeller ? handleEditSeller : handleAddSeller}
        seller={editingSeller}
        isEdit={!!editingSeller}
      />

      <TaskModal
        show={showTaskModal}
        onClose={closeTaskModal}
        onSave={editingTask ? handleEditTask : handleAddTask}
        task={editingTask}
        isEdit={!!editingTask}
      />
    </div>
  );
};

export default App;