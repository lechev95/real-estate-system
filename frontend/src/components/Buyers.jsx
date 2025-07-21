// frontend/src/components/Buyers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Buyers = () => {
  const { getBuyers } = useAuth();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      const data = await getBuyers();
      setBuyers(data.buyers || []);
    } catch (error) {
      console.error('Error loading buyers:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">👤 Купувачи</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
          + Добавяне на купувач
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buyers.map((buyer) => (
          <div key={buyer.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2">
              {buyer.firstName} {buyer.lastName}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>📧 {buyer.email}</div>
              <div>📞 {buyer.phone}</div>
              {buyer.budget && (
                <div className="text-green-600 font-medium">
                  💰 {new Intl.NumberFormat('bg-BG', {
                    style: 'currency',
                    currency: 'BGN'
                  }).format(buyer.budget)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {buyers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Няма добавени купувачи</h3>
        </div>
      )}
    </div>
  );
};

export default Buyers;