// frontend/src/components/Sellers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Sellers = () => {
  const { getSellers } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const data = await getSellers();
      setSellers(data.sellers || []);
    } catch (error) {
      console.error('Error loading sellers:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">👥 Продавачи</h2>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg">
          + Добавяне на продавач
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <div key={seller.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2">
              {seller.firstName} {seller.lastName}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>📧 {seller.email}</div>
              <div>📞 {seller.phone}</div>
              <div>🏠 {seller.propertyAddress}</div>
              {seller.askingPrice && (
                <div className="text-orange-600 font-medium">
                  💰 {new Intl.NumberFormat('bg-BG', {
                    style: 'currency',
                    currency: 'BGN'
                  }).format(seller.askingPrice)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sellers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Няма добавени продавачи</h3>
        </div>
      )}
    </div>
  );
};

export default Sellers;