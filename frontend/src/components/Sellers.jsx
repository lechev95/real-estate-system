// frontend/src/components/Sellers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Sellers = () => {
  const { getSellers, createSeller, updateSeller, deleteSeller } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    askingPrice: '',
    commission: '',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const data = await getSellers();
      setSellers((data.sellers || []).filter(s => !s.isArchived));
    } catch (error) {
      setError('Грешка при зареждане на продавачите');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.propertyAddress) {
      setError('Моля попълнете всички задължителни полета');
      return;
    }

    try {
      const sellerData = {
        ...formData,
        askingPrice: parseFloat(formData.askingPrice) || 0,
        commission: parseFloat(formData.commission) || 0
      };

      if (editingSeller) {
        await updateSeller(editingSeller.id, sellerData);
      } else {
        await createSeller(sellerData);
      }

      setShowModal(false);
      setEditingSeller(null);
      resetForm();
      loadSellers();
    } catch (error) {
      setError(error.message || 'Грешка при запазване');
    }
  };

  const handleEdit = (seller) => {
    setEditingSeller(seller);
    setFormData({
      firstName: seller.firstName || '',
      lastName: seller.lastName || '',
      email: seller.email || '',
      phone: seller.phone || '',
      propertyAddress: seller.propertyAddress || '',
      askingPrice: seller.askingPrice || '',
      commission: seller.commission || '',
      notes: seller.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този продавач?')) {
      try {
        await deleteSeller(id);
        loadSellers();
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
      propertyAddress: '',
      askingPrice: '',
      commission: '',
      notes: ''
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="text-lg text-gray-600">Зареждане на продавачи...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">👥 Продавачи</h2>
          <p className="text-gray-600">Управление на собственици на имоти</p>
        </div>
        <button
          onClick={() => { setEditingSeller(null); resetForm(); setShowModal(true); }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <span>+</span>
          Добавяне на продавач
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Грешка:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <div key={seller.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600 p-4 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-white">
                  <h3 className="text-lg font-bold">
                    {seller.firstName} {seller.lastName}
                  </h3>
                  <p className="text-orange-100 text-sm font-medium">Продавач</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Contact Info */}
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

              {/* Property Address */}
              {seller.propertyAddress && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">🏠</span>
                    <div>
                      <div className="text-xs text-blue-600 font-medium">Адрес на имота</div>
                      <div className="text-sm font-bold text-blue-700">{seller.propertyAddress}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Asking Price */}
              {seller.askingPrice && (
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                  <div className="text-sm text-orange-600 font-medium mb-1">Искана цена</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {formatPrice(seller.askingPrice)}
                  </div>
                </div>
              )}

              {/* Commission */}
              {seller.commission && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="text-sm text-green-600 font-medium mb-1">Комисионна</div>
                  <div className="text-lg font-bold text-green-700">{seller.commission}%</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(seller)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  ✏️ Редактиране
                </button>
                <button
                  onClick={() => handleDelete(seller.id)}
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
      {sellers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-8xl mb-6 animate-bounce">👥</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Няма добавени продавачи</h3>
          <p className="text-gray-600 mb-8 text-lg">Започнете като добавите първия си продавач</p>
          <button
            onClick={() => { setEditingSeller(null); resetForm(); setShowModal(true); }}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            👥 Добавяне на първи продавач
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">
                {editingSeller ? '✏️ Редактиране на продавач' : '👥 Добавяне на нов продавач'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="👤 Име *"
                  required
                />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="👤 Фамилия *"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="📧 Email"
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="📞 Телефон *"
                  required
                />
              </div>

              <input
                type="text"
                value={formData.propertyAddress}
                onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="🏠 Адрес на имота *"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  value={formData.askingPrice}
                  onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="💰 Искана цена (лв.)"
                />
                <input
                  type="number"
                  step="0.1"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="💼 Комисионна (%)"
                  max="10"
                  min="0"
                />
              </div>

              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="📝 Бележки"
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold"
                >
                  {editingSeller ? '💾 Запазване' : '➕ Добавяне'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sellers;