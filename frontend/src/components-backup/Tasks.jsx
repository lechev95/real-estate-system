// frontend/src/components/Tasks.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Tasks = () => {
  const { getTasks, createTask, updateTask, deleteTask, completeTask } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignee: '',
    type: 'follow_up',
    relatedId: '',
    status: 'pending'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      setError('Грешка при зареждане на задачите');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.dueDate) {
      setError('Моля попълнете всички задължителни полета');
      return;
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await createTask(formData);
      }

      setShowModal(false);
      setEditingTask(null);
      resetForm();
      loadTasks();
    } catch (error) {
      setError(error.message || 'Грешка при запазване');
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeTask(id);
      loadTasks();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignee: task.assignee || '',
      type: task.type || 'follow_up',
      relatedId: task.relatedId || '',
      status: task.status || 'pending'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази задача?')) {
      try {
        await deleteTask(id);
        loadTasks();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignee: '',
      type: 'follow_up',
      relatedId: '',
      status: 'pending'
    });
    setError('');
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      urgent: 'bg-purple-100 text-purple-800'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: '🔵',
      medium: '🟡',
      high: '🔴',
      urgent: '🟣'
    };
    return icons[priority] || '🟡';
  };

  const getTypeIcon = (type) => {
    const icons = {
      follow_up: '📞',
      meeting: '👥',
      showing: '🏠',
      paperwork: '📋',
      inspection: '🔍',
      other: '📝'
    };
    return icons[type] || '📝';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'overdue') {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today && task.status !== 'completed';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-lg text-gray-600">Зареждане на задачи...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📋 Задачи</h2>
          <p className="text-gray-600">Управление на задачи и календар</p>
        </div>
        <button
          onClick={() => { setEditingTask(null); resetForm(); setShowModal(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <span>+</span>
          Добавяне на задача
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: 'all', label: '📋 Всички', count: tasks.length },
          { key: 'pending', label: '⏳ Чакащи', count: tasks.filter(t => t.status === 'pending').length },
          { key: 'completed', label: '✅ Завършени', count: tasks.filter(t => t.status === 'completed').length },
          { key: 'overdue', label: '⚠️ Просрочени', count: tasks.filter(t => {
            const dueDate = new Date(t.dueDate);
            const today = new Date();
            return dueDate < today && t.status !== 'completed';
          }).length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors duration-200 ${
              filter === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Грешка:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${
            task.status === 'completed' ? 'opacity-75' : ''
          }`}>
            {/* Header */}
            <div className={`p-4 relative overflow-hidden ${
              task.priority === 'urgent' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
              task.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
              task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{getTypeIcon(task.type)}</span>
                  </div>
                  <div className="text-white flex-1">
                    <h3 className="text-lg font-bold line-clamp-1">{task.title}</h3>
                    <p className="text-white/80 text-sm font-medium">
                      {task.dueDate && new Date(task.dueDate).toLocaleDateString('bg-BG')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                    {getPriorityIcon(task.priority)} {task.priority?.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(task.status)}`}>
                    {task.status === 'completed' ? '✅' : task.status === 'pending' ? '⏳' : '🔄'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Description */}
              {task.description && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-700 line-clamp-3">{task.description}</div>
                </div>
              )}

              {/* Assignee */}
              {task.assignee && (
                <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <div className="text-sm text-indigo-600 font-medium mb-1">Назначена на</div>
                  <div className="text-sm font-bold text-indigo-700">👤 {task.assignee}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {task.status !== 'completed' && (
                  <button
                    onClick={() => handleComplete(task.id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    ✅ Завърши
                  </button>
                )}
                <button
                  onClick={() => handleEdit(task)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  ✏️ Редактиране
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-8xl mb-6 animate-bounce">📋</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {filter === 'all' ? 'Няма добавени задачи' : `Няма ${filter === 'pending' ? 'чакащи' : filter === 'completed' ? 'завършени' : 'просрочени'} задачи`}
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            {filter === 'all' ? 'Започнете като добавите първата си задача' : 'Изберете различен филтър или добавете нова задача'}
          </p>
          <button
            onClick={() => { setEditingTask(null); resetForm(); setShowModal(true); }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            📋 Добавяне на първа задача
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">
                {editingTask ? '✏️ Редактиране на задача' : '📋 Добавяне на нова задача'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="📋 Заглавие на задачата *"
                required
              />

              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="📝 Описание на задачата"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">🔵 Нисък приоритет</option>
                  <option value="medium">🟡 Среден приоритет</option>
                  <option value="high">🔴 Висок приоритет</option>
                  <option value="urgent">🟣 Спешно</option>
                </select>

                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="follow_up">📞 Проследяване</option>
                  <option value="meeting">👥 Среща</option>
                  <option value="showing">🏠 Показване</option>
                  <option value="paperwork">📋 Документи</option>
                  <option value="inspection">🔍 Оглед</option>
                  <option value="other">📝 Друго</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="👤 Назначена на"
                />
              </div>

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
                  {editingTask ? '💾 Запазване' : '➕ Добавяне'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;