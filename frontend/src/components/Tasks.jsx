// frontend/src/components/Tasks.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Tasks = () => {
  const { getTasks } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Зареждане на задачи...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📋 Задачи</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
          + Добавяне на задача
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {task.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityText(task.priority)}
                  </span>
                  {task.status === 'completed' && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Завършена
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="text-gray-600 mb-3">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{new Date(task.dueDate).toLocaleDateString('bg-BG')}</span>
                    </div>
                  )}
                  {task.assignedTo && (
                    <div className="flex items-center gap-1">
                      <span>👤</span>
                      <span>{task.assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>

              {task.status !== 'completed' && (
                <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
                  ✓ Завърши
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Няма добавени задачи</h3>
        </div>
      )}
    </div>
  );
};

export default Tasks;