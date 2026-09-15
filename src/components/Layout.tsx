import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon, Monitor, Home, Calculator, Timer, CheckSquare, Layers, FileText, Calendar, ChevronRight } from 'lucide-react';
import { TOOLS, searchTools } from '../data/tools';
import { useTheme, useKeyboardShortcut } from '../hooks';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [cmdIndex, setCmdIndex] = useState(0);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const cmdInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useKeyboardShortcut('k', () => setCmdOpen(true), { ctrl: true });

  useEffect(() => {
    if (cmdOpen && cmdInputRef.current) cmdInputRef.current.focus();
  }, [cmdOpen]);

  const results = searchTools(cmdQuery);
  const allItems = cmdQuery.trim() ? results : TOOLS.slice(0, 12);

  useEffect(() => { setCmdIndex(0); }, [cmdQuery]);

  const navigateTo = useCallback((path: string) => {
    navigate(path);
    setCmdOpen(false);
    setCmdQuery('');
  }, [navigate]);

  const handleCmdKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCmdIndex(i => Math.min(i + 1, allItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCmdIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && allItems[cmdIndex]) { navigateTo(allItems[cmdIndex].path); }
    else if (e.key === 'Escape') { setCmdOpen(false); }
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/timer', icon: Timer, label: 'Timer' },
    { path: '/flashcards', icon: Layers, label: 'Cards' },
    { path: '/planner', icon: Calendar, label: 'Plan' },
  ];

  const themeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <Link to="/" className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">StudyScope</Link>
        <div className="flex gap-1">
          <button onClick={() => setCmdOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Search">
            <Search size={20} />
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Toggle theme">
            <ThemeIcon size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">StudyScope</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X size={20} /></button>
        </div>
        
        {/* Search */}
        <div className="p-3">
          <button onClick={() => setCmdOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Search size={16} className="text-gray-400" />
            <span className="text-gray-500">Search tools...</span>
            <kbd className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 pb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Quick Access</p>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === item.path ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          <Link to="/settings" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === '/settings' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
            <Monitor size={18} />
            Settings
          </Link>
        </nav>

        {/* Tools by Category */}
        <div className="px-3 pb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">All Tools</p>
          {['Math', 'Study', 'Writing', 'Planning', 'Productivity', 'Utilities', 'Converters'].map(cat => (
            <details key={cat} className="mb-1">
              <summary className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <ChevronRight size={14} className="transition-transform" />
                {cat}
              </summary>
              <div className="ml-2 mt-0.5">
                {TOOLS.filter(t => t.category === cat).map(tool => (
                  <Link key={tool.id} to={tool.path} className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${location.pathname === tool.path ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}`}>
                    {tool.name}
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-center gap-1">
            {(['light', 'system', 'dark'] as const).map(t => (
              <button key={t} onClick={() => setTheme(t)} className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs rounded-lg transition-colors ${theme === t ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t === 'light' ? <Sun size={14} /> : t === 'dark' ? <Moon size={14} /> : <Monitor size={14} />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 flex justify-around py-2 px-2">
        {navItems.map(item => (
          <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${location.pathname === item.path ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Command Palette */}
      {cmdOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4" onClick={() => setCmdOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <Search size={20} className="text-gray-400 shrink-0" />
              <input
                ref={cmdInputRef}
                type="text"
                value={cmdQuery}
                onChange={e => setCmdQuery(e.target.value)}
                onKeyDown={handleCmdKeyDown}
                placeholder="Search tools..."
                className="flex-1 bg-transparent outline-none text-lg placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
              />
              <kbd className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {allItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tools found</p>
              ) : (
                allItems.map((tool, i) => (
                  <button
                    key={tool.id}
                    onClick={() => navigateTo(tool.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${i === cmdIndex ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <Calculator size={16} className="text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tool.name}</p>
                      <p className="text-xs text-gray-500 truncate">{tool.description}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{tool.category}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
