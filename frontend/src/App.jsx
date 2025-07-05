import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Eye, Archive, FileText, BarChart3, Home, MapPin, Calendar, Euro, TrendingUp, Users, Filter, X, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const RealEstateSystem = () => {
  const [properties, setProperties] = useState([
    {
      id: 1,
      title: "Двустаен апартамент в Център",
      area: 68,
      location: "София, Център",
      rooms: 2,
      priceEur: 85000,
      priceBgn: 166300,
      rentPriceEur: 650,
      rentPriceBgn: 1271,
      status: "rented",
      viewings: 5,
      lastViewing: "2025-06-28",
      images: [
        "https://via.placeholder.com/400x300?text=Apartment+Living+Room",
        "https://via.placeholder.com/400x300?text=Apartment+Kitchen",
        "https://via.placeholder.com/400x300?text=Apartment+Bedroom"
      ],
      description: "Слънчев двустаен апартамент в сърцето на София",
      floor: 3,
      totalFloors: 8,
      yearBuilt: 2015,
      archived: false,
      dateAdded: "2025-06-01"
    },
    {
      id: 2,
      title: "Къща в Бояна",
      area: 180,
      location: "София, Бояна",
      rooms: 4,
      priceEur: 280000,
      priceBgn: 547600,
      rentPriceEur: 1200,
      rentPriceBgn: 2346,
      status: "available",
      viewings: 12,
      lastViewing: "2025-06-30",
      images: [
        "https://via.placeholder.com/400x300?text=House+Exterior",
        "https://via.placeholder.com/400x300?text=House+Garden",
        "https://via.placeholder.com/400x300?text=House+Living+Room"
      ],
      description: "Красива къща с градина в престижен район",
      floor: 2,
      totalFloors: 2,
      yearBuilt: 2018,
      archived: false,
      dateAdded: "2025-05-15"
    },
    {
      id: 3,
      title: "Офис в Бизнес парк",
      area: 120,
      location: "София, Младост",
      rooms: 6,
      priceEur: 150000,
      priceBgn: 293400,
      rentPriceEur: 800,
      rentPriceBgn: 1564,
      status: "sold",
      viewings: 8,
      lastViewing: "2025-06-25",
      images: [
        "https://via.placeholder.com/400x300?text=Office+Space",
        "https://via.placeholder.com/400x300?text=Meeting+Room"
      ],
      description: "Съвременен офис в бизнес парк",
      floor: 5,
      totalFloors: 12,
      yearBuilt: 2020,
      archived: false,
      dateAdded: "2025-05-20"
    },
    {
      id: 4,
      title: "Тристаен апартамент в Лозенец",
      area: 95,
      location: "София, Лозенец",
      rooms: 3,
      priceEur: 120000,
      priceBgn: 234696,
      rentPriceEur: 750,
      rentPriceBgn: 1466,
      status: "reserved",
      viewings: 15,
      lastViewing: "2025-07-02",
      images: [
        "https://via.placeholder.com/400x300?text=Apartment+View",
        "https://via.placeholder.com/400x300?text=Balcony"
      ],
      description: "Просторен тристаен с панорамна гледка",
      floor: 8,
      totalFloors: 10,
      yearBuilt: 2019,
      archived: false,
      dateAdded: "2025-06-10"
    },
    {
      id: 5,
      title: "Магазин на партер",
      area: 45,
      location: "София, Витоша",
      rooms: 1,
      priceEur: 65000,
      priceBgn: 127127,
      rentPriceEur: 500,
      rentPriceBgn: 978,
      status: "inactive",
      viewings: 3,
      lastViewing: "2025-06-15",
      images: [
        "https://via.placeholder.com/400x300?text=Shop+Interior"
      ],
      description: "Търговско помещение на оживена улица",
      floor: 0,
      totalFloors: 6,
      yearBuilt: 2010,
      archived: false,
      dateAdded: "2025-05-30"
    }
  ]);

  const [activeTab, setActiveTab] = useState('properties');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [eurToBgnRate] = useState(1.9558);

  const statusLabels = {
    available: 'Наличен',
    reserved: 'Капариран',
    sold: 'Продаден',
    rented: 'Под наем',
    inactive: 'Неактивен'
  };

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-red-100 text-red-800',
    rented: 'bg-blue-100 text-blue-800',
    inactive: 'bg-gray-100 text-gray-800'
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    return matchesSearch && matchesStatus && !property.archived;
  });

  const handleUpdateProperty = (id, updates) => {
    setProperties(properties.map(prop => 
      prop.id === id ? { 
        ...prop, 
        ...updates,
        priceBgn: updates.priceEur ? updates.priceEur * eurToBgnRate : prop.priceBgn,
        rentPriceBgn: updates.rentPriceEur ? updates.rentPriceEur * eurToBgnRate : prop.rentPriceBgn
      } : prop
    ));
  };

  const handleArchiveProperty = (id) => {
    setProperties(properties.map(prop => 
      prop.id === id ? { ...prop, archived: true } : prop
    ));
  };

  const addViewing = (id) => {
    setProperties(properties.map(prop => 
      prop.id === id ? { 
        ...prop, 
        viewings: prop.viewings + 1,
        lastViewing: new Date().toISOString().split('T')[0]
      } : prop
    ));
  };

  // Аналитични данни
  const analyticsData = {
    totalProperties: properties.filter(p => !p.archived).length,
    availableProperties: properties.filter(p => p.status === 'available' && !p.archived).length,
    soldProperties: properties.filter(p => p.status === 'sold' && !p.archived).length,
    reservedProperties: properties.filter(p => p.status === 'reserved' && !p.archived).length,
    rentedProperties: properties.filter(p => p.status === 'rented' && !p.archived).length,
    inactiveProperties: properties.filter(p => p.status === 'inactive' && !p.archived).length,
    totalValue: properties.filter(p => !p.archived).reduce((sum, p) => sum + p.priceEur, 0),
    monthlyRentIncome: properties.filter(p => p.status === 'rented' && !p.archived).reduce((sum, p) => sum + (p.rentPriceEur || 0), 0),
    yearlyRentIncome: properties.filter(p => p.status === 'rented' && !p.archived).reduce((sum, p) => sum + (p.rentPriceEur || 0), 0) * 12,
    averagePrice: properties.filter(p => !p.archived).reduce((sum, p) => sum + p.priceEur, 0) / properties.filter(p => !p.archived).length,
    averageRent: properties.filter(p => p.status === 'rented' && !p.archived && p.rentPriceEur).reduce((sum, p) => sum + p.rentPriceEur, 0) / properties.filter(p => p.status === 'rented' && !p.archived && p.rentPriceEur).length,
    totalViewings: properties.filter(p => !p.archived).reduce((sum, p) => sum + p.viewings, 0)
  };

  const priceDistribution = [
    { name: 'До 100К€', value: properties.filter(p => !p.archived && p.priceEur <= 100000).length },
    { name: '100-200К€', value: properties.filter(p => !p.archived && p.priceEur > 100000 && p.priceEur <= 200000).length },
    { name: '200-300К€', value: properties.filter(p => !p.archived && p.priceEur > 200000 && p.priceEur <= 300000).length },
    { name: 'Над 300К€', value: properties.filter(p => !p.archived && p.priceEur > 300000).length }
  ];

  const viewingsData = properties.filter(p => !p.archived).map(p => ({
    name: p.title.substring(0, 15) + '...',
    viewings: p.viewings,
    price: p.priceEur
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const PropertyCard = ({ property }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img 
            src={property.images[currentImageIndex] || property.images[0]} 
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}>
            {statusLabels[property.status]}
          </div>
          {property.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1}/{property.images.length}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div>Площ: {property.area} м²</div>
            <div>Стаи: {property.rooms}</div>
            <div>Етаж: {property.floor}/{property.totalFloors}</div>
            <div>Година: {property.yearBuilt}</div>
          </div>
          <div className="mb-3">
            <div className="text-lg font-bold text-blue-600">
              {property.priceEur.toLocaleString()} €
            </div>
            <div className="text-sm text-gray-600">
              {property.priceBgn.toLocaleString()} лв
            </div>
            {property.status === 'rented' && property.rentPriceEur && (
              <div className="mt-1 p-2 bg-blue-50 rounded">
                <div className="text-sm font-medium text-blue-800">
                  Наем: {property.rentPriceEur}€/месец
                </div>
                <div className="text-xs text-blue-600">
                  {property.rentPriceBgn}лв/месец
                </div>
                <div className="text-xs text-blue-600">
                  Годишен приход: {(property.rentPriceEur * 12).toLocaleString()}€
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{property.viewings} огледа</span>
            </div>
            {property.lastViewing && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{property.lastViewing}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addViewing(property.id)}
              className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              + Оглед
            </button>
            <button
              onClick={() => setEditingProperty(property)}
              className="bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleArchiveProperty(property.id)}
              className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors"
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PropertyForm = ({ property, onSave, onCancel }) => {
    const [formData, setFormData] = useState(property || {
      title: '',
      area: '',
      location: '',
      rooms: '',
      priceEur: '',
      rentPriceEur: '',
      status: 'available',
      description: '',
      floor: '',
      totalFloors: '',
      yearBuilt: '',
      images: []
    });

    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      const imageUrls = files.map(file => URL.createObjectURL(file));
      setFormData({...formData, images: [...formData.images, ...imageUrls]});
    };

    const removeImage = (index) => {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData({...formData, images: newImages});
    };

    const handleSubmit = () => {
      if (!formData.title || !formData.area || !formData.location || !formData.priceEur) {
        alert('Моля попълнете всички задължителни полета');
        return;
      }
      
      if (property) {
        handleUpdateProperty(property.id, {
          ...formData,
          rentPriceBgn: formData.rentPriceEur ? formData.rentPriceEur * eurToBgnRate : 0
        });
      } else {
        const newProp = {
          id: Date.now(),
          ...formData,
          area: parseFloat(formData.area),
          rooms: parseInt(formData.rooms),
          priceEur: parseFloat(formData.priceEur),
          priceBgn: parseFloat(formData.priceEur) * eurToBgnRate,
          rentPriceEur: formData.rentPriceEur ? parseFloat(formData.rentPriceEur) : 0,
          rentPriceBgn: formData.rentPriceEur ? parseFloat(formData.rentPriceEur) * eurToBgnRate : 0,
          viewings: 0,
          lastViewing: null,
          images: formData.images.length > 0 ? formData.images : ["https://via.placeholder.com/400x300?text=New+Property"],
          archived: false,
          dateAdded: new Date().toISOString().split('T')[0]
        };
        setProperties([...properties, newProp]);
      }
      onSave();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {property ? 'Редактиране на имот' : 'Добавяне на нов имот'}
            </h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Заглавие *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Площ (м²) *</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Стаи *</label>
                <input
                  type="number"
                  value={formData.rooms}
                  onChange={(e) => setFormData({...formData, rooms: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Локация *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Цена за продажба (€) *</label>
                <input
                  type="number"
                  value={formData.priceEur}
                  onChange={(e) => setFormData({...formData, priceEur: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Месечен наем (€)</label>
                <input
                  type="number"
                  value={formData.rentPriceEur}
                  onChange={(e) => setFormData({...formData, rentPriceEur: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="За имоти под наем"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Етаж</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Общо етажи</label>
                <input
                  type="number"
                  value={formData.totalFloors}
                  onChange={(e) => setFormData({...formData, totalFloors: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Година на строеж</label>
              <input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Статус</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="available">Наличен</option>
                <option value="reserved">Капариран</option>
                <option value="rented">Под наем</option>
                <option value="sold">Продаден</option>
                <option value="inactive">Неактивен</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Снимки</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded"
              />
              {formData.images && formData.images.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Снимка ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded h-20"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                {property ? 'Запази' : 'Добави'}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
              >
                Отказ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Home className="w-8 h-8 mr-2 text-blue-600" />
              Недвижими имоти
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Курс EUR/BGN: {eurToBgnRate}
              </span>
              <Euro className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'properties' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Имоти
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Анализи
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reports' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Отчети
          </button>
        </div>

        {activeTab === 'properties' && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Търсене по заглавие или локация..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Всички статуси</option>
                    <option value="available">Наличен</option>
                    <option value="reserved">Капариран</option>
                    <option value="rented">Под наем</option>
                    <option value="sold">Продаден</option>
                    <option value="inactive">Неактивен</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowPropertyForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Нов имот
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Няма намерени имоти</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Общо имоти</p>
                    <p className="text-xl font-bold text-blue-600">{analyticsData.totalProperties}</p>
                  </div>
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Налични</p>
                    <p className="text-xl font-bold text-green-600">{analyticsData.availableProperties}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Под наем</p>
                    <p className="text-xl font-bold text-blue-600">{analyticsData.rentedProperties}</p>
                  </div>
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Продадени</p>
                    <p className="text-xl font-bold text-red-600">{analyticsData.soldProperties}</p>
                  </div>
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Капарирани</p>
                    <p className="text-xl font-bold text-yellow-600">{analyticsData.reservedProperties}</p>
                  </div>
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Неактивни</p>
                    <p className="text-xl font-bold text-gray-600">{analyticsData.inactiveProperties}</p>
                  </div>
                  <Archive className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Месечен приход</p>
                    <p className="text-2xl font-bold text-green-600">€{analyticsData.monthlyRentIncome.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{(analyticsData.monthlyRentIncome * eurToBgnRate).toLocaleString()} лв</p>
                  </div>
                  <Euro className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Годишен приход</p>
                    <p className="text-2xl font-bold text-green-600">€{analyticsData.yearlyRentIncome.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{(analyticsData.yearlyRentIncome * eurToBgnRate).toLocaleString()} лв</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Среден наем</p>
                    <p className="text-2xl font-bold text-blue-600">€{Math.round(analyticsData.averageRent || 0)}</p>
                    <p className="text-xs text-gray-500">{Math.round((analyticsData.averageRent || 0) * eurToBgnRate)} лв</p>
                  </div>
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Общо огледи</p>
                    <p className="text-2xl font-bold text-purple-600">{analyticsData.totalViewings}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Разпределение по цена</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, value}) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Огледи по имоти</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={viewingsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="viewings" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Обобщен отчет</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Финансови показатели</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Обща стойност портфейл:</span>
                      <span className="font-medium">€{analyticsData.totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Средна цена на имот:</span>
                      <span className="font-medium">€{Math.round(analyticsData.averagePrice).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Стойност продадени имоти:</span>
                      <span className="font-medium">
                        €{properties.filter(p => p.status === 'sold').reduce((sum, p) => sum + p.priceEur, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Месечен приход от наеми:</span>
                      <span className="font-medium text-green-600">€{analyticsData.monthlyRentIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Годишен приход от наеми:</span>
                      <span className="font-medium text-green-600">€{analyticsData.yearlyRentIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Активност</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Средно огледи на имот:</span>
                      <span className="font-medium">
                        {Math.round(analyticsData.totalViewings / analyticsData.totalProperties * 10) / 10}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Най-много огледи:</span>
                      <span className="font-medium">
                        {Math.max(...properties.filter(p => !p.archived).map(p => p.viewings))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Процент продажби:</span>
                      <span className="font-medium">
                        {Math.round(analyticsData.soldProperties / analyticsData.totalProperties * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Процент под наем:</span>
                      <span className="font-medium">
                        {Math.round(analyticsData.rentedProperties / analyticsData.totalProperties * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Обхват на цените:</span>
                      <span className="font-medium">
                        €{Math.min(...properties.filter(p => !p.archived).map(p => p.priceEur)).toLocaleString()} - 
                        €{Math.max(...properties.filter(p => !p.archived).map(p => p.priceEur)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Детайлна справка по имоти</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Заглавие</th>
                      <th className="text-left p-2">Локация</th>
                      <th className="text-left p-2">Цена (€)</th>
                      <th className="text-left p-2">Наем (€)</th>
                      <th className="text-left p-2">Статус</th>
                      <th className="text-left p-2">Огледи</th>
                      <th className="text-left p-2">Последен оглед</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.filter(p => !p.archived).map(property => (
                      <tr key={property.id} className="border-b">
                        <td className="p-2">{property.title}</td>
                        <td className="p-2">{property.location}</td>
                        <td className="p-2">€{property.priceEur.toLocaleString()}</td>
                        <td className="p-2">
                          {property.rentPriceEur ? `€${property.rentPriceEur}` : '-'}
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[property.status]}`}>
                            {statusLabels[property.status]}
                          </span>
                        </td>
                        <td className="p-2">{property.viewings}</td>
                        <td className="p-2">{property.lastViewing || 'Няма'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPropertyForm && (
        <PropertyForm
          onSave={() => setShowPropertyForm(false)}
          onCancel={() => setShowPropertyForm(false)}
        />
      )}

      {editingProperty && (
        <PropertyForm
          property={editingProperty}
          onSave={() => setEditingProperty(null)}
          onCancel={() => setEditingProperty(null)}
        />
      )}
    </div>
  );
};

export default RealEstateSystem;