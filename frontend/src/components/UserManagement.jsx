// frontend/src/components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const UserManagement = () => {
  const { user, getUsers, createUser, updateUser, deleteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'agent'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (error) {
      setError('Грешка при зареждане на потребителите');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Моля попълнете всички задължителни полета');
      return;
    }

    if (!editingUser && !formData.password) {
      setError('Паролата е задължителна за нови потребители');
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await createUser(formData);
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      setError(error.message || 'Грешка при запазване');
    }
  };

  const handleEdit = (userToEdit) => {
    if (userToEdit.id === user.id) {
      setError('Не можете да редактирате собствения си акаунт');
      return;
    }
    
    setEditingUser(userToEdit);
    setFormData({
      firstName: userToEdit.firstName || '',
      lastName: userToEdit.lastName || '',
      email: userToEdit.email || '',
      password: '',
      role: userToEdit.role || 'agent'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (id === user.id) {
      setError('Не можете да изтриете собствения си акаунт');
      return;
    }

    if (window.confirm('Сигурни ли сте, че искате да изтриете този потребител?')) {
      try {
        await deleteUser(id);
        loadUsers();
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
      password: '',
      role: 'agent'
    });
    setError('');
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? '👑' : '👤';
  };

  const getRoleName = (role) => {
    return role === 'admin' ? 'Администратор' : 'Агент';
  };

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚫</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Няма достъп</h3>
        <p className="text-gray-600">Само администратори могат да управляват потребители</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-lg text-gray-600">Зареждане на потребители...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">👑 Управление на потребители</h2>
          <p className="text-gray-600">Добавяне и редактиране на потребителски акаунти</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); resetForm(); setShowModal(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <span>+</span>
          Добавяне на потребител
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Грешка:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((userItem) => (
          <div key={userItem.id} className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${userItem.id === user.id ? 'ring-2 ring-purple-500' : ''}`}>
            {/* Header */}
            <div className={`p-4 relative overflow-hidden ${
              userItem.role === 'admin' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{getRoleIcon(userItem.role)}</span>
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-bold">
                      {userItem.firstName} {userItem.lastName}
                    </h3>
                    <p className="text-white/80 text-sm font-medium">{getRoleName(userItem.role)}</p>
                  </div>
                </div>
                {userItem.id === user.id && (
                  <span className="bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Вие
                  </span>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Email */}
              <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600 font-medium mb-1">Email адрес</div>
                <div className="text-sm font-bold text-blue-700 break-all">📧 {userItem.email}</div>
              </div>

              {/* Role Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getRoleColor(userItem.role)}`}>
                  {getRoleIcon(userItem.role)} {getRoleName(userItem.role)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(userItem)}
                  disabled={userItem.id === user.id}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                    userItem.id === user.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : userItem.role === 'admin'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                  }`}
                >
                  ✏️ Редактиране
                </button>
                <button
                  onClick={() => handleDelete(userItem.id)}
                  disabled={userItem.id === user.id}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                    userItem.id === user.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  }`}
                >
                  🗑️ Изтриване
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-8xl mb-6 animate-bounce">👑</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Няма добавени потребители</h3>
          <p className="text-gray-600 mb-8 text-lg">Започнете като добавите първия потребител</p>
          <button
            onClick={() => { setEditingUser(null); resetForm(); setShowModal(true); }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            👑 Добавяне на първи потребител
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">
                {editingUser ? '✏️ Редактиране на потребител' : '👑 Добавяне на нов потребител'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="👤 Име *"
                  required
                />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="👤 Фамилия *"
                  required
                />
              </div>

              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="📧 Email адрес *"
                required
              />

              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={editingUser ? "🔒 Нова парола (оставете празно за запазване на старата)" : "🔒 Парола *"}
                required={!editingUser}
              />

              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="agent">👤 Агент</option>
                <option value="admin">👑 Администратор</option>
              </select>

              {editingUser && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    <div className="text-sm text-yellow-800">
                      <strong>Внимание:</strong> Промените ще влязат в сила след следващото влизане на потребителя.
                    </div>
                  </div>
                </div>
              )}

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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold"
                >
                  {editingUser ? '💾 Запазване' : '➕ Добавяне'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;