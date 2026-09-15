import { useState } from 'react';
import { parseMixedNumber, addFractions, subtractFractions, multiplyFractions, divideFractions, fractionToString, fractionToMixed, fractionToDecimal, simplifyFraction, type Fraction } from '../lib/math-parser';

export default function FractionCalcPage() {
  const [fracA, setFracA] = useState('');
  const [fracB, setFracB] = useState('');
  const [operation, setOperation] = useState<'+' | '-' | '×' | '÷'>('+');
  const [result, setResult] = useState<{ simplified: string; mixed: string; decimal: string; steps: string } | null>(null);
  const [error, setError] = useState('');

  const calculate = () => {
    try {
      setError('');
      const a = parseMixedNumber(fracA);
      const b = parseMixedNumber(fracB);
      let res: Fraction;
      let opSymbol: string;

      switch (operation) {
        case '+': res = addFractions(a, b); opSymbol = '+'; break;
        case '-': res = subtractFractions(a, b); opSymbol = '−'; break;
        case '×': res = multiplyFractions(a, b); opSymbol = '×'; break;
        case '÷': res = divideFractions(a, b); opSymbol = '÷'; break;
        default: throw new Error('Invalid operation');
      }

      const simplified = simplifyFraction(res);
      setResult({
        simplified: fractionToString(res),
        mixed: fractionToMixed(res),
        decimal: fractionToDecimal(res),
        steps: `${fractionToString(a)} ${opSymbol} ${fractionToString(b)} = ${fractionToString(simplified)}`
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input');
      setResult(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Fraction Calculator</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Add, subtract, multiply, and divide fractions. Use formats: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">3/4</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">2 3/4</code>, or <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">5</code></p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <input type="text" value={fracA} onChange={e => setFracA(e.target.value)} placeholder="e.g. 3/4" className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={operation} onChange={e => setOperation(e.target.value as '+' | '-' | '×' | '÷')} className="px-3 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="+">+</option>
            <option value="-">−</option>
            <option value="×">×</option>
            <option value="÷">÷</option>
          </select>
          <input type="text" value={fracB} onChange={e => setFracB(e.target.value)} placeholder="e.g. 5/8" className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <button onClick={calculate} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Calculate</button>

        {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}

        {result && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Working:</p>
            <p className="font-mono text-sm mb-3">{result.steps}</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Simplified:</span><span className="font-mono font-bold">{result.simplified}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Mixed number:</span><span className="font-mono font-bold">{result.mixed}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Decimal:</span><span className="font-mono font-bold">{result.decimal}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
