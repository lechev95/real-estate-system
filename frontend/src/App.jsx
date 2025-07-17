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
`;

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
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
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
  tenantInfo: {
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
  peopleSection: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
    fontSize: '0.875rem'
  },
  personItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.25rem 0'
  }
};

// Enhanced Property Card Component
const EnhancedPropertyCard = ({ 
  property, 
  currency, 
  formatPrice, 
  onEdit, 
  onDelete, 
  onArchive, 
  onUnarchive,
  onAssignSeller,
  onAssignBuyer,
  onViewingIncrement,
  buyers = [],
  sellers = []
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState('');
  const [assignmentType, setAssignmentType] = useState('buyer');

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {...styles.statusBadge};
    switch(status?.toLowerCase()) {
      case 'available': return {...baseStyle, backgroundColor: '#10b981'};
      case 'rented': return {...baseStyle, backgroundColor: '#f59e0b'};
      case 'managed': return {...baseStyle, backgroundColor: '#3b82f6'};
      case 'sold': return {...baseStyle, backgroundColor: '#8b5cf6'};
      case 'archived': return {...baseStyle, backgroundColor: '#6b7280'};
      default: return {...baseStyle, backgroundColor: '#6b7280'};
    }
  };

  const getStatusLabel = (status) => {
    switch(status?.toLowerCase()) {
      case 'available': return '✅ Свободен';
      case 'rented': return '🔶 Отдаден';
      case 'managed': return '🔷 Управляван';
      case 'sold': return '💜 Продаден';
      case 'archived': return '📦 Архивиран';
      default: return '❓ Неопределен';
    }
  };

  const handleAssignSeller = async () => {
    if (selectedSeller && onAssignSeller) {
      await onAssignSeller(property.id, parseInt(selectedSeller));
      setShowSellerModal(false);
      setSelectedSeller('');
    }
  };

  const handleAssignBuyer = async () => {
    if (selectedBuyer && onAssignBuyer) {
      await onAssignBuyer(property.id, parseInt(selectedBuyer), assignmentType);
      setShowBuyerModal(false);
      setSelectedBuyer('');
    }
  };

  return (
    <div 
      style={{
        ...styles.card,
        opacity: property.status === 'archived' ? 0.7 : 1
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{
        ...styles.cardImage,
        background: property.status === 'archived' 
          ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={styles.cardImageIcon}>🏠</div>
        <div style={getStatusBadgeStyle(property.status)}>
          {getStatusLabel(property.status)}
        </div>
        {property.status === 'archived' && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: '#6b7280'
          }}>
            📦 Архивиран
          </div>
        )}
      </div>

      <div style={styles.cardContent}>
        <div style={{...styles.cardTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <span>{property.title}</span>
          <div style={{position: 'relative'}}>
            <button
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '50%',
                color: '#6b7280'
              }}
              onClick={() => setShowActions(!showActions)}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ⋮
            </button>
            
            {showActions && (
              <div style={{
                position: 'absolute',
                top: '2.5rem',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 10,
                minWidth: '200px'
              }}>
                <div 
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => { onEdit(property); setShowActions(false); }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span>✏️</span> Редактирай
                </div>
                
                <div 
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={async () => { 
                    if (onViewingIncrement) await onViewingIncrement(property.id); 
                    setShowActions(false); 
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span>👁️</span> Отбележи преглед
                </div>
                
                {!property.seller && (
                  <div 
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={() => { setShowSellerModal(true); setShowActions(false); }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <span>🏪</span> Добави продавач
                  </div>
                )}
                
                {(property.status === 'available' || property.status === 'rented') && (
                  <div 
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={() => { setShowBuyerModal(true); setShowActions(false); }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <span>👤</span> {property.propertyType === 'sale' ? 'Добави купувач' : 'Добави наемател'}
                  </div>
                )}
                
                {property.status !== 'archived' ? (
                  <div 
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={() => { if (onArchive) onArchive(property.id); setShowActions(false); }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <span>📦</span> Архивирай
                  </div>
                ) : (
                  <div 
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={() => { if (onUnarchive) onUnarchive(property.id); setShowActions(false); }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <span>📤</span> Върни от архив
                  </div>
                )}
                
                <div 
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => { onDelete(property.id); setShowActions(false); }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span>🗑️</span> Изтрий
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.cardAddress}>
          📍 {property.address}
          {property.city && property.city !== property.address && `, ${property.city}`}
        </div>
        
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
                ≈ {Math.round(parseFloat(property.priceEur) * EUR_TO_BGN_RATE).toLocaleString('bg-BG')} лв.
              </div>
            )}
          </div>
          
          <div style={styles.details}>
            <div>📐 {property.area} кв.м</div>
            <div>🚪 {property.rooms} стаи</div>
            {property.floor && <div>🏗️ {property.floor} етаж</div>}
            {property.yearBuilt && <div>📅 {property.yearBuilt} г.</div>}
          </div>
        </div>

        {(property.seller || property.assignedAgent || property.tenants?.length > 0) && (
          <div style={styles.peopleSection}>
            {property.seller && (
              <div style={styles.personItem}>
                <span>🏪 Продавач:</span>
                <strong>{property.seller.firstName} {property.seller.lastName}</strong>
              </div>
            )}
            
            {property.assignedAgent && (
              <div style={styles.personItem}>
                <span>👨‍💼 Агент:</span>
                <strong>{property.assignedAgent.firstName} {property.assignedAgent.lastName}</strong>
              </div>
            )}
            
            {property.tenants?.length > 0 && (
              <div style={styles.personItem}>
                <span>👤 Наемател:</span>
                <strong>{property.tenants[0].firstName} {property.tenants[0].lastName}</strong>
              </div>
            )}
          </div>
        )}

        <div style={styles.cardActions}>
          <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
            👁️ {property.viewings || 0} прегледа
            {property.lastViewing && (
              <div>Последен: {new Date(property.lastViewing).toLocaleDateString('bg-BG')}</div>
            )}
          </div>
          
          <div style={{fontSize: '0.75rem', color: '#9ca3af'}}>
            {property.createdAt && `Добавен: ${new Date(property.createdAt).toLocaleDateString('bg-BG')}`}
          </div>
        </div>
      </div>

      {/* Seller Assignment Modal */}
      {showSellerModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{...styles.modalHeader, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
              <h3 style={styles.modalTitle}>🏪 Добави продавач към имот</h3>
              <button 
                onClick={() => setShowSellerModal(false)} 
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>Избери продавач за "{property.title}":</p>
              
              <select
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
                style={styles.select}
              >
                <option value="">Изберете продавач...</option>
                {sellers.map(seller => (
                  <option key={seller.id} value={seller.id}>
                    {seller.firstName} {seller.lastName} - {seller.phone}
                  </option>
                ))}
              </select>
              
              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowSellerModal(false)}
                  style={styles.cancelButton}
                >
                  Отказ
                </button>
                <button
                  onClick={handleAssignSeller}
                  disabled={!selectedSeller}
                  style={{
                    ...styles.submitButton,
                    backgroundColor: selectedSeller ? '#f59e0b' : '#d1d5db',
                    cursor: selectedSeller ? 'pointer' : 'not-allowed'
                  }}
                >
                  Присвой
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buyer/Tenant Assignment Modal */}
      {showBuyerModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{...styles.modalHeader, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
              <h3 style={styles.modalTitle}>
                👤 {property.propertyType === 'sale' ? 'Продай имот' : 'Отдай под наем'}
              </h3>
              <button 
                onClick={() => setShowBuyerModal(false)} 
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>Избери {property.propertyType === 'sale' ? 'купувач' : 'наемател'} за "{property.title}":</p>
              
              {property.propertyType !== 'sale' && (
                <div style={{marginBottom: '1rem'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                    <input
                      type="radio"
                      value="tenant"
                      checked={assignmentType === 'tenant'}
                      onChange={(e) => setAssignmentType(e.target.value)}
                    />
                    Наемател (отдаване под наем)
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <input
                      type="radio"
                      value="buyer"
                      checked={assignmentType === 'buyer'}
                      onChange={(e) => setAssignmentType(e.target.value)}
                    />
                    Купувач (продажба)
                  </label>
                </div>
              )}
              
              <select
                value={selectedBuyer}
                onChange={(e) => setSelectedBuyer(e.target.value)}
                style={styles.select}
              >
                <option value="">Изберете {assignmentType === 'tenant' ? 'наемател' : 'купувач'}...</option>
                {buyers.filter(buyer => buyer.status === 'active').map(buyer => (
                  <option key={buyer.id} value={buyer.id}>
                    {buyer.firstName} {buyer.lastName} - {buyer.phone}
                    {buyer.budgetMax && ` (до ${formatPrice(buyer.budgetMax)})`}
                  </option>
                ))}
              </select>
              
              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowBuyerModal(false)}
                  style={styles.cancelButton}
                >
                  Отказ
                </button>
                <button
                  onClick={handleAssignBuyer}
                  disabled={!selectedBuyer}
                  style={{
                    ...styles.submitButton,
                    backgroundColor: selectedBuyer ? '#10b981' : '#d1d5db',
                    cursor: selectedBuyer ? 'pointer' : 'not-allowed'
                  }}
                >
                  {assignmentType === 'tenant' ? 'Отдай под наем' : 'Продай'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handler */}
      {showActions && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5
          }}
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

// Property Modal Component (keeping existing one)
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
        description: ''
      });
    }
  }, [property, isEdit, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title?.trim() || !formData.address?.trim() || !formData.area || !formData.rooms) {
      alert('Моля попълнете всички задължителни полета!');
      return;
    }

    if (formData.propertyType === 'sale' && !formData.priceEur) {
      alert('Моля въведете цена за продажба!');
      return;
    }

    if ((formData.propertyType === 'rent' || formData.propertyType === 'managed') && !formData.monthlyRentEur) {
      alert('Моля въведете месечен наем!');
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
      alert('Грешка при запазване: ' + (error.message || 'Неочаквана грешка'));
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

            <div style={styles.modalActions}>
              <button 
                type="button" 
                onClick={onClose} 
                style={styles.cancelButton}
              >
                Отказ
              </button>
              <button 
                type="submit" 
                style={styles.submitButton}
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

// Main App Component
const App = () => {
  // Page and UI state
  const [currentPage, setCurrentPage] = useState('properties');
  const [currency, setCurrency] = useState('EUR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [propertyFilter, setPropertyFilter] = useState('all');

  // Data state
  const [properties, setProperties] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Modal states
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadProperties(), loadBuyers(), loadSellers(), loadTasks()]);
    } catch (error) {
      setError('Грешка при зареждане на данните');
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await propertiesAPI.getAll();
      setProperties(Array.isArray(response) ? response : (response.properties || []));
    } catch (error) {
      console.error('Error loading properties:', error);
      throw error;
    }
  };

  const loadBuyers = async () => {
    try {
      const response = await buyersAPI.getAll();
      setBuyers(Array.isArray(response) ? response : (response.buyers || []));
    } catch (error) {
      console.error('Error loading buyers:', error);
    }
  };

  const loadSellers = async () => {
    try {
      const response = await sellersAPI.getAll();
      setSellers(Array.isArray(response) ? response : (response.sellers || []));
    } catch (error) {
      console.error('Error loading sellers:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(Array.isArray(response) ? response : (response.tasks || []));
    } catch (error) {
      console.error('Error loading tasks:', error);
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
      const updatedProperty = await propertiesAPI.update(editingProperty.id, propertyData);
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? updatedProperty : p));
      setShowPropertyModal(false);
      setEditingProperty(null);
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
      setError(null);
    } catch (error) {
      setError('Неуспешно изтриване на имот: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error deleting property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveProperty = async (id) => {
    try {
      setLoading(true);
      const updatedProperty = await propertiesAPI.archive(id);
      setProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));
      setError(null);
    } catch (error) {
      setError('Неуспешно архивиране на имот: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error archiving property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchiveProperty = async (id) => {
    try {
      setLoading(true);
      const updatedProperty = await propertiesAPI.unarchive(id);
      setProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));
      setError(null);
    } catch (error) {
      setError('Неуспешно възстановяване на имот: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error unarchiving property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSeller = async (propertyId, sellerId) => {
    try {
      setLoading(true);
      const updatedProperty = await propertiesAPI.assignSeller(propertyId, sellerId);
      setProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
      setError(null);
    } catch (error) {
      setError('Неуспешно присвояване на продавач: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error assigning seller:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBuyer = async (propertyId, buyerId, type) => {
    try {
      setLoading(true);
      const updatedProperty = await propertiesAPI.assignBuyer(propertyId, buyerId, type);
      setProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
      setError(null);
    } catch (error) {
      setError('Неуспешно присвояване на купувач: ' + (error.message || 'Неочаквана грешка'));
      console.error('Error assigning buyer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewingIncrement = async (propertyId) => {
    try {
      const updatedProperty = await propertiesAPI.incrementViewings(propertyId);
      setProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
    } catch (error) {
      console.error('Error incrementing viewings:', error);
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

      {/* Error Message */}
      {error && (
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '1rem'}}>
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
                style={styles.addButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
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
                <EnhancedPropertyCard
                  key={property.id}
                  property={property}
                  currency={currency}
                  formatPrice={formatPrice}
                  onEdit={openEditPropertyModal}
                  onDelete={handleDeleteProperty}
                  onArchive={handleArchiveProperty}
                  onUnarchive={handleUnarchiveProperty}
                  onAssignSeller={handleAssignSeller}
                  onAssignBuyer={handleAssignBuyer}
                  onViewingIncrement={handleViewingIncrement}
                  buyers={buyers}
                  sellers={sellers}
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

        {/* Other sections placeholders */}
        {currentPage === 'buyers' && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <div style={styles.emptyTitle}>Купувачи</div>
            <div>Функционалност за купувачи ще бъде добавена скоро...</div>
          </div>
        )}

        {currentPage === 'sellers' && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏪</div>
            <div style={styles.emptyTitle}>Продавачи ({sellers.length})</div>
            <div>Функционалност за продавачи ще бъде добавена скоро...</div>
          </div>
        )}

        {currentPage === 'tasks' && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📅</div>
            <div style={styles.emptyTitle}>Задачи ({tasks.length})</div>
            <div>Функционалност за задачи ще бъде добавена скоро...</div>
          </div>
        )}
      </main>

      {/* Property Modal */}
      <PropertyModal
        show={showPropertyModal}
        onClose={closePropertyModal}
        onSave={editingProperty ? handleEditProperty : handleAddProperty}
        property={editingProperty}
        isEdit={!!editingProperty}
      />
    </div>
  );
};

export default App;