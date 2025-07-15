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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {isEdit ? 'Редактирай имот' : 'Добави нов имот'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заглавие *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип имот *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sale">Продажба</option>
                  <option value="rent">Наем</option>
                  <option value="managed">Управляван</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apartment">Апартамент</option>
                  <option value="house">Къща</option>
                  <option value="office">Офис</option>
                  <option value="commercial">Търговски</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Град *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Район
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Квадратура (кв.м) *
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Брой стаи *
                </label>
                <input
                  type="number"
                  value={formData.rooms}
                  onChange={(e) => setFormData({...formData, rooms: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Етаж
                </label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Общо етажи
                </label>
                <input
                  type="number"
                  value={formData.totalFloors}
                  onChange={(e) => setFormData({...formData, totalFloors: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Година на строеж
                </label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Изложение
                </label>
                <select
                  value={formData.exposure}
                  onChange={(e) => setFormData({...formData, exposure: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Отопление
                </label>
                <select
                  value={formData.heating}
                  onChange={(e) => setFormData({...formData, heating: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена (EUR) *
                  </label>
                  <input
                    type="number"
                    value={formData.priceEur}
                    onChange={(e) => setFormData({...formData, priceEur: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={formData.propertyType === 'sale'}
                    min="0"
                  />
                </div>
              )}

              {(formData.propertyType === 'rent' || formData.propertyType === 'managed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Месечен наем (EUR) *
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyRentEur}
                    onChange={(e) => setFormData({...formData, monthlyRentEur: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={formData.propertyType !== 'sale'}
                    min="0"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Адрес *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Отказ
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {isEdit ? 'Редактирай купувач' : 'Добави нов купувач'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Име *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Минимален бюджет (EUR)
                </label>
                <input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({...formData, budgetMin: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимален бюджет (EUR)
                </label>
                <input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({...formData, budgetMax: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Предпочитан тип имот
                </label>
                <select
                  value={formData.preferredPropertyType}
                  onChange={(e) => setFormData({...formData, preferredPropertyType: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Всички</option>
                  <option value="sale">Продажба</option>
                  <option value="rent">Наем</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Предпочитан брой стаи
                </label>
                <input
                  type="number"
                  value={formData.preferredRooms}
                  onChange={(e) => setFormData({...formData, preferredRooms: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="potential">Потенциален</option>
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                  <option value="converted">Клиент</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Предпочитани райони (разделени със запетая)
                </label>
                <input
                  type="text"
                  value={formData.preferredAreas}
                  onChange={(e) => setFormData({...formData, preferredAreas: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Лозенец, Център, Витоша"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Бележки
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Отказ
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🏠 Real Estate CRM</h1>
            </div>

            <div className="flex items-center space-x-4">
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
              { id: 'properties', label: '🏠 Имоти' },
              { id: 'buyers', label: '👥 Купувачи' },
              { id: 'sellers', label: '🏪 Продавачи' },
              { id: 'tasks', label: '📅 Задачи' }
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
            <button 
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Затвори</span>
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
                onClick={() => {
                  setEditingProperty(null);
                  setShowPropertyModal(true);
                }}
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
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <span className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-semibold">
                        ⭐ 4/5
                      </span>
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
                        {property.propertyType === 'sale' && currency === 'EUR' && property.priceEur && (
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
                        👁️ {property.viewings || 0} прегледа
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditPropertyModal(property)}
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

            {getFilteredProperties().length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Няма имоти за показване</div>
                <p className="text-gray-400 mt-2">Добавете първия си имот, за да започнете</p>
              </div>
            )}
          </div>
        )}

        {/* Buyers Section */}
        {currentPage === 'buyers' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Купувачи</h2>
              <button
                onClick={() => {
                  setEditingBuyer(null);
                  setShowBuyerModal(true);
                }}
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
                  {buyer.email && <p className="text-gray-600 mb-2">✉️ {buyer.email}</p>}
                  {(buyer.budgetMin || buyer.budgetMax) && (
                    <p className="text-gray-600 mb-4">
                      💰 Бюджет: {buyer.budgetMin ? formatPrice(buyer.budgetMin) : '0'} - {buyer.budgetMax ? formatPrice(buyer.budgetMax) : '∞'}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      buyer.status === 'active' ? 'bg-green-100 text-green-800' :
                      buyer.status === 'potential' ? 'bg-yellow-100 text-yellow-800' :
                      buyer.status === 'converted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {buyer.status === 'active' ? 'Активен' :
                       buyer.status === 'potential' ? 'Потенциален' :
                       buyer.status === 'converted' ? 'Клиент' :
                       'Неактивен'}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditBuyerModal(buyer)}
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

            {buyers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Няма купувачи за показване</div>
                <p className="text-gray-400 mt-2">Добавете първия си купувач, за да започнете</p>
              </div>
            )}
          </div>
        )}

        {/* Other sections placeholders */}
        {currentPage === 'sellers' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Продавачи</h2>
            <p className="text-gray-500">Тази секция ще бъде добавена скоро...</p>
          </div>
        )}

        {currentPage === 'tasks' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Задачи</h2>
            <p className="text-gray-500">Тази секция ще бъде добавена скоро...</p>
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