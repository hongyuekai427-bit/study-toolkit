import { useState, useCallback } from 'react';
import { evaluate, formatResult } from '../lib/math-parser';
import { Delete, RotateCcw, History, Copy, Check } from 'lucide-react';
import { useLocalStorage } from '../hooks';

interface HistoryEntry { expression: string; result: string; timestamp: number; }

export default function CalculatorPage() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useLocalStorage<'deg' | 'rad'>('calcMode', 'deg');
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('calcHistory', []);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const calculate = useCallback(() => {
    if (!expression.trim()) return;
    try {
      const res = evaluate(expression, mode === 'deg');
      const formatted = formatResult(res);
      setResult(formatted);
      setError('');
      setHistory(prev => [{ expression, result: formatted, timestamp: Date.now() }, ...prev].slice(0, 50));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid expression');
      setResult('');
    }
  }, [expression, mode, setHistory]);

  const handleInput = (val: string) => {
    setExpression(prev => prev + val);
    setError('');
  };

  const handleBackspace = () => {
    setExpression(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
    setError('');
  };

  const handleEquals = () => {
    calculate();
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const useHistoryEntry = (entry: HistoryEntry) => {
    setExpression(entry.expression);
    setResult(entry.result);
    setShowHistory(false);
  };

  const buttons = [
    { label: 'sin', action: () => handleInput('sin('), class: 'func' },
    { label: 'cos', action: () => handleInput('cos('), class: 'func' },
    { label: 'tan', action: () => handleInput('tan('), class: 'func' },
    { label: 'π', action: () => handleInput('pi'), class: 'func' },
    { label: 'log', action: () => handleInput('log('), class: 'func' },
    { label: 'ln', action: () => handleInput('ln('), class: 'func' },
    { label: '√', action: () => handleInput('sqrt('), class: 'func' },
    { label: 'e', action: () => handleInput('e'), class: 'func' },
    { label: 'x²', action: () => handleInput('^2'), class: 'func' },
    { label: 'xʸ', action: () => handleInput('^'), class: 'func' },
    { label: '(', action: () => handleInput('('), class: 'paren' },
    { label: ')', action: () => handleInput(')'), class: 'paren' },
    { label: '7', action: () => handleInput('7'), class: 'num' },
    { label: '8', action: () => handleInput('8'), class: 'num' },
    { label: '9', action: () => handleInput('9'), class: 'num' },
    { label: '÷', action: () => handleInput('/'), class: 'op' },
    { label: '4', action: () => handleInput('4'), class: 'num' },
    { label: '5', action: () => handleInput('5'), class: 'num' },
    { label: '6', action: () => handleInput('6'), class: 'num' },
    { label: '×', action: () => handleInput('*'), class: 'op' },
    { label: '1', action: () => handleInput('1'), class: 'num' },
    { label: '2', action: () => handleInput('2'), class: 'num' },
    { label: '3', action: () => handleInput('3'), class: 'num' },
    { label: '−', action: () => handleInput('-'), class: 'op' },
    { label: '0', action: () => handleInput('0'), class: 'num' },
    { label: '.', action: () => handleInput('.'), class: 'num' },
    { label: '%', action: () => handleInput('%'), class: 'op' },
    { label: '+', action: () => handleInput('+'), class: 'op' },
    { label: 'n!', action: () => handleInput('factorial('), class: 'func' },
    { label: 'C', action: handleClear, class: 'clear' },
    { label: '⌫', action: handleBackspace, class: 'clear' },
    { label: '=', action: handleEquals, class: 'equals' },
  ];

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-6">Calculator</h1>

      {/* Mode Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setMode('deg')} className={`px-3 py-1 text-sm rounded-lg ${mode === 'deg' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>DEG</button>
        <button onClick={() => setMode('rad')} className={`px-3 py-1 text-sm rounded-lg ${mode === 'rad' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>RAD</button>
        <button onClick={() => setShowHistory(!showHistory)} className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Toggle history">
          <History size={18} className={showHistory ? 'text-indigo-500' : 'text-gray-500'} />
        </button>
      </div>

      {/* Display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="text-right">
          <p className="text-sm text-gray-500 min-h-[1.5rem] font-mono break-all">{expression || '0'}</p>
          {error ? (
            <p className="text-red-500 text-lg font-mono">{error}</p>
          ) : result ? (
            <div className="flex items-center justify-end gap-2">
              <p className="text-3xl font-bold font-mono">{result}</p>
              <button onClick={copyResult} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Copy result">
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
              </button>
            </div>
          ) : (
            <p className="text-3xl font-bold font-mono text-gray-300 dark:text-gray-600">0</p>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">History</h3>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No calculations yet</p>
          ) : (
            history.map((entry, i) => (
              <button key={i} onClick={() => useHistoryEntry(entry)} className="w-full text-left py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center justify-between">
                <span className="text-gray-500 font-mono truncate mr-2">{entry.expression}</span>
                <span className="font-mono font-medium shrink-0">= {entry.result}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`py-3 rounded-xl font-medium text-sm transition-all active:scale-95 ${
              btn.class === 'num' ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700' :
              btn.class === 'op' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60' :
              btn.class === 'func' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40' :
              btn.class === 'paren' ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600' :
              btn.class === 'clear' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40' :
              btn.class === 'equals' ? 'bg-indigo-600 text-white hover:bg-indigo-700 col-span-1' :
              'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            } ${btn.label === '=' ? 'row-span-1' : ''}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
