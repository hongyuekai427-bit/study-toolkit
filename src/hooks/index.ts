import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const fullKey = `studyscope_${key}`;
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      try {
        localStorage.setItem(fullKey, JSON.stringify(newValue));
      } catch { /* quota exceeded */ }
      return newValue;
    });
  }, [fullKey]);

  return [storedValue, setValue];
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('theme', 'system');
  const [highContrast, setHighContrast] = useLocalStorage('highContrast', false);

  useEffect(() => {
    const root = document.documentElement;
    const resolvedTheme = theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [theme, highContrast]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return { theme, setTheme, highContrast, setHighContrast };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function useAutosave<T>(data: T, onSave: (data: T) => void, delay: number = 1000) {
  const debouncedData = useDebounce(data, delay);
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSave(debouncedData);
  }, [debouncedData, onSave]);
}

export function useKeyboardShortcut(key: string, callback: () => void, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (modifiers.ctrl && !e.ctrlKey && !e.metaKey) return;
      if (modifiers.shift && !e.shiftKey) return;
      if (modifiers.alt && !e.altKey) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifiers]);
}

export function useTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const start = useCallback((seconds: number, onComplete?: () => void) => {
    setTimeLeft(seconds);
    setIsRunning(true);
    onCompleteRef.current = onComplete || null;
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  return { timeLeft, isRunning, start, pause, resume, reset };
}
