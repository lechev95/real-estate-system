// frontend/src/components/UserManagement.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserManagement = () => {
  const { token, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState({ show: false, message: '', onConfirm: null });

  const API_BASE_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';

  // Redirect if not admin
  if (!isAdmin()) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: '#dc2626'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
        <h3>Достъп отказан</h3>
        <p>Само администраторите имат достъп до тази страница</p>
      </div>
    );
  }

  const apiRequest = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`${API_BASE_URL}/auth/users`);
      setUsers(data.users || []);
    } catch (error) {
      setError('Грешка при зареждане на потребители: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (userData) => {
    try {
      const url = editingUser 
        ? `${API_BASE_URL}/auth/users/${editingUser.id}`
        : `${API_BASE_URL}/auth/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const savedUser = await apiRequest(url, {
        method,
        body: JSON.stringify(userData)
      });

      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? savedUser.user : u));
      } else {
        setUsers([...users, savedUser.user]);
      }

      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      setError('Грешка при запазване на потребител: ' + error.message);
    }
  };

  const resetPassword = async (userId, newPassword) => {
    try {
      await apiRequest(`${API_BASE_URL}/auth/users/${userId}/reset-password`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword })
      });
      
      alert('Паролата е променена успешно!');
    } catch (error) {
      setError('Грешка при смяна на парола: ' + error.message);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await apiRequest(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'DELETE'
      });
      
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      setError('Грешка при изтриване на потребител: ' + error.message);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await apiRequest(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: newStatus })
      });
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isActive: newStatus } : u
      ));
    } catch (error) {
      setError('Грешка при промяна на статус: ' + error.message);
    }
  };

  const confirmAction = (message, onConfirm) => {
    setShowConfirm({
      show: true,
      message,
      onConfirm: () => {
        onConfirm();
        setShowConfirm({ show: false, message: '', onConfirm: null });
      }
    });
  };

  const UserForm = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'agent',
      isActive: user?.isActive !== undefined ? user.isActive : true
    });
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // For new users, password is required
      if (!user && !formData.password) {
        alert('Паролата е задължителна за нови потребители');
        return;
      }

      const submitData = { ...formData };
      if (!user) {
        // New user - include password
        submitData.password = formData.password;
      }
      
      onSave(submitData);
    };

    const handlePasswordReset = () => {
      if (!newPassword || newPassword.length < 6) {
        alert('Паролата трябва да бъде поне 6 символа');
        return;
      }
      
      confirmAction(
        'Сигурни ли сте, че искате да смените паролата на този потребител?',
        () => resetPassword(user.id, newPassword)
      );
      setNewPassword('');
    };

    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Име"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          disabled={!!user} // Don't allow email changes for existing users
          style={{ 
            padding: '0.75rem', 
            border: '1px solid #d1d5db', 
            borderRadius: '0.5rem',
            backgroundColor: user ? '#f9fafb' : 'white'
          }}
        />

        {!user && (
          <input
            type="password"
            placeholder="Парола (мин. 6 символа)"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            minLength={6}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          >
            <option value="agent">👤 Агент</option>
            <option value="admin">👑 Администратор</option>
          </select>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            />
            Активен потребител
          </label>
        </div>

        {user && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
              Смяна на парола
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                placeholder="Нова парола (мин. 6 символа)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                style={{ 
                  flex: 1,
                  padding: '0.5rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem'
                }}
              />
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={!newPassword}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: newPassword ? '#f59e0b' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: newPassword ? 'pointer' : 'not-allowed',
                  fontSize: '0.75rem'
                }}
              >
                Смени
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Отказ
          </button>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            {user ? 'Обновяване' : 'Създаване'}
          </button>
        </div>
      </form>
    );
  };

  const CustomConfirm = ({ show, message, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 25px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>⚠️ Потвърждение</h3>
          <p style={{ marginBottom: '2rem', color: '#6b7280' }}>{message}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Отказ
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Потвърди
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem'
      }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '2px solid #f3f4f6',
          borderTopColor: '#dc2626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ marginLeft: '1rem' }}>Зареждане на потребители...</span>
      </div>
    );
  }

  return (
    <div>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
          👥 Управление на потребители
        </h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowUserModal(true);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          ➕ Добавяне на потребител
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem',
          color: '#dc2626'
        }}>
          ⚠️ {error}
          <button
            onClick={() => setError('')}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Users Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { 
            label: 'Общо потребители', 
            value: users.length, 
            color: '#dc2626', 
            icon: '👥' 
          },
          { 
            label: 'Активни', 
            value: users.filter(u => u.isActive).length, 
            color: '#10b981', 
            icon: '✅' 
          },
          { 
            label: 'Администратори', 
            value: users.filter(u => u.role === 'admin').length, 
            color: '#f59e0b', 
            icon: '👑' 
          },
          { 
            label: 'Агенти', 
            value: users.filter(u => u.role === 'agent').length, 
            color: '#3b82f6', 
            icon: '👤' 
          }
        ].map(stat => (
          <div key={stat.label} style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: `2px solid ${stat.color}20`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{stat.label}</span>
              <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: stat.color
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Потребител
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Роля
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Статус
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Създаден
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{
                  borderTop: '1px solid #e5e7eb',
                  opacity: user.isActive ? 1 : 0.6
                }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: user.role === 'admin' ? '#dc2626' : '#3b82f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: user.role === 'admin' ? '#fef2f2' : '#eff6ff',
                      color: user.role === 'admin' ? '#dc2626' : '#3b82f6'
                    }}>
                      {user.role === 'admin' ? '👑 Администратор' : '👤 Агент'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: user.isActive ? '#f0fdf4' : '#fef2f2',
                      color: user.isActive ? '#059669' : '#dc2626'
                    }}>
                      {user.isActive ? '✅ Активен' : '🚫 Неактивен'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    {new Date(user.createdAt).toLocaleDateString('bg-BG')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowUserModal(true);
                        }}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ✏️ Редактиране
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: user.isActive ? '#f59e0b' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        {user.isActive ? '⏸️ Деактивиране' : '▶️ Активиране'}
                      </button>
                      <button
                        onClick={() => confirmAction(
                          `Сигурни ли сте, че искате да изтриете ${user.firstName} ${user.lastName}?`,
                          () => deleteUser(user.id)
                        )}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        🗑️ Изтриване
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h3>Няма потребители</h3>
            <p>Започнете с добавяне на първия потребител</p>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>
              👥 {editingUser ? 'Редактиране на потребител' : 'Добавяне на потребител'}
            </h3>
            <UserForm
              user={editingUser}
              onSave={saveUser}
              onCancel={() => {
                setShowUserModal(false);
                setEditingUser(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      <CustomConfirm
        show={showConfirm.show}
        message={showConfirm.message}
        onConfirm={showConfirm.onConfirm}
        onCancel={() => setShowConfirm({ show: false, message: '', onConfirm: null })}
      />
    </div>
  );
};

export default UserManagement;