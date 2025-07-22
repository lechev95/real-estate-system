// frontend/src/components/Properties.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Properties = () => {
  const { getProperties, createProperty, updateProperty, deleteProperty, archiveProperty } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'apartment',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    status: 'available',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await getProperties();
      setProperties((data.properties || []).filter(p => !p.isArchived));
    } catch (error) {
      setError('Грешка при зареждане на имотите');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.price || !formData.location) {
      setError('Моля попълнете всички задължителни полета');
      return;
    }

    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.area) || 0
      };

      if (editingProperty) {
        await updateProperty(editingProperty.id, propertyData);
      } else {
        await createProperty(propertyData);
      }

      setShowModal(false);
      setEditingProperty(null);
      resetForm();
      loadProperties();
    } catch (error) {
      setError(error.message || 'Грешка при запазване');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title || '',
      type: property.type || 'apartment',
      price: property.price || '',
      location: property.location || '',
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
      area: property.area || '',
      status: property.status || 'available',
      description: property.description || ''
    });
    setShowModal(true);
  };

  const handleArchive = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да архивирате този имот?')) {
      try {
        await archiveProperty(id);
        loadProperties();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този имот?')) {
      try {
        await deleteProperty(id);
        loadProperties();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'apartment',
      price: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      status: 'available',
      description: ''
    });
    setError('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTypeIcon = (type) => {
    const icons = {
      apartment: '🏢',
      house: '🏠',
      office: '🏢',
      commercial: '🏪',
      land: '🌍'
    };
    return icons[type] || '🏠';
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      reserved: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || colors.available;
  };

  const getStatusText = (status) => {
    const texts = {
      available: '🟢 Наличен',
      sold: '⚫ Продаден',
      pending: '🟡 В процес',
      reserved: '🔵 Резервиран'
    };
    return texts[status] || 'Наличен';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">Зареждане на имоти...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏠 Имоти</h2>
          <p className="text-gray-600">Управление на портфолиото с недвижими имоти</p>
        </div>
        <button
          onClick={() => { setEditingProperty(null); resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <span>+</span>
          Добавяне на имот
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Грешка:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{getTypeIcon(property.type)}</span>
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold truncate">{property.title}</h3>
                    <p className="text-blue-100 text-sm font-medium">{property.location}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(property.status)}`}>
                  {getStatusText(property.status)}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Price */}
              <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="text-sm text-green-600 font-medium mb-1">Цена</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatPrice(property.price)}
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {property.bedrooms > 0 && (
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-blue-600 font-bold">{property.bedrooms}</div>
                    <div className="text-xs text-blue-500">🛏️ спални</div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <div className="text-purple-600 font-bold">{property.bathrooms}</div>
                    <div className="text-xs text-purple-500">🚿 бани</div>
                  </div>
                )}
                {property.area > 0 && (
                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <div className="text-orange-600 font-bold">{property.area}</div>
                    <div className="text-xs text-orange-500">📐 м²</div>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 line-clamp-2">{property.description}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(property)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  ✏️ Редактиране
                </button>
                <button
                  onClick={() => handleArchive(property.id)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  📦 Архив
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-8xl mb-6 animate-bounce">🏠</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Няма добавени имоти</h3>
          <p className="text-gray-600 mb-8 text-lg">Започнете като добавите първия си имот</p>
          <button
            onClick={() => { setEditingProperty(null); resetForm(); setShowModal(true); }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            🏠 Добавяне на първи имот
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">
                {editingProperty ? '✏️ Редактиране на имот' : '🏠 Добавяне на нов имот'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="🏠 Заглавие на имота *"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="apartment">🏢 Апартамент</option>
                  <option value="house">🏠 Къща</option>
                  <option value="office">🏢 Офис</option>
                  <option value="commercial">🏪 Търговски обект</option>
                  <option value="land">🌍 Земя</option>
                </select>

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">🟢 Наличен</option>
                  <option value="pending">🟡 В процес</option>
                  <option value="reserved">🔵 Резервиран</option>
                  <option value="sold">⚫ Продаден</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="💰 Цена (лв.) *"
                  required
                />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="📍 Локация *"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="🛏️ Спални"
                  min="0"
                />
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="🚿 Бани"
                  min="0"
                />
                <input
                  type="number"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="📐 Площ (м²)"
                  min="0"
                />
              </div>

              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="📝 Описание на имота"
              />

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold"
                >
                  ❌ Отказ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold"
                >
                  {editingProperty ? '💾 Запазване' : '➕ Добавяне'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;