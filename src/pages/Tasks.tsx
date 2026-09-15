import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Filter, Search } from 'lucide-react';
import { dbGetAll, dbPut, dbDelete } from '../lib/storage';
import type { Task } from '../types';
import { v4 as uuid } from 'uuid';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');

  const [form, setForm] = useState({ title: '', description: '', subject: '', priority: 'medium' as Task['priority'], dueDate: '', estimatedTime: 30, tags: '' });

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    const data = await dbGetAll<Task>('tasks');
    setTasks(data.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (sortBy === 'dueDate') return (a.dueDate || 'z').localeCompare(b.dueDate || 'z');
      if (sortBy === 'priority') { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority]; }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    }));
  };

  const saveTask = async () => {
    if (!form.title.trim()) return;
    const task: Task = {
      id: editingTask?.id || uuid(),
      title: form.title.trim(),
      description: form.description.trim(),
      subject: form.subject.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
      estimatedTime: form.estimatedTime,
      completed: editingTask?.completed || false,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: editingTask?.createdAt || new Date().toISOString(),
    };
    await dbPut('tasks', task);
    resetForm();
    loadTasks();
  };

  const deleteTask = async (id: string) => {
    await dbDelete('tasks', id);
    loadTasks();
  };

  const toggleComplete = async (task: Task) => {
    await dbPut('tasks', { ...task, completed: !task.completed });
    loadTasks();
    // Update stats
    if (!task.completed) {
      try {
        const stats = JSON.parse(localStorage.getItem('studyscope_stats') || '{}');
        stats.tasksCompleted = (stats.tasksCompleted || 0) + 1;
        localStorage.setItem('studyscope_stats', JSON.stringify(stats));
      } catch { /* ignore */ }
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setForm({ title: task.title, description: task.description, subject: task.subject, priority: task.priority, dueDate: task.dueDate, estimatedTime: task.estimatedTime, tags: task.tags.join(', ') });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ title: '', description: '', subject: '', priority: 'medium', dueDate: '', estimatedTime: 30, tags: '' });
    setEditingTask(null);
    setShowForm(false);
  };

  const filtered = tasks.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStatus === 'active' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    return true;
  });

  const getDaysUntil = (dateStr: string) => {
    if (!dateStr) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h2>
          <div className="space-y-3">
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title *" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Task['priority'] })} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="number" value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: parseInt(e.target.value) || 0 })} placeholder="Est. time (min)" className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={saveTask} className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">{editingTask ? 'Update' : 'Add Task'}</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tasks..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="title">Sort: Title</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Filter size={40} className="mx-auto mb-3 opacity-50" />
            <p>No tasks found</p>
          </div>
        ) : (
          filtered.map(task => {
            const days = getDaysUntil(task.dueDate);
            return (
              <div key={task.id} className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${task.completed ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleComplete(task)} className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'}`}>
                    {task.completed && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</p>
                    {task.description && <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {task.subject && <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{task.subject}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>{task.priority}</span>
                      {days !== null && !task.completed && (
                        <span className={`text-xs ${days <= 0 ? 'text-red-500 font-medium' : days <= 2 ? 'text-orange-500' : 'text-gray-500'}`}>
                          {days <= 0 ? 'Overdue' : days === 1 ? 'Tomorrow' : `${days} days left`}
                        </span>
                      )}
                      {task.tags.map(tag => <span key={tag} className="text-xs text-indigo-500">#{tag}</span>)}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEdit(task)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Edit2 size={14} className="text-gray-500" /></button>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} className="text-red-500" /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
