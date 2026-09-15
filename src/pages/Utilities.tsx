import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Download, Upload, Database, Settings as SettingsIcon, AlertTriangle, BookOpen } from 'lucide-react';
import { dbGetAll, dbPut, dbDelete, exportAllData, importAllData, clearAllData } from '../lib/storage';
import type { Reference } from '../types';
import { v4 as uuid } from 'uuid';

// QR Code Generator
export function QRCodePage() {
  const [text, setText] = useState('https://');
  const [qrUrl, setQrUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    if (!text.trim()) return;
    try {
      const QRCode = await import('qrcode');
      const url = await QRCode.toDataURL(text, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
      setQrUrl(url);
    } catch {
      setQrUrl('');
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">QR Code Generator</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Generate QR codes locally. Your data is never sent to external services.</p>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Enter text, URL, or other data..." rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4" />
        <button onClick={generateQR} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 mb-4">Generate QR Code</button>
        {qrUrl && (
          <div className="text-center">
            <img src={qrUrl} alt="QR Code" className="mx-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-3" />
            <button onClick={downloadQR} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 mx-auto"><Download size={16} /> Download PNG</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Data Table
export function DataTablePage() {
  const [data, setData] = useState<string[][]>([['', '', ''], ['', '', ''], ['', '', '']]);
  const [csvText, setCsvText] = useState('');

  const updateCell = (row: number, col: number, value: string) => {
    setData(prev => prev.map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? value : c) : r));
  };

  const addRow = () => setData(prev => [...prev, Array(prev[0]?.length || 3).fill('')]);
  const addCol = () => setData(prev => prev.map(r => [...r, '']));
  const removeRow = (i: number) => setData(prev => prev.filter((_, ri) => ri !== i));

  const importCSV = () => {
    const rows = csvText.trim().split('\n').map(r => r.split(',').map(c => c.trim()));
    if (rows.length > 0) setData(rows);
  };

  const exportCSV = () => {
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'data.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Data Table</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">A lightweight table for organizing data. Import/export CSV.</p>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto mb-4">
        <table className="w-full">
          <tbody>
            {data.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1">
                    <input type="text" value={cell} onChange={e => updateCell(ri, ci, e.target.value)} className="w-full min-w-[80px] px-2 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </td>
                ))}
                <td className="p-1"><button onClick={() => removeRow(ri)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={addRow} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">+ Row</button>
        <button onClick={addCol} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">+ Column</button>
        <button onClick={exportCSV} className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm">Export CSV</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold mb-2">Import CSV</h3>
        <textarea value={csvText} onChange={e => setCsvText(e.target.value)} placeholder="Paste CSV data here..." rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm resize-none mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button onClick={importCSV} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Import</button>
      </div>
    </div>
  );
}

// Charts
export function ChartsPage() {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [labels, setLabels] = useState('A,B,C,D,E');
  const [values, setValues] = useState('10,25,15,30,20');
  const [title, setTitle] = useState('My Chart');

  const labelArr = labels.split(',').map(l => l.trim()).filter(Boolean);
  const valueArr = values.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  const maxVal = Math.max(...valueArr, 1);
  const total = valueArr.reduce((s, v) => s + v, 0);

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Chart Builder</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Create simple charts from your data.</p>
      <div className="flex gap-2 mb-4">
        {(['bar', 'line', 'pie'] as const).map(t => (
          <button key={t} onClick={() => setChartType(t)} className={`px-3 py-1.5 text-sm rounded-lg capitalize ${chartType === t ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>{t}</button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Chart title" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500 block mb-1">Labels (comma separated)</label><input type="text" value={labels} onChange={e => setLabels(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div><label className="text-xs text-gray-500 block mb-1">Values (comma separated)</label><input type="text" value={values} onChange={e => setValues(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-center font-semibold mb-4">{title}</h3>
        {chartType === 'bar' && valueArr.length > 0 && (
          <div className="flex items-end justify-center gap-3 h-48">
            {valueArr.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{v}</span>
                <div className="w-10 rounded-t" style={{ height: `${maxVal > 0 ? (v / maxVal) * 160 : 0}px`, backgroundColor: colors[i % colors.length] }} />
                <span className="text-xs text-gray-500">{labelArr[i] || ''}</span>
              </div>
            ))}
          </div>
        )}
        {chartType === 'line' && valueArr.length > 0 && (
          <svg viewBox="0 0 400 200" className="w-full h-48">
            {valueArr.length > 1 && (
              <polyline fill="none" stroke="#6366f1" strokeWidth="2" points={valueArr.map((v, i) => `${(i / (valueArr.length - 1)) * 380 + 10},${180 - (v / maxVal) * 160}`).join(' ')} />
            )}
            {valueArr.map((v, i) => {
              const cx = valueArr.length > 1 ? (i / (valueArr.length - 1)) * 380 + 10 : 200;
              const cy = 180 - (v / maxVal) * 160;
              return <circle key={i} cx={cx} cy={cy} r="4" fill="#6366f1" />;
            })}
          </svg>
        )}
        {chartType === 'pie' && total > 0 && (
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48">
              {(() => {
                let startAngle = 0;
                return valueArr.map((v, i) => {
                  const angle = (v / total) * 360;
                  if (angle === 0) return null;
                  const endAngle = startAngle + angle;
                  const startRad = (startAngle - 90) * Math.PI / 180;
                  const endRad = (endAngle - 90) * Math.PI / 180;
                  const x1 = 100 + 80 * Math.cos(startRad);
                  const y1 = 100 + 80 * Math.sin(startRad);
                  const x2 = 100 + 80 * Math.cos(endRad);
                  const y2 = 100 + 80 * Math.sin(endRad);
                  const largeArc = angle > 180 ? 1 : 0;
                  const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  startAngle = endAngle;
                  return <path key={i} d={path} fill={colors[i % colors.length]} />;
                });
              })()}
            </svg>
            <div className="ml-4 space-y-1">
              {labelArr.map((l, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span>{l}: {valueArr[i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// File Tools
export function FileToolsPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json' | 'csv' | 'base64'>('json');

  const process = () => {
    try {
      switch (mode) {
        case 'json':
          setOutput(JSON.stringify(JSON.parse(input), null, 2));
          break;
        case 'csv': {
          const rows = input.trim().split('\n').map(r => r.split(',').map(c => c.trim()));
          setOutput(JSON.stringify(rows, null, 2));
          break;
        }
        case 'base64':
          setOutput(btoa(input));
          break;
      }
    } catch (e) {
      setOutput(`Error: ${e instanceof Error ? e.message : 'Invalid input'}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">File Tools</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-2">Format JSON, parse CSV, encode text. All processing happens locally in your browser.</p>
      <p className="text-xs text-gray-400 mb-6">Your file data is never uploaded to any server.</p>
      <div className="flex gap-2 mb-4">
        {(['json', 'csv', 'base64'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 text-sm rounded-lg uppercase ${mode === m ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>{m === 'json' ? 'JSON Formatter' : m === 'csv' ? 'CSV → JSON' : 'Base64 Encode'}</button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={`Paste ${mode === 'json' ? 'JSON' : mode === 'csv' ? 'CSV' : 'text'} here...`} rows={8} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-mono resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button onClick={process} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 mb-3">Process</button>
        {output && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// References
export function ReferencesPage() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({ title: '', author: '', website: '', url: '', date: '', accessDate: '', notes: '', tags: '' });

  useEffect(() => { loadReferences(); }, []);

  const loadReferences = async () => {
    const data = await dbGetAll<Reference>('references');
    setReferences(data);
  };

  const saveReference = async () => {
    if (!form.title.trim()) return;
    const ref: Reference = {
      id: uuid(), title: form.title.trim(), author: form.author.trim(), website: form.website.trim(),
      url: form.url.trim(), date: form.date, accessDate: form.accessDate, notes: form.notes.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), citation: '', createdAt: new Date().toISOString(),
    };
    await dbPut('references', ref);
    setForm({ title: '', author: '', website: '', url: '', date: '', accessDate: '', notes: '', tags: '' });
    setShowForm(false);
    loadReferences();
  };

  const deleteReference = async (id: string) => {
    await dbDelete('references', id);
    loadReferences();
  };

  const filtered = references.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">References</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><Plus size={16} /> Add</button>
      </div>
      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search references..." className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 space-y-3">
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title *" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Author" className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="Website" className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="URL" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={saveReference} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Save Reference</button>
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500"><BookOpen size={40} className="mx-auto mb-3 opacity-50" /><p>No references saved</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ref => (
            <div key={ref.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{ref.title}</p>
                  {ref.author && <p className="text-xs text-gray-500">{ref.author}</p>}
                  {ref.url && <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline truncate block max-w-xs">{ref.url}</a>}
                  {ref.tags.length > 0 && <div className="flex gap-1 mt-1">{ref.tags.map(t => <span key={t} className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">#{t}</span>)}</div>}
                </div>
                <button onClick={() => deleteReference(ref.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} className="text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings & Data Management
export function SettingsPage() {
  const [importStatus, setImportStatus] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyscope-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = await importAllData(text);
    setImportStatus(result.success ? '✓ Data imported successfully. Reload to see changes.' : `✗ ${result.error}`);
  };

  const handleClearAll = async () => {
    await clearAllData();
    setShowConfirmClear(false);
    setImportStatus('✓ All data cleared. Reload the page.');
  };

  const clearStats = () => {
    localStorage.removeItem('studyscope_stats');
    setImportStatus('✓ Statistics cleared.');
  };

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your data and application settings.</p>

      <div className="space-y-4">
        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Database size={20} /> Data Management</h2>
          <p className="text-sm text-gray-500 mb-4">All your data is stored locally in your browser. Export to create a backup or import a previous backup.</p>
          <div className="space-y-3">
            <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Download size={18} /> Export All Data</button>
            <input type="file" ref={fileInputRef} accept=".json" onChange={handleImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"><Upload size={18} /> Import Data</button>
            <button onClick={clearStats} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">Clear Statistics Only</button>
          </div>
          {importStatus && <p className={`mt-3 text-sm ${importStatus.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{importStatus}</p>}
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-600"><AlertTriangle size={20} /> Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">This will permanently delete all your data including notes, tasks, flashcards, projects, and settings.</p>
          {showConfirmClear ? (
            <div className="space-y-2">
              <p className="text-sm text-red-600 font-medium">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={handleClearAll} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Yes, Delete Everything</button>
                <button onClick={() => setShowConfirmClear(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowConfirmClear(true)} className="w-full py-2 border border-red-300 dark:border-red-700 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm">Clear All Data</button>
          )}
        </div>

        {/* Privacy */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-2">Privacy</h2>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>✓ No tracking or analytics</li>
            <li>✓ No advertising</li>
            <li>✓ No account required</li>
            <li>✓ No data sent to servers</li>
            <li>✓ All data stored locally</li>
            <li>✓ Works offline</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
