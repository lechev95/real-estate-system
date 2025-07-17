// Enhanced Property Card Component with full functionality
import React, { useState } from 'react';

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
  const [assignmentType, setAssignmentType] = useState('buyer'); // 'buyer' or 'tenant'

  // Card styles
  const cardStyles = {
    card: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      position: 'relative',
      opacity: property.status === 'archived' ? 0.7 : 1
    },
    cardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
    },
    cardImage: {
      height: '200px',
      background: property.status === 'archived' 
        ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    statusBadge: {
      position: 'absolute',
      bottom: '1rem',
      left: '1rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: 'white',
      backgroundColor: getStatusColor(property.status)
    },
    archiveBadge: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: 'white',
      backgroundColor: '#6b7280'
    },
    cardContent: {
      padding: '1.5rem'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    actionMenuButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '50%',
      color: '#6b7280',
      transition: 'background-color 0.2s'
    },
    actionsMenu: {
      position: 'absolute',
      top: '2.5rem',
      right: '0',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 10,
      minWidth: '200px'
    },
    actionItem: {
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      borderBottom: '1px solid #f3f4f6',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    cardAddress: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
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
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.25rem',
      fontSize: '0.875rem',
      color: '#6b7280'
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
    },
    tenantInfo: {
      padding: '0.75rem',
      backgroundColor: '#eff6ff',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      fontSize: '0.875rem',
      color: '#1e40af'
    },
    cardActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '1rem',
      borderTop: '1px solid #f3f4f6'
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
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%'
    }
  };

  function getStatusColor(status) {
    switch(status?.toLowerCase()) {
      case 'available': return '#10b981';
      case 'rented': return '#f59e0b';
      case 'managed': return '#3b82f6';
      case 'sold': return '#8b5cf6';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  }

  function getStatusLabel(status) {
    switch(status?.toLowerCase()) {
      case 'available': return '✅ Свободен';
      case 'rented': return '🔶 Отдаден';
      case 'managed': return '🔷 Управляван';
      case 'sold': return '✅ Продаден';
      case 'archived': return '📦 Архивиран';
      default: return '❓ Неопределен';
    }
  }

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

  const handleViewingClick = async () => {
    if (onViewingIncrement) {
      await onViewingIncrement(property.id);
    }
  };

  return (
    <div 
      style={cardStyles.card}
      onMouseOver={(e) => {
        Object.assign(e.currentTarget.style, cardStyles.cardHover);
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      {/* Property Image */}
      <div style={cardStyles.cardImage}>
        <div style={{fontSize: '4rem', color: 'white', opacity: 0.7}}>🏠</div>
        
        <div style={cardStyles.statusBadge}>
          {getStatusLabel(property.status)}
        </div>

        {property.status === 'archived' && (
          <div style={cardStyles.archiveBadge}>
            📦 Архивиран
          </div>
        )}
      </div>

      {/* Property Content */}
      <div style={cardStyles.cardContent}>
        {/* Title with Action Menu */}
        <div style={cardStyles.cardTitle}>
          <span>{property.title}</span>
          <div style={{position: 'relative'}}>
            <button
              style={cardStyles.actionMenuButton}
              onClick={() => setShowActions(!showActions)}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ⋮
            </button>
            
            {showActions && (
              <div style={cardStyles.actionsMenu}>
                <div 
                  style={cardStyles.actionItem}
                  onClick={() => { onEdit(property); setShowActions(false); }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span>✏️</span> Редактирай
                </div>
                
                <div 
                  style={cardStyles.actionItem}
                  onClick={handleViewingClick}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <span>👁️</span> Отбележи преглед
                </div>
                
                {!property.seller && (
                  <div 
                    style={cardStyles.actionItem}
                    onClick={() => { setShowSellerModal(true); setShowActions(false); }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <span>🏪</span> Добави продавач
                  </div>
                )}
                
                {(property.status === 'available' || property.status === 'rented') && (
                  <div 
                    style={cardStyles.actionItem}
                    onClick={() => { setShowBuyerModal(true); setShowActions(false); }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <span>👤</span> {property.propertyType === 'sale' ? 'Добави купувач' : 'Добави наемател'}
                  </div>
                )}
                
                {property.status !== 'archived' ? (
                  <div 
                    style={cardStyles.actionItem}
                    onClick={() => { onArchive(property.id); setShowActions(false); }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <span>📦</span> Архивирай
                  </div>
                ) : (
                  <div 
                    style={cardStyles.actionItem}
                    onClick={() => { onUnarchive(property.id); setShowActions(false); }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <span>📤</span> Върни от архив
                  </div>
                )}
                
                <div 
                  style={{...cardStyles.actionItem, color: '#dc2626', borderBottom: 'none'}}
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

        <div style={cardStyles.cardAddress}>
          📍 {property.address}
          {property.city && property.city !== property.address && `, ${property.city}`}
        </div>
        
        {/* Price and Details */}
        <div style={cardStyles.priceContainer}>
          <div>
            <div style={cardStyles.price}>
              {property.propertyType === 'sale' ? 
                formatPrice(property.priceEur) :
                `${formatPrice(property.monthlyRentEur)}/месец`
              }
            </div>
            {property.propertyType === 'sale' && currency === 'EUR' && property.priceEur && (
              <div style={cardStyles.priceSecondary}>
                ≈ {Math.round(parseFloat(property.priceEur) * 1.95583).toLocaleString('bg-BG')} лв.
              </div>
            )}
          </div>
          
          <div style={cardStyles.details}>
            <div>📐 {property.area} кв.м</div>
            <div>🚪 {property.rooms} стаи</div>
            {property.floor && <div>🏗️ {property.floor} етаж</div>}
            {property.yearBuilt && <div>📅 {property.yearBuilt} г.</div>}
          </div>
        </div>

        {/* People Information */}
        {(property.seller || property.assignedAgent || property.tenants?.length > 0) && (
          <div style={cardStyles.peopleSection}>
            {property.seller && (
              <div style={cardStyles.personItem}>
                <span>🏪 Продавач:</span>
                <strong>{property.seller.firstName} {property.seller.lastName}</strong>
              </div>
            )}
            
            {property.assignedAgent && (
              <div style={cardStyles.personItem}>
                <span>👨‍💼 Агент:</span>
                <strong>{property.assignedAgent.firstName} {property.assignedAgent.lastName}</strong>
              </div>
            )}
            
            {property.tenants?.length > 0 && (
              <div style={cardStyles.personItem}>
                <span>👤 Наемател:</span>
                <strong>{property.tenants[0].firstName} {property.tenants[0].lastName}</strong>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div style={cardStyles.cardActions}>
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

      {/* Seller Assignment Modal */}
      {showSellerModal && (
        <div style={cardStyles.modal}>
          <div style={cardStyles.modalContent}>
            <h3 style={{marginTop: 0}}>🏪 Добави продавач към имот</h3>
            <p>Избери продавач за "{property.title}":</p>
            
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}
            >
              <option value="">Изберете продавач...</option>
              {sellers.map(seller => (
                <option key={seller.id} value={seller.id}>
                  {seller.firstName} {seller.lastName} - {seller.phone}
                </option>
              ))}
            </select>
            
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button
                onClick={() => setShowSellerModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Отказ
              </button>
              <button
                onClick={handleAssignSeller}
                disabled={!selectedSeller}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: selectedSeller ? '#3b82f6' : '#d1d5db',
                  color: 'white',
                  cursor: selectedSeller ? 'pointer' : 'not-allowed'
                }}
              >
                Присвой
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer/Tenant Assignment Modal */}
      {showBuyerModal && (
        <div style={cardStyles.modal}>
          <div style={cardStyles.modalContent}>
            <h3 style={{marginTop: 0}}>
              👤 {property.propertyType === 'sale' ? 'Продай имот' : 'Отдай под наем'}
            </h3>
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
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}
            >
              <option value="">Изберете {assignmentType === 'tenant' ? 'наемател' : 'купувач'}...</option>
              {buyers.filter(buyer => buyer.status === 'active').map(buyer => (
                <option key={buyer.id} value={buyer.id}>
                  {buyer.firstName} {buyer.lastName} - {buyer.phone}
                  {buyer.budgetMax && ` (до ${formatPrice(buyer.budgetMax)})`}
                </option>
              ))}
            </select>
            
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button
                onClick={() => setShowBuyerModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Отказ
              </button>
              <button
                onClick={handleAssignBuyer}
                disabled={!selectedBuyer}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: selectedBuyer ? '#10b981' : '#d1d5db',
                  color: 'white',
                  cursor: selectedBuyer ? 'pointer' : 'not-allowed'
                }}
              >
                {assignmentType === 'tenant' ? 'Отдай под наем' : 'Продай'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPropertyCard;