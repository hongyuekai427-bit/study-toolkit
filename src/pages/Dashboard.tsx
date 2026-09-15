import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowLeftRight, Timer, StickyNote, CheckSquare, Award, Search, Clock, Calendar, TrendingUp, Pin, PinOff, Star } from 'lucide-react';
import { TOOLS, CATEGORIES, searchTools } from '../data/tools';
import { useLocalStorage } from '../hooks';
import { dbGetAll } from '../lib/storage';
import type { Task, StudyStats } from '../types';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedTools, setPinnedTools] = useLocalStorage<string[]>('pinnedTools', ['calculator', 'timer', 'tasks', 'notes']);
  const [taskCount, setTaskCount] = useState(0);
  const [stats, setStats] = useState<StudyStats>({ totalFocusTime: 0, sessionsCompleted: 0, tasksCompleted: 0, flashcardsReviewed: 0, quizScores: [], dailyLog: {} });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Task[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const tasks = await dbGetAll<Task>('tasks');
    const incompleteTasks = tasks.filter(t => !t.completed);
    setTaskCount(incompleteTasks.length);
    
    const today = new Date().toISOString().split('T')[0];
    const upcoming = incompleteTasks
      .filter(t => t.dueDate && t.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
    setUpcomingDeadlines(upcoming);

    try {
      const savedStats = localStorage.getItem('studyscope_stats');
      if (savedStats) setStats(JSON.parse(savedStats));
    } catch { /* ignore */ }
  };

  const togglePin = (toolId: string) => {
    setPinnedTools(prev => prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]);
  };

  const searchResults = searchQuery.trim() ? searchTools(searchQuery) : [];
  const pinned = pinnedTools.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="pb-20 lg:pb-0">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">StudyScope</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Your everyday toolkit for school.</p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tools... (Ctrl+K)"
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden max-h-64 overflow-y-auto">
            {searchResults.map(tool => (
              <Link key={tool.id} to={tool.path} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <Calculator size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{tool.name}</p>
                  <p className="text-xs text-gray-500">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <CheckSquare size={16} />
            <span className="text-xs font-medium">Tasks Remaining</span>
          </div>
          <p className="text-2xl font-bold">{taskCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Clock size={16} />
            <span className="text-xs font-medium">Focus Time</span>
          </div>
          <p className="text-2xl font-bold">{formatTime(stats.totalFocusTime)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Timer size={16} />
            <span className="text-xs font-medium">Sessions</span>
          </div>
          <p className="text-2xl font-bold">{stats.sessionsCompleted}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs font-medium">Cards Reviewed</span>
          </div>
          <p className="text-2xl font-bold">{stats.flashcardsReviewed}</p>
        </div>
      </div>

      {/* Pinned Tools */}
      {pinned.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            Quick Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {pinned.map(tool => tool && (
              <Link key={tool.id} to={tool.path} className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all text-center">
                <button onClick={(e) => { e.preventDefault(); togglePin(tool.id); }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Unpin tool">
                  <PinOff size={14} className="text-gray-400 hover:text-red-500" />
                </button>
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Calculator size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm font-medium truncate">{tool.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-orange-500" />
            Upcoming Deadlines
          </h2>
          <div className="space-y-2">
            {upcomingDeadlines.map(task => {
              const days = getDaysUntil(task.dueDate);
              return (
                <div key={task.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.subject && <p className="text-xs text-gray-500">{task.subject}</p>}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${days === 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : days <= 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : days <= 7 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                    {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                  </span>
                </div>
              );
            })}
          </div>
          <Link to="/tasks" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">View all tasks →</Link>
        </section>
      )}

      {/* All Tools by Category */}
      <section>
        <h2 className="text-lg font-semibold mb-3">All Tools</h2>
        {CATEGORIES.map(category => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {TOOLS.filter(t => t.category === category).map(tool => (
                <Link key={tool.id} to={tool.path} className="group flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-xs text-gray-500 truncate">{tool.description}</p>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); togglePin(tool.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-label="Pin tool">
                    <Pin size={14} className={pinnedTools.includes(tool.id) ? 'text-indigo-500' : 'text-gray-400 hover:text-indigo-500'} />
                  </button>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
