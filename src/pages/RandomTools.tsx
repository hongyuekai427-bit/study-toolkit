import { useState } from 'react';
import { Shuffle, Shield, Lock } from 'lucide-react';

/**
 * Check if Web Crypto API is available
 */
function isWebCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function';
}

export function RandomToolsPage() {
  const [mode, setMode] = useState<'number' | 'choice' | 'dice' | 'coin' | 'team'>('number');
  const [result, setResult] = useState('');
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [choices, setChoices] = useState('');
  const [teamCount, setTeamCount] = useState('2');
  const [members, setMembers] = useState('');
  const [cryptoAvailable] = useState(isWebCryptoAvailable());
  const [generationCount, setGenerationCount] = useState(0);

  /**
   * Cryptographically secure random integer in range [0, max) using rejection sampling.
   * 
   * This implementation:
   * - Uses Web Crypto API (crypto.getRandomValues) for true cryptographic randomness
   * - Implements rejection sampling to eliminate modulo bias
   * - Ensures uniform distribution across all possible values
   * - Is unpredictable and cannot be reconstructed
   * 
   * Why rejection sampling?
   * - Simple modulo (value % max) introduces bias when max doesn't evenly divide 2^32
   * - Rejection sampling rejects values that would cause bias, ensuring perfect uniformity
   */
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

  /**
   * Fisher-Yates shuffle using cryptographically secure random numbers.
   * Ensures unbiased random permutation of array elements.
   */
  const secureShuffle = <T,>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = secureRandInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const generate = () => {
    if (!cryptoAvailable) {
      setResult('Error: Web Crypto API not available');
      return;
    }

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
    setGenerationCount(prev => prev + 1);
  };

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold">Random Tools</h1>
        {cryptoAvailable && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
            <Shield size={12} />
            <span>Secure</span>
          </div>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Generate cryptographically secure random numbers, choices, dice rolls, and teams.
      </p>

      {/* Cryptographic Security Verification */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-3">
          <Lock size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
              Cryptographic Security
            </h3>
            <div className="space-y-1.5 text-xs text-indigo-800 dark:text-indigo-200">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${cryptoAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Web Crypto API: {cryptoAvailable ? 'Available ✓' : 'Not Available ✗'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Rejection Sampling: Active (eliminates modulo bias)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Entropy Source: crypto.getRandomValues() (CSPRNG)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>Generations: {generationCount}</span>
              </div>
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2 italic">
              All random values are cryptographically secure and unpredictable.
            </p>
          </div>
        </div>
      </div>

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

      {/* Security Documentation */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Shield size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-2">Why This Is Truly Secure:</p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Cryptographic Randomness:</strong> Uses browser's Web Crypto API (crypto.getRandomValues), which is a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) backed by OS-level entropy sources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>No Math.random():</strong> Unlike Math.random(), which is predictable and not secure, crypto.getRandomValues() generates unpredictable values</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Rejection Sampling:</strong> Eliminates modulo bias by rejecting values that would create uneven distribution, ensuring perfect uniformity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Unpredictable:</strong> Each generated value cannot be predicted, reconstructed, or reverse-engineered from previous outputs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Fisher-Yates Shuffle:</strong> Team generation uses cryptographically secure shuffle for unbiased random permutation</span>
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="font-semibold mb-1">Use Cases:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Random number generation for games, lotteries, or decisions</li>
                <li>Unbiased random selection from a list of choices</li>
                <li>Fair dice rolls and coin flips</li>
                <li>Random team assignments for groups or activities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
