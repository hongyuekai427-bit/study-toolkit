import { useState } from 'react';

type PercentMode = 'of' | 'increase' | 'decrease' | 'difference' | 'discount' | 'tax' | 'score';

export default function PercentagePage() {
  const [mode, setMode] = useState<PercentMode>('of');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState('');

  const calculate = () => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na)) { setResult('Enter a valid number'); return; }
    
    try {
      switch (mode) {
        case 'of':
          if (isNaN(nb)) { setResult('Enter a valid number'); return; }
          setResult(`${na}% of ${nb} = ${(na / 100 * nb).toFixed(4).replace(/\.?0+$/, '')}`);
          break;
        case 'increase':
          if (isNaN(nb)) { setResult('Enter a valid number'); return; }
          if (na === 0) { setResult('Original value cannot be zero'); return; }
          const inc = ((nb - na) / na * 100);
          if (!isFinite(inc)) { setResult('Result is undefined'); return; }
          setResult(`${na} → ${nb}\nIncrease = ${inc.toFixed(2)}%`);
          break;
        case 'decrease':
          if (isNaN(nb)) { setResult('Enter a valid number'); return; }
          if (na === 0) { setResult('Original value cannot be zero'); return; }
          const dec = ((na - nb) / na * 100);
          if (!isFinite(dec)) { setResult('Result is undefined'); return; }
          setResult(`${na} → ${nb}\nDecrease = ${dec.toFixed(2)}%`);
          break;
        case 'difference':
          if (isNaN(nb)) { setResult('Enter a valid number'); return; }
          if (na + nb === 0) { setResult('Cannot calculate difference when both values sum to zero'); return; }
          const diff = (Math.abs(na - nb) / ((na + nb) / 2)) * 100;
          if (!isFinite(diff)) { setResult('Result is undefined'); return; }
          setResult(`Percentage difference between ${na} and ${nb} = ${diff.toFixed(2)}%`);
          break;
        case 'discount':
          if (isNaN(nb)) { setResult('Enter a valid number'); return; }
          const saved = na / 100 * nb;
          const final2 = nb - saved;
          setResult(`Original: ${nb}\nDiscount: ${na}%\nYou save: ${saved.toFixed(2)}\nFinal price: ${final2.toFixed(2)}`);
          break;
        case 'tax':
          if (isNaN(nb)) { setResult('Enter a valid number'); return; }
          const tax = na / 100 * nb;
          const total = nb + tax;
          setResult(`Subtotal: ${nb}\nTax (${na}%): ${tax.toFixed(2)}\nTotal: ${total.toFixed(2)}`);
          break;
        case 'score':
          if (isNaN(nb) || nb === 0) { setResult('Total cannot be zero'); return; }
          const pct = (na / nb) * 100;
          if (!isFinite(pct)) { setResult('Result is undefined'); return; }
          setResult(`${na} out of ${nb} = ${pct.toFixed(2)}%`);
          break;
      }
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : 'Calculation failed'}`);
    }
  };

  const modes: { id: PercentMode; label: string; desc: string; aLabel: string; bLabel: string }[] = [
    { id: 'of', label: '% of Number', desc: 'What is X% of Y?', aLabel: 'Percentage (%)', bLabel: 'Number' },
    { id: 'increase', label: '% Increase', desc: 'Percentage increase from X to Y', aLabel: 'Original', bLabel: 'New' },
    { id: 'decrease', label: '% Decrease', desc: 'Percentage decrease from X to Y', aLabel: 'Original', bLabel: 'New' },
    { id: 'difference', label: '% Difference', desc: 'Percentage difference between two numbers', aLabel: 'Value 1', bLabel: 'Value 2' },
    { id: 'discount', label: 'Discount', desc: 'Calculate discount amount and final price', aLabel: 'Discount %', bLabel: 'Original Price' },
    { id: 'tax', label: 'Tax', desc: 'Calculate tax amount and total', aLabel: 'Tax Rate %', bLabel: 'Subtotal' },
    { id: 'score', label: 'Score %', desc: 'What percentage is X out of Y?', aLabel: 'Score', bLabel: 'Total' },
  ];

  const currentMode = modes.find(m => m.id === mode)!;

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Percentage Tools</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Quick percentage calculations for everyday use.</p>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {modes.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(''); setA(''); setB(''); }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${mode === m.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-sm text-gray-500 mb-4">{currentMode.desc}</p>
        
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{currentMode.aLabel}</label>
            <input type="number" value={a} onChange={e => setA(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter value" />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{currentMode.bLabel}</label>
            <input type="number" value={b} onChange={e => setB(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter value" />
          </div>
        </div>

        <button onClick={calculate} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Calculate</button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <pre className="font-mono text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
