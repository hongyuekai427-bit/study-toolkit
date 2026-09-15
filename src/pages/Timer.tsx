import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Maximize, Minimize } from 'lucide-react';
import { useLocalStorage } from '../hooks';

type TimerMode = 'focus' | 'short-break' | 'long-break' | 'custom';

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [focusDuration, setFocusDuration] = useLocalStorage('pomodoroFocus', 25);
  const [shortBreakDuration, setShortBreakDuration] = useLocalStorage('pomodoroShortBreak', 5);
  const [longBreakDuration, setLongBreakDuration] = useLocalStorage('pomodoroLongBreak', 15);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useLocalStorage('pomodoroSessions', 4);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocusToday, setTotalFocusToday] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [label, setLabel] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef = useRef(mode);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const key = `studyscope_focus_${today}`;
    setTotalFocusToday(parseInt(localStorage.getItem(key) || '0'));
    const sessKey = `studyscope_sessions_${today}`;
    setSessions(parseInt(localStorage.getItem(sessKey) || '0'));
  }, []);

  const getDuration = useCallback(() => {
    switch (modeRef.current) {
      case 'focus': return focusDuration * 60;
      case 'short-break': return shortBreakDuration * 60;
      case 'long-break': return longBreakDuration * 60;
      case 'custom': return customMinutes * 60;
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration, customMinutes]);

  const handleComplete = useCallback(() => {
    const currentMode = modeRef.current;
    if (currentMode === 'focus' || currentMode === 'custom') {
      const durationMin = Math.round(initialTime / 60);
      const today = new Date().toISOString().split('T')[0];
      const key = `studyscope_focus_${today}`;
      const current = parseInt(localStorage.getItem(key) || '0');
      localStorage.setItem(key, (current + durationMin).toString());
      setTotalFocusToday(current + durationMin);
      
      const sessKey = `studyscope_sessions_${today}`;
      const sessCurrent = parseInt(localStorage.getItem(sessKey) || '0');
      localStorage.setItem(sessKey, (sessCurrent + 1).toString());
      setSessions(sessCurrent + 1);

      // Update global stats
      try {
        const stats = JSON.parse(localStorage.getItem('studyscope_stats') || '{}');
        stats.totalFocusTime = (stats.totalFocusTime || 0) + durationMin;
        stats.sessionsCompleted = (stats.sessionsCompleted || 0) + 1;
        localStorage.setItem('studyscope_stats', JSON.stringify(stats));
      } catch { /* ignore */ }
    }

    // Play notification sound
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, 300);
    } catch { /* ignore */ }
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Use setTimeout to avoid state update during render
            setTimeout(() => handleComplete(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, handleComplete]);

  const startTimer = () => {
    const duration = getDuration();
    setTimeLeft(duration);
    setInitialTime(duration);
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => setIsRunning(true);
  const resetTimer = () => { setIsRunning(false); setTimeLeft(0); setInitialTime(0); if (intervalRef.current) clearInterval(intervalRef.current); };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`max-w-lg mx-auto pb-20 lg:pb-0 ${isFullscreen ? 'max-w-none flex flex-col items-center justify-center min-h-screen' : ''}`}>
      <h1 className="text-2xl font-bold mb-6">Study Timer</h1>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { id: 'focus' as TimerMode, label: 'Focus' },
          { id: 'short-break' as TimerMode, label: 'Short Break' },
          { id: 'long-break' as TimerMode, label: 'Long Break' },
          { id: 'custom' as TimerMode, label: 'Custom' },
        ]).map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); resetTimer(); }}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${mode === m.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Focus (min)</label>
            <input type="number" min={1} max={120} value={focusDuration} onChange={e => setFocusDuration(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Short Break (min)</label>
            <input type="number" min={1} max={30} value={shortBreakDuration} onChange={e => setShortBreakDuration(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Long Break (min)</label>
            <input type="number" min={1} max={60} value={longBreakDuration} onChange={e => setLongBreakDuration(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Sessions before long</label>
            <input type="number" min={1} max={10} value={sessionsBeforeLong} onChange={e => setSessionsBeforeLong(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {mode === 'custom' && (
          <div className="mb-4">
            <label className="text-xs text-gray-500 block mb-1">Custom Duration (min)</label>
            <input type="number" min={1} max={240} value={customMinutes} onChange={e => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}

        <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Session label (e.g. Physics revision)" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
      </div>

      {/* Timer Display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center mb-6">
        {label && <p className="text-sm text-gray-500 mb-2">{label}</p>}
        <div className="relative inline-block mb-4">
          <svg className="w-48 h-48" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`} strokeLinecap="round" className="text-indigo-500 transition-all duration-1000" transform="rotate(-90 50 50)" />
          </svg>
          <p className="absolute inset-0 flex items-center justify-center text-4xl font-bold font-mono">{formatTime(timeLeft)}</p>
        </div>

        <div className="flex justify-center gap-3">
          {!isRunning && timeLeft === 0 && (
            <button onClick={startTimer} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              <Play size={20} /> Start
            </button>
          )}
          {isRunning && (
            <button onClick={pauseTimer} className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
              <Pause size={20} /> Pause
            </button>
          )}
          {!isRunning && timeLeft > 0 && (
            <>
              <button onClick={resumeTimer} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                <Play size={20} /> Resume
              </button>
              <button onClick={resetTimer} className="flex items-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <RotateCcw size={20} />
              </button>
            </>
          )}
          <button onClick={toggleFullscreen} className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label="Toggle fullscreen">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold">{sessions}</p>
          <p className="text-xs text-gray-500">Sessions Today</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold">{totalFocusToday}m</p>
          <p className="text-xs text-gray-500">Focus Time Today</p>
        </div>
      </div>
    </div>
  );
}
