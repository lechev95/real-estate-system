// frontend/src/components/Properties.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Properties = () => {
  const { getProperties } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data.properties || []);
    } catch (error) {
      setError('Грешка при зареждане на имотите');
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Зареждане на имоти...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏠 Имоти</h2>
          <p className="text-gray-600">Управление на имоти за продажба</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
          + Добавяне на имот
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Properties List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {property.title}
            </h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{property.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏠</span>
                <span>{property.type}</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('bg-BG', {
                  style: 'currency',
                  currency: 'BGN',
                  minimumFractionDigits: 0
                }).format(property.price || 0)}
              </div>
            </div>

            {property.description && (
              <p className="text-gray-600 mt-3 text-sm">
                {property.description}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100">
                Редактиране
              </button>
              <button className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-100">
                Изтриване
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {properties.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏘️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Няма добавени имоти</h3>
          <p className="text-gray-600">Започнете като добавите първия си имот</p>
        </div>
      )}
    </div>
  );
};

export default Properties;