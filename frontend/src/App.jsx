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
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
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
  companyName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
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
  // Custom Modal Styles
  customModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem',
    animation: 'modalFadeIn 0.3s ease-out'
  },
  customModalContent: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  customModalHeader: {
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e5e7eb'
  },
  customModalTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  customModalBody: {
    padding: '1.5rem'
  },
  customModalText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: '1.5'
  },
  customModalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem'
  },
  customModalButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  customModalButtonSecondary: {
    backgroundColor: '#f3f4f6',
    color: '#374151'
  },
  customModalButtonPrimary: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  customModalButtonDanger: {
    backgroundColor: '#ef4444',
    color: 'white'
  },
  // Dropdown Styles
  dropdown: {
    position: 'relative',
    width: '100%'
  },
  dropdownButton: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    fontSize: '0.875rem',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
    zIndex: 1000,
    maxHeight: '200px',
    overflowY: 'auto'
  },
  dropdownItem: {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6'
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

// Custom Confirmation Dialog Component
const CustomConfirmDialog = ({ show, title, message, onConfirm, onCancel, type = 'danger' }) => {
  if (!show) return null;

  return (
    <div style={styles.customModal}>
      <div style={styles.customModalContent}>
        <div style={styles.customModalHeader}>
          <h3 style={styles.customModalTitle}>
            {type === 'danger' ? '⚠️ ' : type === 'warning' ? '🚨 ' : 'ℹ️ '}
            {title}
          </h3>
        </div>
        <div style={styles.customModalBody}>
          <p style={styles.customModalText}>{message}</p>
          <div style={styles.customModalActions}>
            <button
              onClick={onCancel}
              style={{
                ...styles.customModalButton,
                ...styles.customModalButtonSecondary
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            >
              Отказ
            </button>
            <button
              onClick={onConfirm}
              style={{
                ...styles.customModalButton,
                ...(type === 'danger' ? styles.customModalButtonDanger : styles.customModalButtonPrimary)
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = type === 'danger' ? '#dc2626' : '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = type === 'danger' ? '#ef4444' : '#3b82f6'}
            >
              {type === 'danger' ? 'Изтрий' : 'Потвърди'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div style={styles.formGroup}>
      {label && <label style={styles.label}>{label}</label>}
      <div style={styles.dropdown}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={styles.dropdownButton}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <span style={{transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s'}}>
            ▼
          </span>
        </button>
        {isOpen && (
          <div style={styles.dropdownMenu}>
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={styles.dropdownItem}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Property Modal Component with validation and dropdowns
const PropertyModal = ({ show, onClose, onSave, property = null, isEdit = false, sellers = [], buyers = [] }) => {
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
    description: '',
    sellerId: '',
    buyerId: '',
    tenantId: '',
    landlordId: ''
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
        description: property.description || '',
        sellerId: property.sellerId?.toString() || '',
        buyerId: property.buyerId?.toString() || '',
        tenantId: property.tenantId?.toString() || '',
        landlordId: property.landlordId?.toString() || ''
      });
    } else if (show) {
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
        description: '',
        sellerId: '',
        buyerId: '',
        tenantId: '',
        landlordId: ''
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
        monthlyRentEur: formData.monthlyRentEur ? parseFloat(formData.monthlyRentEur) : null,
        sellerId: formData.sellerId ? parseInt(formData.sellerId) : null,
        buyerId: formData.buyerId ? parseInt(formData.buyerId) : null,
        tenantId: formData.tenantId ? parseInt(formData.tenantId) : null,
        landlordId: formData.landlordId ? parseInt(formData.landlordId) : null
      };

      await onSave(dataToSend);
    } catch (error) {
      setValidationErrors(['Грешка при запазване: ' + (error.message || 'Неочаквана грешка')]);
    }
  };

  if (!show) return null;

  const isRentProperty = formData.propertyType === 'rent' || formData.propertyType === 'managed';

  // Create options for dropdowns
  const sellerOptions = [
    { value: '', label: 'Изберете продавач' },
    ...sellers.map(seller => ({
      value: seller.id.toString(),
      label: `${seller.firstName} ${seller.lastName} - ${seller.phone}`
    }))
  ];

  const buyerOptions = [
    { value: '', label: `Изберете ${isRentProperty ? 'наемател' : 'купувач'}` },
    ...buyers.map(buyer => ({
      value: buyer.id.toString(),
      label: `${buyer.firstName} ${buyer.lastName} - ${buyer.phone}`
    }))
  ];

  const landlordOptions = [
    { value: '', label: 'Изберете наемодател' },
    ...sellers.map(seller => ({
      value: seller.id.toString(),
      label: `${seller.firstName} ${seller.lastName} - ${seller.phone}`
    }))
  ];

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {isEdit ? '✏️ Редактиране на имот' : '🏠 Добавяне на нов имот'}
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

              {/* Relationship Fields */}
              {!isRentProperty && (
                <>
                  <CustomDropdown
                    value={formData.sellerId}
                    onChange={(value) => setFormData({...formData, sellerId: value})}
                    options={sellerOptions}
                    placeholder="Изберете продавач"
                    label="👤 Продавач"
                  />

                  <CustomDropdown
                    value={formData.buyerId}
                    onChange={(value) => setFormData({...formData, buyerId: value})}
                    options={buyerOptions}
                    placeholder="Изберете купувач"
                    label="🏪 Купувач"
                  />
                </>
              )}

              {isRentProperty && (
                <>
                  <CustomDropdown
                    value={formData.landlordId}
                    onChange={(value) => setFormData({...formData, landlordId: value})}
                    options={landlordOptions}
                    placeholder="Изберете наемодател"
                    label="🏠 Наемодател"
                  />

                  <CustomDropdown
                    value={formData.tenantId}
                    onChange={(value) => setFormData({...formData, tenantId: value})}
                    options={buyerOptions}
                    placeholder="Изберете наемател"
                    label="👤 Наемател"
                  />
                </>
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
                {isEdit ? 'Обновяване' : 'Създаване'}
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

  const isRentProperty = property.propertyType === 'rent' || property.propertyType === 'managed';

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

        {/* Relationship Information */}
        {!isRentProperty && property.sellerId && (
          <div style={styles.relationshipInfo}>
            👤 Продавач: #{property.sellerId}
          </div>
        )}

        {!isRentProperty && property.buyerId && (
          <div style={styles.relationshipInfo}>
            🏪 Купувач: #{property.buyerId}
          </div>
        )}

        {isRentProperty && property.landlordId && (
          <div style={styles.relationshipInfo}>
            🏠 Наемодател: #{property.landlordId}
          </div>
        )}

        {isRentProperty && property.tenantId && (
          <div style={styles.relationshipInfo}>
            👤 Наемател: #{property.tenantId}
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
                  ✏️ Редактиране
                </button>
                <button
                  onClick={() => { onIncrementViewing(property.id); setShowMenu(false); }}
                  style={styles.menuItem}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  👁️ Добавяне на преглед
                </button>
                <button
                  onClick={() => { onArchive(property.id, !property.isArchived); setShowMenu(false); }}
                  style={styles.menuItem}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {property.isArchived ? '📦 Възстановяване' : '📦 Архивиране'}
                </button>
                <button
                  onClick={() => { onAssignSeller(property.id); setShowMenu(false); }}
                  style={styles.menuItem}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  👤 Назначаване на {isRentProperty ? 'наемодател' : 'продавач'}
                </button>
                <button
                  onClick={() => { onAssignBuyer(property.id); setShowMenu(false); }}
                  style={styles.menuItem}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🏠 Назначаване на {isRentProperty ? 'наемател' : 'купувач'}
                </button>
                <button
                  onClick={() => { onDelete(property.id); setShowMenu(false); }}
                  style={{...styles.menuItem, color: '#dc2626'}}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🗑️ Изтриване
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({});
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingBuyer, setEditingBuyer] = useState(null);

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
    }
  };

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      const tasksData = response?.tasks || response || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Custom confirmation helper
  const showCustomConfirm = (title, message, onConfirm, type = 'danger') => {
    setConfirmDialog({ title, message, onConfirm, type });
    setShowConfirmDialog(true);
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
    const property = properties.find(p => p.id === id);
    const propertyTitle = property ? property.title : `Имот #${id}`;
    
    showCustomConfirm(
      'Потвърждение за изтриване',
      `Сигурни ли сте, че искате да изтриете "${propertyTitle}"? Това действие не може да бъде отменено.`,
      async () => {
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
        setShowConfirmDialog(false);
      },
      'danger'
    );
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
    // This would normally open a modal to select from sellers
    // For now, using a simple prompt
    const sellerId = prompt('Въведете ID на продавача:');
    if (!sellerId) return;

    try {
      setLoading(true);
      const response = await propertiesAPI.assignSeller(propertyId, parseInt(sellerId));
      const updatedProperty = response?.property || response;
      setProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
      setSuccess('Продавачът беше успешно назначен!');
      setError(null);
    } catch (error) {
      setError('Неуспешно назначаване на продавач: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error assigning seller:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBuyer = async (propertyId) => {
    // This would normally open a modal to select from buyers
    // For now, using a simple prompt
    const buyerId = prompt('Въведете ID на купувача/наемателя:');
    if (!buyerId) return;

    const isTenant = window.confirm('Това е наемател? (Отказ = купувач)');

    try {
      setLoading(true);
      const response = await propertiesAPI.assignBuyer(propertyId, parseInt(buyerId), isTenant);
      const updatedProperty = response?.property || response;
      setProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
      setSuccess(`${isTenant ? 'Наемателят' : 'Купувачът'} беше успешно назначен!`);
      setError(null);
    } catch (error) {
      setError(`Неуспешно назначаване на ${isTenant ? 'наемател' : 'купувач'}: ` + (error.message || 'Неочаквана грешка'));
      console.error('Error assigning buyer:', error);
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
    let filtered = properties;
    
    // Filter by archive status and type
    if (currentPage === 'archive') {
      filtered = properties.filter(p => p.isArchived);
    } else {
      filtered = properties.filter(p => !p.isArchived);
      
      if (propertyFilter !== 'all') {
        filtered = filtered.filter(property => property.propertyType === propertyFilter);
      }
    }
    
    return filtered;
  };

  const openEditPropertyModal = (property) => {
    setEditingProperty(property);
    setShowPropertyModal(true);
  };

  const closePropertyModal = () => {
    setShowPropertyModal(false);
    setEditingProperty(null);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Global Styles */}
      <style>{globalStyles}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span>🏢</span>
            <div>
              <div style={styles.companyName}>М&Ю Консулт</div>
              <div style={{fontSize: '0.75rem', color: '#6b7280'}}>Real Estate CRM</div>
            </div>
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
            { id: 'tasks', label: '📅 Задачи' },
            { id: 'archive', label: '📦 Архив' }
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
              <h2 style={styles.sectionTitle}>🏠 Активни имоти</h2>
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setShowPropertyModal(true);
                }}
                style={styles.addButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                ➕ Добавяне на имот
              </button>
            </div>

            {/* Statistics Cards */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{properties.filter(p => !p.isArchived).length}</div>
                <div style={styles.statLabel}>Активни имоти</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{properties.filter(p => p.status === 'available' && !p.isArchived).length}</div>
                <div style={styles.statLabel}>Свободни</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{properties.filter(p => p.status === 'rented' && !p.isArchived).length}</div>
                <div style={styles.statLabel}>Отдадени</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{properties.filter(p => p.status === 'sold' && !p.isArchived).length}</div>
                <div style={styles.statLabel}>Продадени</div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div style={styles.filterButtons}>
              {[
                { key: 'all', label: `Всички (${properties.filter(p => !p.isArchived).length})` },
                { key: 'sale', label: `Продажба (${properties.filter(p => p.propertyType === 'sale' && !p.isArchived).length})` },
                { key: 'rent', label: `Наем (${properties.filter(p => p.propertyType === 'rent' && !p.isArchived).length})` },
                { key: 'managed', label: `Управлявани (${properties.filter(p => p.propertyType === 'managed' && !p.isArchived).length})` }
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

        {/* Archive Section */}
        {currentPage === 'archive' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>📦 Архивирани имоти</h2>
            </div>

            {/* Archive Statistics */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{properties.filter(p => p.isArchived).length}</div>
                <div style={styles.statLabel}>Архивирани имоти</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{buyers.filter(b => b.isArchived).length}</div>
                <div style={styles.statLabel}>Архивирани купувачи</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{sellers.filter(s => s.isArchived).length}</div>
                <div style={styles.statLabel}>Архивирани продавачи</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{properties.length + buyers.length + sellers.length}</div>
                <div style={styles.statLabel}>Общо записи</div>
              </div>
            </div>

            {/* Archived Properties Grid */}
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
                <div style={styles.emptyIcon}>📦</div>
                <div style={styles.emptyTitle}>Няма архивирани имоти</div>
                <div>Архивираните имоти ще се показват тук</div>
              </div>
            )}
          </div>
        )}

        {/* Other sections remain the same for now */}
        {currentPage === 'buyers' && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <div style={styles.emptyTitle}>Купувачи</div>
            <div>Секцията за купувачи ще бъде подобрена скоро...</div>
          </div>
        )}

        {currentPage === 'sellers' && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏪</div>
            <div style={styles.emptyTitle}>Продавачи</div>
            <div>Секцията за продавачи ще бъде подобрена скоро...</div>
          </div>
        )}

        {currentPage === 'tasks' && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📅</div>
            <div style={styles.emptyTitle}>Задачи</div>
            <div>Секцията за задачи ще бъде подобрена скоро...</div>
          </div>
        )}
      </main>

      {/* Custom Confirmation Dialog */}
      <CustomConfirmDialog
        show={showConfirmDialog}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setShowConfirmDialog(false)}
        type={confirmDialog.type}
      />

      {/* Property Modal */}
      <PropertyModal
        show={showPropertyModal}
        onClose={closePropertyModal}
        onSave={editingProperty ? handleEditProperty : handleAddProperty}
        property={editingProperty}
        isEdit={!!editingProperty}
        sellers={sellers}
        buyers={buyers}
      />
    </div>
  );
};

export default App;