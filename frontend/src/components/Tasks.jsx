// frontend/src/components/Tasks.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Tasks = () => {
  const { getTasks, createTask, updateTask, deleteTask, completeTask, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: '',
    relatedType: '',
    relatedId: ''
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
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title) {
      setError('Моля въведете заглавие на задачата');
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
      setError(error.message);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'medium',
      assignedTo: task.assignedTo || '',
      relatedType: task.relatedType || '',
      relatedId: task.relatedId || ''
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

  const handleComplete = async (id) => {
    try {
      await completeTask(id);
      loadTasks();
    } catch (error) {
      setError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      assignedTo: user ? `${user.firstName} ${user.lastName}` : '',
      relatedType: '',
      relatedId: ''
    });
    setError('');
  };

  const handleAddNew = () => {
    setEditingTask(null);
    resetForm();
    setShowModal(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Висок';
      case 'medium': return 'Среден';
      case 'low': return 'Нисък';
      default: return 'Неизвестен';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Без срок';
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG');
  };

  // Filter and sort tasks
  const sortedTasks = tasks.sort((a, b) => {
    // First sort by completion status
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // Then by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority] || 0;
    const bPriority = priorityOrder[b.priority] || 0;
    if (aPriority !== bPriority) return bPriority - aPriority;
    
    // Finally by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Зареждане на задачи...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Задачи</h2>
          <p className="text-gray-600">Управление на дейности и срокове</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <span>+</span>
          Добавяне на задача
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Грешка:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Tasks Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(() => {
          const pending = tasks.filter(t => t.status !== 'completed').length;
          const completed = tasks.filter(t => t.status === 'completed').length;
          const overdue = tasks.filter(t => t.status !== 'completed' && isOverdue(t.dueDate)).length;
          const highPriority = tasks.filter(t => t.status !== 'completed' && t.priority === 'high').length;
          
          return [
            { label: 'Активни', value: pending, color: 'blue', icon: '📋' },
            { label: 'Завършени', value: completed, color: 'green', icon: '✅' },
            { label: 'Просрочени', value: overdue, color: 'red', icon: '⏰' },
            { label: 'Висок приоритет', value: highPriority, color: 'purple', icon: '🔴' }
          ].map(stat => (
            <div key={stat.label} className={`bg-white p-4 rounded-lg shadow border-l-4 border-${stat.color}-500`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {sortedTasks.map((task) => (
          <div 
            key={task.id} 
            className={`bg-white rounded-xl shadow-lg border-l-4 overflow-hidden transition-all duration-200 hover:shadow-xl ${
              task.status === 'completed' ? 'opacity-75 border-green-500' :
              isOverdue(task.dueDate) ? 'border-red-500' :
              task.priority === 'high' ? 'border-red-400' :
              task.priority === 'medium' ? 'border-yellow-400' : 'border-green-400'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Task Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-bold ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)} {getPriorityText(task.priority)}
                    </span>
                    {task.status === 'completed' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        ✓ Завършена
                      </span>
                    )}
                    {isOverdue(task.dueDate) && task.status !== 'completed' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        ⏰ Просрочена
                      </span>
                    )}
                  </div>

                  {/* Task Description */}
                  {task.description && (
                    <p className={`text-gray-600 mb-3 ${task.status === 'completed' ? 'line-through' : ''}`}>
                      {task.description}
                    </p>
                  )}

                  {/* Task Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span className={isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    )}
                    {task.assignedTo && (
                      <div className="flex items-center gap-1">
                        <span>👤</span>
                        <span>{task.assignedTo}</span>
                      </div>
                    )}
                    {task.relatedType && (
                      <div className="flex items-center gap-1">
                        <span>🔗</span>
                        <span>{task.relatedType}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                      title="Маркирай като завършена"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(task)}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                    title="Редактиране"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                    title="Изтриване"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Няма добавени задачи</h3>
          <p className="text-gray-600 mb-6">Започнете като добавите първата си задача</p>
          <button
            onClick={handleAddNew}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Добавяне на първа задача
          </button>
        </div>
      )}

      {/* Modal for Add/Edit Task */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {editingTask ? 'Редактиране на задача' : 'Добавяне на нова задача'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Заглавие *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="напр. Оглед на имот в Лозенец"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Подробно описание на задачата..."
                  />
                </div>

                {/* Due Date and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Срок
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Приоритет
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">🟢 Нисък приоритет</option>
                      <option value="medium">🟡 Среден приоритет</option>
                      <option value="high">🔴 Висок приоритет</option>
                    </select>
                  </div>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Възложено на
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Име на отговорника"
                  />
                </div>

                {/* Related Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Свързана с
                    </label>
                    <select
                      value={formData.relatedType}
                      onChange={(e) => setFormData({ ...formData, relatedType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Избери тип</option>
                      <option value="property">Имот</option>
                      <option value="buyer">Купувач</option>
                      <option value="seller">Продавач</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID на свързания запис
                    </label>
                    <input
                      type="number"
                      value={formData.relatedId}
                      onChange={(e) => setFormData({ ...formData, relatedId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="напр. 1"
                    />
                  </div>
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
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    {editingTask ? 'Запазване' : 'Добавяне'}
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

export default Tasks;