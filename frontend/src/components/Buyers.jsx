// frontend/src/components/Buyers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Buyers = () => {
  const { getBuyers, createBuyer, updateBuyer, deleteBuyer } = useAuth();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    budget: '',
    preferredLocation: '',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      const data = await getBuyers();
      setBuyers((data.buyers || []).filter(b => !b.isArchived));
    } catch (error) {
      setError('Грешка при зареждане на купувачите');
      console.error('Error loading buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setError('Моля попълнете всички задължителни полета');
      return;
    }

    try {
      const buyerData = {
        ...formData,
        budget: parseFloat(formData.budget) || 0
      };

      if (editingBuyer) {
        await updateBuyer(editingBuyer.id, buyerData);
      } else {
        await createBuyer(buyerData);
      }

      setShowModal(false);
      setEditingBuyer(null);
      resetForm();
      loadBuyers();
    } catch (error) {
      setError(error.message || 'Грешка при запазване');
    }
  };

  const handleEdit = (buyer) => {
    setEditingBuyer(buyer);
    setFormData({
      firstName: buyer.firstName || '',
      lastName: buyer.lastName || '',
      email: buyer.email || '',
      phone: buyer.phone || '',
      budget: buyer.budget || '',
      preferredLocation: buyer.preferredLocation || '',
      notes: buyer.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този купувач?')) {
      try {
        await deleteBuyer(id);
        loadBuyers();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      budget: '',
      preferredLocation: '',
      notes: ''
    });
    setError('');
  };

  const handleAddNew = () => {
    setEditingBuyer(null);
    resetForm();
    setShowModal(true);
  };

  const formatBudget = (budget) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN',
      minimumFractionDigits: 0
    }).format(budget);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-lg text-gray-600">Зареждане на купувачи...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">👤 Купувачи</h2>
          <p className="text-gray-600">Управление на потенциални купувачи</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <span>+</span>
          Добавяне на купувач
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Грешка:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Buyers Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(() => {
          const totalBudget = buyers.reduce((sum, b) => sum + (parseFloat(b.budget) || 0), 0);
          const avgBudget = buyers.length > 0 ? totalBudget / buyers.length : 0;
          const withBudget = buyers.filter(b => b.budget && b.budget > 0).length;
          const locations = [...new Set(buyers.map(b => b.preferredLocation).filter(Boolean))].length;
          
          return [
            { label: 'Общо купувачи', value: buyers.length, color: 'green', icon: '👤' },
            { label: 'С бюджет', value: withBudget, color: 'blue', icon: '💰' },
            { label: 'Локации', value: locations, color: 'purple', icon: '📍' },
            { label: 'Среден бюджет', value: avgBudget ? `${Math.round(avgBudget / 1000)}К лв.` : '0 лв.', color: 'orange', icon: '📊' }
          ].map(stat => (
            <div key={stat.label} className={`bg-white p-4 rounded-xl shadow-md border-l-4 border-${stat.color}-500`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Buyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {buyers.map((buyer) => (
          <div key={buyer.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 p-4 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="text-white">
                  <h3 className="text-lg font-bold">
                    {buyer.firstName} {buyer.lastName}
                  </h3>
                  <p className="text-green-100 text-sm font-medium">Купувач</p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Contact Info */}
              <div className="space-y-3 mb-4">
                {buyer.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-blue-500 text-lg">📧</span>
                    <span className="font-medium">{buyer.email}</span>
                  </div>
                )}
                {buyer.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-green-500 text-lg">📞</span>
                    <span className="font-medium">{buyer.phone}</span>
                  </div>
                )}
              </div>

              {/* Budget */}
              {buyer.budget && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="text-sm text-green-600 font-medium mb-1">Бюджет</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatBudget(buyer.budget)}
                  </div>
                </div>
              )}

              {/* Preferred Location */}
              {buyer.preferredLocation && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">📍</span>
                    <div>
                      <div className="text-xs text-blue-600 font-medium">Предпочитана локация</div>
                      <div className="text-sm font-bold text-blue-700">{buyer.preferredLocation}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {buyer.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 font-medium mb-1">Бележки</div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {buyer.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(buyer)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  ✏️ Редактиране
                </button>
                <button
                  onClick={() => handleDelete(buyer.id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  🗑️ Изтриване
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {buyers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-8xl mb-6 animate-bounce">👤</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Няма добавени купувачи</h3>
          <p className="text-gray-600 mb-8 text-lg">Започнете като добавите първия си купувач</p>
          <button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            👤 Добавяне на първи купувач
          </button>
        </div>
      )}

      {/* Beautiful Modal for Add/Edit Buyer */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">
                {editingBuyer ? '✏️ Редактиране на купувач' : '👤 Добавяне на нов купувач'}
              </h3>
              <p className="text-green-100 mt-1">
                {editingBuyer ? 'Обновете информацията за купувача' : 'Попълнете данните за новия купувач'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    👤 Име *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    placeholder="Иван"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    👤 Фамилия *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    placeholder="Петров"
                    required
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    placeholder="ivan@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📞 Телефон *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    placeholder="+359888123456"
                    required
                  />
                </div>
              </div>

              {/* Budget and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    💰 Бюджет (лв.)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    placeholder="400000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📍 Предпочитана локация
                  </label>
                  <input
                    type="text"
                    value={formData.preferredLocation}
                    onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    placeholder="Лозенец, София"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📝 Бележки
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="Допълнителна информация..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  ❌ Отказ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {editingBuyer ? '💾 Запазване' : '➕ Добавяне'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buyers;