// frontend/src/components/Archive.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Archive = () => {
  const { getProperties, getBuyers, getSellers, deleteProperty, deleteBuyer, deleteSeller, restoreProperty, restoreBuyer, restoreSeller } = useAuth();
  const [archiveType, setArchiveType] = useState('properties');
  const [archiveData, setArchiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArchiveData();
  }, [archiveType]);

  const loadArchiveData = async () => {
    setLoading(true);
    setError('');
    
    try {
      let data = [];
      
      if (archiveType === 'properties') {
        const response = await getProperties();
        data = (response.properties || []).filter(item => item.isArchived);
      } else if (archiveType === 'buyers') {
        const response = await getBuyers();
        data = (response.buyers || []).filter(item => item.isArchived);
      } else if (archiveType === 'sellers') {
        const response = await getSellers();
        data = (response.sellers || []).filter(item => item.isArchived);
      }
      
      setArchiveData(data);
    } catch (error) {
      setError(`Грешка при зареждане на архивираните ${getTypeLabel()}`);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = () => {
    const labels = {
      properties: 'имоти',
      buyers: 'купувачи',
      sellers: 'продавачи'
    };
    return labels[archiveType] || 'записи';
  };

  const getTypeIcon = () => {
    const icons = {
      properties: '🏠',
      buyers: '👤',
      sellers: '👥'
    };
    return icons[archiveType] || '📦';
  };

  const handlePermanentDelete = async (id) => {
    const typeLabel = getTypeLabel().slice(0, -1); // Remove 's' at the end
    if (window.confirm(`Сигурни ли сте, че искате да изтриете окончателно този ${typeLabel}? Това действие не може да бъде отменено!`)) {
      try {
        if (archiveType === 'properties') {
          await deleteProperty(id);
        } else if (archiveType === 'buyers') {
          await deleteBuyer(id);
        } else if (archiveType === 'sellers') {
          await deleteSeller(id);
        }
        
        loadArchiveData();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      if (archiveType === 'properties') {
        await restoreProperty(id);
      } else if (archiveType === 'buyers') {
        await restoreBuyer(id);
      } else if (archiveType === 'sellers') {
        await restoreSeller(id);
      }
      
      loadArchiveData();
    } catch (error) {
      setError(error.message);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Не е посочена';
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderPropertyCard = (property) => (
    <div key={property.id} className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden opacity-75">
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-2xl">🏠</span>
          </div>
          <div className="text-white">
            <h3 className="text-lg font-bold">{property.title}</h3>
            <p className="text-gray-200 text-sm">{property.location}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <div className="text-sm text-gray-600 font-medium mb-1">Цена</div>
          <div className="text-xl font-bold text-gray-700">{formatPrice(property.price)}</div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleRestore(property.id)}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            ↩️ Възстанови
          </button>
          <button
            onClick={() => handlePermanentDelete(property.id)}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            🗑️ Изтрий
          </button>
        </div>
      </div>
    </div>
  );

  const renderBuyerCard = (buyer) => (
    <div key={buyer.id} className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden opacity-75">
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-2xl">👤</span>
          </div>
          <div className="text-white">
            <h3 className="text-lg font-bold">{buyer.firstName} {buyer.lastName}</h3>
            <p className="text-gray-200 text-sm">Купувач</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-2 mb-4">
          {buyer.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-blue-500">📧</span>
              <span>{buyer.email}</span>
            </div>
          )}
          {buyer.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-green-500">📞</span>
              <span>{buyer.phone}</span>
            </div>
          )}
        </div>

        {buyer.budget && buyer.budget > 0 && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-600 font-medium mb-1">Бюджет</div>
            <div className="text-xl font-bold text-gray-700">{formatPrice(buyer.budget)}</div>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => handleRestore(buyer.id)}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            ↩️ Възстанови
          </button>
          <button
            onClick={() => handlePermanentDelete(buyer.id)}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            🗑️ Изтрий
          </button>
        </div>
      </div>
    </div>
  );

  const renderSellerCard = (seller) => (
    <div key={seller.id} className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden opacity-75">
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-white">
            <h3 className="text-lg font-bold">{seller.firstName} {seller.lastName}</h3>
            <p className="text-gray-200 text-sm">Продавач</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-2 mb-4">
          {seller.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-blue-500">📧</span>
              <span>{seller.email}</span>
            </div>
          )}
          {seller.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-green-500">📞</span>
              <span>{seller.phone}</span>
            </div>
          )}
        </div>

        {seller.propertyAddress && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-600 font-medium mb-1">Адрес на имота</div>
            <div className="text-sm font-bold text-gray-700">{seller.propertyAddress}</div>
          </div>
        )}

        {seller.askingPrice && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-600 font-medium mb-1">Искана цена</div>
            <div className="text-xl font-bold text-gray-700">{formatPrice(seller.askingPrice)}</div>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => handleRestore(seller.id)}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            ↩️ Възстанови
          </button>
          <button
            onClick={() => handlePermanentDelete(seller.id)}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            🗑️ Изтрий
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="text-lg text-gray-600">Зареждане на архив...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📦 Архив</h2>
          <p className="text-gray-600">Управление на архивирани записи</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Общо архивирани:</span>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-bold">
            {archiveData.length}
          </span>
        </div>
      </div>

      {/* Type Selector */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: 'properties', label: '🏠 Имоти' },
          { key: 'buyers', label: '👤 Купувачи' },
          { key: 'sellers', label: '👥 Продавачи' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setArchiveType(key)}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors duration-200 ${
              archiveType === key
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Грешка:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Archive Grid */}
      {archiveData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {archiveType === 'properties' && archiveData.map(renderPropertyCard)}
          {archiveType === 'buyers' && archiveData.map(renderBuyerCard)}
          {archiveType === 'sellers' && archiveData.map(renderSellerCard)}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-8xl mb-6 animate-bounce">📦</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Няма архивирани {getTypeLabel()}
          </h3>
          <p className="text-gray-600 text-lg">
            {getTypeIcon()} Всички {getTypeLabel()} са активни
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-500 text-2xl">💡</span>
          <div>
            <h4 className="text-blue-800 font-semibold mb-2">Как работи архивът?</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Архивираните записи не се показват в основните табове</li>
              <li>• Можете да възстановите запис с бутона "Възстанови"</li>
              <li>• Окончателното изтриване премахва записа завинаги</li>
              <li>• Използвайте архива за да организирате завършени сделки</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;