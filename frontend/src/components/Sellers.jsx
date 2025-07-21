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
      setSellers(data.sellers || []);
    } catch (error) {
      setError('Грешка при зареждане на продавачите');
      console.error('Error loading sellers:', error);
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
      setError(error.message);
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

  const handleAddNew = () => {
    setEditingSeller(null);
    resetForm();
    setShowModal(true);
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
        <div className="text-lg text-gray-600">Зареждане на продавачи...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Продавачи</h2>
          <p className="text-gray-600">Управление на собственици на имоти</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
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
          <div key={seller.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xl">🏪</span>
                </div>
                <div className="text-white">
                  <h3 className="text-lg font-bold">
                    {seller.firstName} {seller.lastName}
                  </h3>
                  <p className="text-orange-100 text-sm">Продавач</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {seller.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📧</span>
                    <span>{seller.email}</span>
                  </div>
                )}
                {seller.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📞</span>
                    <span>{seller.phone}</span>
                  </div>
                )}
              </div>

              {/* Property Address */}
              {seller.propertyAddress && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span>🏠</span>
                    <span className="text-gray-700">{seller.propertyAddress}</span>
                  </div>
                  <div className="text-xs text-gray-500">Адрес на имота</div>
                </div>
              )}

              {/* Asking Price */}
              {seller.askingPrice && (
                <div className="mb-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPrice(seller.askingPrice)}
                  </div>
                  <div className="text-xs text-gray-500">Искана цена</div>
                </div>
              )}

              {/* Commission */}
              {seller.commission && (
                <div className="mb-4">
                  <div className="text-lg font-semibold text-green-600">
                    {seller.commission}%
                  </div>
                  <div className="text-xs text-gray-500">Комисионна</div>
                </div>
              )}

              {/* Notes */}
              {seller.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {seller.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(seller)}
                  className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Редактиране
                </button>
                <button
                  onClick={() => handleDelete(seller.id)}
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
      {sellers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Няма добавени продавачи</h3>
          <p className="text-gray-600 mb-6">Започнете като добавите първия си продавач</p>
          <button
            onClick={handleAddNew}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Добавяне на първи продавач
          </button>
        </div>
      )}

      {/* Modal for Add/Edit Seller */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {editingSeller ? 'Редактиране на продавач' : 'Добавяне на нов продавач'}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Анна"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Стоянова"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="anna@example.com"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+359888111222"
                      required
                    />
                  </div>
                </div>

                {/* Property Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес на имота *
                  </label>
                  <input
                    type="text"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="ул. Витоша 100, София"
                    required
                  />
                </div>

                {/* Price and Commission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Искана цена (лв.)
                    </label>
                    <input
                      type="number"
                      value={formData.askingPrice}
                      onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="480000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Комисионна (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="3.0"
                      max="10"
                      min="0"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    {editingSeller ? 'Запазване' : 'Добавяне'}
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

export default Sellers;