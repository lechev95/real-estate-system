import React, { useState, useEffect } from 'react';

// API Configuration
const API_BASE_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';

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

// Beautiful Property Modal Component
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {isEdit ? '✏️ Редактирай имот' : '🏠 Добави нов имот'}
            </h2>
            <button 
              onClick={onClose} 
              className="text-white hover:text-gray-200 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Заглавие *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="напр. Тристаен апартамент в Лозенец"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ Тип имот *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="sale">💰 Продажба</option>
                  <option value="rent">🏠 Наем</option>
                  <option value="managed">📋 Управляван</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏢 Категория *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="apartment">🏠 Апартамент</option>
                  <option value="house">🏡 Къща</option>
                  <option value="office">🏢 Офис</option>
                  <option value="commercial">🏪 Търговски</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🌍 Град *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📍 Район
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="напр. Лозенец, Център"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📐 Квадратура (кв.м) *
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                  min="1"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🚪 Брой стаи *
                </label>
                <input
                  type="number"
                  value={formData.rooms}
                  onChange={(e) => setFormData({...formData, rooms: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                  min="1"
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏗️ Етаж
                </label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏢 Общо етажи
                </label>
                <input
                  type="number"
                  value={formData.totalFloors}
                  onChange={(e) => setFormData({...formData, totalFloors: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="6"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Година на строеж
                </label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="2010"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🧭 Изложение
                </label>
                <select
                  value={formData.exposure}
                  onChange={(e) => setFormData({...formData, exposure: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Изберете</option>
                  <option value="Север">🧊 Север</option>
                  <option value="Юг">☀️ Юг</option>
                  <option value="Изток">🌅 Изток</option>
                  <option value="Запад">🌇 Запад</option>
                  <option value="Югоизток">🌤️ Югоизток</option>
                  <option value="Югозапад">🌅 Югозапад</option>
                  <option value="Североизток">❄️ Североизток</option>
                  <option value="Северозапад">🌨️ Северозапад</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔥 Отопление
                </label>
                <select
                  value={formData.heating}
                  onChange={(e) => setFormData({...formData, heating: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Изберете</option>
                  <option value="Централно парно">🏭 Централно парно</option>
                  <option value="Газово">🔥 Газово</option>
                  <option value="Електрическо">⚡ Електрическо</option>
                  <option value="Климатици">❄️ Климатици</option>
                  <option value="Печка">🪵 Печка</option>
                  <option value="Няма">❌ Няма</option>
                </select>
              </div>

              {formData.propertyType === 'sale' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Цена (EUR) *
                  </label>
                  <input
                    type="number"
                    value={formData.priceEur}
                    onChange={(e) => setFormData({...formData, priceEur: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required={formData.propertyType === 'sale'}
                    min="0"
                    placeholder="165000"
                  />
                </div>
              )}

              {(formData.propertyType === 'rent' || formData.propertyType === 'managed') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏠 Месечен наем (EUR) *
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyRentEur}
                    onChange={(e) => setFormData({...formData, monthlyRentEur: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required={formData.propertyType !== 'sale'}
                    min="0"
                    placeholder="600"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🗺️ Адрес *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
                placeholder="ул. Фритьоф Нансен 25"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                rows="3"
                placeholder="Светъл тристаен апартамент с две тераси и паркомясто..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                ❌ Отказ
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
              >
                {isEdit ? '💾 Обнови' : '✨ Създай'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Beautiful Buyer Modal Component
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {isEdit ? '✏️ Редактирай купувач' : '👤 Добави нов купувач'}
            </h2>
            <button 
              onClick={onClose} 
              className="text-white hover:text-gray-200 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Име *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="Мария"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👥 Фамилия *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="Стоянова"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📞 Телефон *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="+359 889 444 555"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ✉️ Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="maria@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💰 Минимален бюджет (EUR)
                </label>
                <input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({...formData, budgetMin: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  min="0"
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💎 Максимален бюджет (EUR)
                </label>
                <input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({...formData, budgetMax: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  min="0"
                  placeholder="200000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏠 Предпочитан тип имот
                </label>
                <select
                  value={formData.preferredPropertyType}
                  onChange={(e) => setFormData({...formData, preferredPropertyType: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="any">🎯 Всички</option>
                  <option value="sale">💰 Продажба</option>
                  <option value="rent">🏠 Наем</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🚪 Предпочитан брой стаи
                </label>
                <input
                  type="number"
                  value={formData.preferredRooms}
                  onChange={(e) => setFormData({...formData, preferredRooms: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  min="1"
                  placeholder="3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🎯 Статус
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'potential', label: '🔮 Потенциален', color: 'yellow' },
                    { value: 'active', label: '🔥 Активен', color: 'green' },
                    { value: 'inactive', label: '😴 Неактивен', color: 'gray' },
                    { value: 'converted', label: '🎉 Клиент', color: 'blue' }
                  ].map((status) => (
                    <label key={status.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={formData.status === status.value}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📍 Предпочитани райони (разделени със запетая)
                </label>
                <input
                  type="text"
                  value={formData.preferredAreas}
                  onChange={(e) => setFormData({...formData, preferredAreas: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="Лозенец, Център, Витоша"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Бележки
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  rows="3"
                  placeholder="Допълнителна информация за купувача..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                ❌ Отказ
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
              >
                {isEdit ? '💾 Обнови' : '✨ Създай'}
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

  const openEditPropertyModal = (property) => {
    setEditingProperty(property);
    setShowPropertyModal(true);
  };

  const openEditBuyerModal = (buyer) => {
    setEditingBuyer(buyer);
    setShowBuyerModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Beautiful Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg mr-3">
                🏠
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Real Estate CRM
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                >
                  <option value="EUR" className="text-gray-800">💶 EUR (1.00)</option>
                  <option value="BGN" className="text-gray-800">💴 BGN ({EUR_TO_BGN_RATE})</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  👩‍💼
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Мария Иванова</div>
                  <div className="text-green-100">Агент</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Beautiful Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
              { id: 'properties', label: 'Имоти', icon: '🏠', color: 'blue' },
              { id: 'buyers', label: 'Купувачи', icon: '👥', color: 'green' },
              { id: 'sellers', label: 'Продавачи', icon: '🏪', color: 'purple' },
              { id: 'tasks', label: 'Задачи', icon: '📅', color: 'orange' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id)}
                className={`flex items-center space-x-2 py-4 px-6 font-medium text-sm transition-all duration-200 border-b-3 ${
                  currentPage === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button 
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-700 font-medium">Зареждане...</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Properties Section */}
        {currentPage === 'properties' && (
          <div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🏠 Имоти</h2>
                <p className="text-gray-600">Управлявайте вашите имоти и следете статистиката</p>
              </div>
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setShowPropertyModal(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg flex items-center space-x-2"
              >
                <span className="text-lg">✨</span>
                <span>Добави имот</span>
              </button>
            </div>

            {/* Beautiful Filter Buttons */}
            <div className="mb-8 flex flex-wrap gap-3">
              {[
                { key: 'all', label: `Всички (${properties.length})`, icon: '🎯', color: 'gray' },
                { key: 'sale', label: `Продажба (${properties.filter(p => p.propertyType === 'sale').length})`, icon: '💰', color: 'green' },
                { key: 'rent', label: `Наем (${properties.filter(p => p.propertyType === 'rent').length})`, icon: '🏠', color: 'blue' },
                { key: 'managed', label: `Управлявани (${properties.filter(p => p.propertyType === 'managed').length})`, icon: '📋', color: 'purple' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setPropertyFilter(filter.key)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    propertyFilter === filter.key
                      ? `bg-gradient-to-r from-${filter.color}-500 to-${filter.color}-600 text-white shadow-lg transform scale-105`
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>

            {/* Beautiful Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getFilteredProperties().map((property) => (
                <div key={property.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                  <div className="h-56 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <span>⭐</span>
                        <span>4.5/5</span>
                      </span>
                      <button className="text-white hover:text-red-300 transition-colors text-xl">
                        ❤️
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        property.status === 'available' ? 'bg-green-500' :
                        property.status === 'rented' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}>
                        {property.status === 'available' ? '🟢 Свободен' :
                         property.status === 'rented' ? '🟡 Отдаден' :
                         '🔵 Управляван'}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-6xl opacity-30">
                        🏠
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{property.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <span className="mr-2">📍</span>
                      <span>{property.address}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          {property.propertyType === 'sale' ? 
                            formatPrice(property.priceEur) :
                            `${formatPrice(property.monthlyRentEur)}/месец`
                          }
                        </div>
                        {property.propertyType === 'sale' && currency === 'EUR' && property.priceEur && (
                          <div className="text-sm text-gray-500">
                            ≈ {Math.round(parseFloat(property.priceEur) * EUR_TO_BGN_RATE).toLocaleString()} лв.
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <span className="mr-1">📐</span>
                          <span>{property.area} кв.м</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-1">🚪</span>
                          <span>{property.rooms} стаи</span>
                        </div>
                      </div>
                    </div>

                    {property.tenants && property.tenants.length > 0 && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-800 font-medium flex items-center">
                          <span className="mr-2">👤</span>
                          <span>Наемател: {property.tenants[0].firstName} {property.tenants[0].lastName}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">👁️</span>
                        <span>{property.viewings || 0} прегледа</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditPropertyModal(property)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center space-x-1"
                        >
                          <span>✏️</span>
                          <span>Редактирай</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center space-x-1"
                        >
                          <span>🗑️</span>
                          <span>Изтрий</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {getFilteredProperties().length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏠</div>
                <div className="text-gray-500 text-xl mb-2">Няма имоти за показване</div>
                <p className="text-gray-400">Добавете първия си имот, за да започнете</p>
              </div>
            )}
          </div>
        )}

        {/* Buyers Section */}
        {currentPage === 'buyers' && (
          <div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">👥 Купувачи</h2>
                <p className="text-gray-600">Управлявайте вашите клиенти и следете статистиката</p>
              </div>
              <button
                onClick={() => {
                  setEditingBuyer(null);
                  setShowBuyerModal(true);
                }}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg flex items-center space-x-2"
              >
                <span className="text-lg">✨</span>
                <span>Добави купувач</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {buyers.map((buyer) => (
                <div key={buyer.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {buyer.firstName[0]}{buyer.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{buyer.firstName} {buyer.lastName}</h3>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        buyer.status === 'active' ? 'bg-green-100 text-green-800' :
                        buyer.status === 'potential' ? 'bg-yellow-100 text-yellow-800' :
                        buyer.status === 'converted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {buyer.status === 'active' ? '🔥 Активен' :
                         buyer.status === 'potential' ? '🔮 Потенциален' :
                         buyer.status === 'converted' ? '🎉 Клиент' :
                         '😴 Неактивен'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <span className="mr-3 text-lg">📞</span>
                      <span className="font-medium">{buyer.phone}</span>
                    </div>
                    {buyer.email && (
                      <div className="flex items-center text-gray-600">
                        <span className="mr-3 text-lg">✉️</span>
                        <span className="font-medium">{buyer.email}</span>
                      </div>
                    )}
                    {(buyer.budgetMin || buyer.budgetMax) && (
                      <div className="flex items-center text-gray-600">
                        <span className="mr-3 text-lg">💰</span>
                        <span className="font-medium">
                          Бюджет: {buyer.budgetMin ? formatPrice(buyer.budgetMin) : '0'} - {buyer.budgetMax ? formatPrice(buyer.budgetMax) : '∞'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Последен контакт: {buyer.lastContact ? new Date(buyer.lastContact).toLocaleDateString('bg-BG') : 'Няма'}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditBuyerModal(buyer)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center space-x-1"
                      >
                        <span>✏️</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBuyer(buyer.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center space-x-1"
                      >
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {buyers.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👥</div>
                <div className="text-gray-500 text-xl mb-2">Няма купувачи за показване</div>
                <p className="text-gray-400">Добавете първия си купувач, за да започнете</p>
              </div>
            )}
          </div>
        )}

        {/* Other sections placeholders */}
        {currentPage === 'sellers' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Продавачи</h2>
            <p className="text-gray-500 text-lg">Тази секция ще бъде добавена скоро...</p>
          </div>
        )}

        {currentPage === 'tasks' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Задачи</h2>
            <p className="text-gray-500 text-lg">Тази секция ще бъде добавена скоро...</p>
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