import { useState } from 'react';
import { Shuffle } from 'lucide-react';

export function RandomToolsPage() {
  const [mode, setMode] = useState<'number' | 'choice' | 'dice' | 'coin' | 'team'>('number');
  const [result, setResult] = useState('');
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [choices, setChoices] = useState('');
  const [teamCount, setTeamCount] = useState('2');
  const [members, setMembers] = useState('');

  // Secure random integer in range [0, max) using rejection sampling
  const secureRandInt = (max: number): number => {
    if (max <= 1) return 0;
    const array = new Uint32Array(1);
    const limit = Math.floor(0xFFFFFFFF / max) * max;
    let value: number;
    do {
      crypto.getRandomValues(array);
      value = array[0];
    } while (value >= limit);
    return value % max;
  };

  // Fisher-Yates shuffle using secure random
  const secureShuffle = <T,>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = secureRandInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const generate = () => {
    switch (mode) {
      case 'number': {
        const lo = parseInt(min) || 0;
        const hi = parseInt(max) || 100;
        if (lo > hi) { setResult('Min must be ≤ Max'); return; }
        const range = hi - lo + 1;
        setResult(`${secureRandInt(range) + lo}`);
        break;
      }
      case 'choice': {
        const opts = choices.split('\n').filter(c => c.trim());
        if (opts.length === 0) { setResult('Add some choices'); return; }
        setResult(opts[secureRandInt(opts.length)]);
        break;
      }
      case 'dice': {
        const dice = secureRandInt(6) + 1;
        const emojis = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        setResult(`${emojis[dice]} ${dice}`);
        break;
      }
      case 'coin': {
        setResult(secureRandInt(2) === 0 ? '🪙 Heads' : '🪙 Tails');
        break;
      }
      case 'team': {
        const mems = members.split('\n').filter(m => m.trim());
        const tc = parseInt(teamCount) || 2;
        if (mems.length === 0) { setResult('Add members'); return; }
        const shuffled = secureShuffle(mems);
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
