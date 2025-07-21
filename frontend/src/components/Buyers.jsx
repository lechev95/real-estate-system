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
      setBuyers(data.buyers || []);
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
      setError(error.message);
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
        <div className="text-lg text-gray-600">Зареждане на купувачи...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Купувачи</h2>
          <p className="text-gray-600">Управление на потенциални купувачи</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
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

      {/* Buyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {buyers.map((buyer) => (
          <div key={buyer.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div className="text-white">
                  <h3 className="text-lg font-bold">
                    {buyer.firstName} {buyer.lastName}
                  </h3>
                  <p className="text-green-100 text-sm">Купувач</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {buyer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📧</span>
                    <span>{buyer.email}</span>
                  </div>
                )}
                {buyer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📞</span>
                    <span>{buyer.phone}</span>
                  </div>
                )}
              </div>

              {/* Budget */}
              {buyer.budget && (
                <div className="mb-4">
                  <div className="text-2xl font-bold text-green-600">
                    {formatBudget(buyer.budget)}
                  </div>
                  <div className="text-xs text-gray-500">Бюджет</div>
                </div>
              )}

              {/* Preferred Location */}
              {buyer.preferredLocation && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span>📍</span>
                    <span className="text-gray-700">{buyer.preferredLocation}</span>
                  </div>
                  <div className="text-xs text-gray-500">Предпочитана локация</div>
                </div>
              )}

              {/* Notes */}
              {buyer.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {buyer.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(buyer)}
                  className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Редактиране
                </button>
                <button
                  onClick={() => handleDelete(buyer.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Изтриване
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {buyers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Няма добавени купувачи</h3>
          <p className="text-gray-600 mb-6">Започнете като добавите първия си купувач</p>
          <button
            onClick={handleAddNew}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Добавяне на първи купувач
          </button>
        </div>
      )}

      {/* Modal for Add/Edit Buyer */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {editingBuyer ? 'Редактиране на купувач' : 'Добавяне на нов купувач'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Име *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Иван"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Петров"
                      required
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="ivan@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+359888123456"
                      required
                    />
                  </div>
                </div>

                {/* Budget and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Бюджет (лв.)
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="400000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Предпочитана локация
                    </label>
                    <input
                      type="text"
                      value={formData.preferredLocation}
                      onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Лозенец, София"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Бележки
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Допълнителна информация..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Отказ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    {editingBuyer ? 'Запазване' : 'Добавяне'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buyers;