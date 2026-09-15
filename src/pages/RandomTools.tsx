import { useState } from 'react';
import { Key, Shuffle, Copy, Check, Dices } from 'lucide-react';

export function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [passphrase, setPassphrase] = useState(false);
  const [wordCount, setWordCount] = useState(4);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const words = ['apple', 'brave', 'cloud', 'dance', 'eagle', 'flame', 'grape', 'house', 'ivory', 'joker', 'kneel', 'light', 'maple', 'noble', 'ocean', 'pearl', 'quiet', 'river', 'stone', 'tiger', 'unity', 'vivid', 'water', 'xenon', 'yacht', 'zebra', 'amber', 'birch', 'coral', 'delta', 'ember', 'frost', 'glide', 'haven', 'index', 'jewel', 'karma', 'lunar', 'mocha', 'north', 'orbit', 'prism', 'quest', 'ridge', 'solar', 'thorn', 'ultra', 'vault', 'whirl', 'pixel'];

  const generate = () => {
    if (passphrase) {
      const selected: string[] = [];
      const array = new Uint32Array(wordCount);
      crypto.getRandomValues(array);
      for (let i = 0; i < wordCount; i++) {
        selected.push(words[array[i] % words.length]);
      }
      setPassword(selected.join('-'));
      return;
    }
    let chars = '';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) { setPassword('Select at least one option'); return; }
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) result += chars[array[i] % chars.length];
    setPassword(result);
  };

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Password Generator</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Generate secure passwords locally in your browser. Passwords are never stored or sent anywhere.</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {password && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <code className="flex-1 text-sm font-mono break-all">{password}</code>
            <button onClick={copy} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 shrink-0">
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
            </button>
          </div>
        )}

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={passphrase} onChange={e => setPassphrase(e.target.checked)} className="rounded" />
            <span className="text-sm">Generate passphrase instead</span>
          </label>

          {!passphrase ? (
            <>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Length: {length}</label>
                <input type="range" min="4" max="64" value={length} onChange={e => setLength(parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} className="rounded" /> Uppercase</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={lowercase} onChange={e => setLowercase(e.target.checked)} className="rounded" /> Lowercase</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={numbers} onChange={e => setNumbers(e.target.checked)} className="rounded" /> Numbers</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={symbols} onChange={e => setSymbols(e.target.checked)} className="rounded" /> Symbols</label>
              </div>
            </>
          ) : (
            <div>
              <label className="text-sm text-gray-500 block mb-1">Word count: {wordCount}</label>
              <input type="range" min="3" max="8" value={wordCount} onChange={e => setWordCount(parseInt(e.target.value))} className="w-full" />
            </div>
          )}
        </div>

        <button onClick={generate} className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
          <Key size={18} /> Generate
        </button>
      </div>
    </div>
  );
}

export function RandomToolsPage() {
  const [mode, setMode] = useState<'number' | 'choice' | 'dice' | 'coin' | 'team'>('number');
  const [result, setResult] = useState('');
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [choices, setChoices] = useState('');
  const [teamCount, setTeamCount] = useState('2');
  const [members, setMembers] = useState('');

  const generate = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const rand = array[0] / (0xFFFFFFFF + 1);

    switch (mode) {
      case 'number': {
        const lo = parseInt(min) || 0;
        const hi = parseInt(max) || 100;
        setResult(`${Math.floor(rand * (hi - lo + 1)) + lo}`);
        break;
      }
      case 'choice': {
        const opts = choices.split('\n').filter(c => c.trim());
        if (opts.length === 0) { setResult('Add some choices'); return; }
        setResult(opts[Math.floor(rand * opts.length)]);
        break;
      }
      case 'dice': {
        const dice = Math.floor(rand * 6) + 1;
        const emojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        setResult(`${emojis[dice]} ${dice}`);
        break;
      }
      case 'coin': {
        setResult(rand < 0.5 ? '🪙 Heads' : '🪙 Tails');
        break;
      }
      case 'team': {
        const mems = members.split('\n').filter(m => m.trim());
        const tc = parseInt(teamCount) || 2;
        if (mems.length === 0) { setResult('Add members'); return; }
        const shuffled = [...mems].sort(() => rand - 0.5);
        const teams: string[][] = Array.from({ length: tc }, () => []);
        shuffled.forEach((m, i) => teams[i % tc].push(m));
        setResult(teams.map((t, i) => `Team ${i + 1}: ${t.join(', ')}`).join('\n'));
        break;
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Random Tools</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Generate random numbers, choices, dice rolls, and teams.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['number', 'choice', 'dice', 'coin', 'team'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(''); }} className={`px-3 py-1.5 text-sm rounded-lg capitalize ${mode === m ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{m === 'team' ? 'Teams' : m}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {mode === 'number' && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className="text-xs text-gray-500 block mb-1">Min</label><input type="number" value={min} onChange={e => setMin(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Max</label><input type="number" value={max} onChange={e => setMax(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" /></div>
          </div>
        )}
        {mode === 'choice' && <textarea value={choices} onChange={e => setChoices(e.target.value)} placeholder="One option per line" rows={4} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 mb-4 resize-none" />}
        {mode === 'team' && (
          <div className="space-y-3 mb-4">
            <div><label className="text-xs text-gray-500 block mb-1">Number of teams</label><input type="number" min="2" value={teamCount} onChange={e => setTeamCount(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Members (one per line)</label><textarea value={members} onChange={e => setMembers(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 resize-none" /></div>
          </div>
        )}

        <button onClick={generate} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
          <Shuffle size={18} /> Generate
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <pre className="font-mono text-lg font-bold whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
