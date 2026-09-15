import { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

type DateMode = 'difference' | 'countdown' | 'addDays' | 'schoolDays' | 'age';

export default function DateToolsPage() {
  const [mode, setMode] = useState<DateMode>('difference');
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [daysToAdd, setDaysToAdd] = useState('');
  const [result, setResult] = useState('');
  const [excludeWeekends, setExcludeWeekends] = useState(false);

  const calculate = () => {
    try {
      switch (mode) {
        case 'difference': {
          if (!date1 || !date2) { setResult('Enter both dates'); return; }
          const d1 = new Date(date1);
          const d2 = new Date(date2);
          if (isNaN(d1.getTime()) || isNaN(d2.getTime())) { setResult('Invalid date format'); return; }
          const diffMs = Math.abs(d2.getTime() - d1.getTime());
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const diffWeeks = Math.floor(diffDays / 7);
          const remainingDays = diffDays % 7;
          setResult(`${diffDays} days (${diffWeeks} weeks${remainingDays > 0 ? ` and ${remainingDays} days` : ''})`);
          break;
        }
        case 'countdown': {
          if (!date1) { setResult('Enter a target date'); return; }
          const target = new Date(date1);
          if (isNaN(target.getTime())) { setResult('Invalid date format'); return; }
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          target.setHours(0, 0, 0, 0);
          const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diff < 0) setResult(`That date was ${Math.abs(diff)} days ago`);
          else if (diff === 0) setResult('That date is today!');
          else if (diff === 1) setResult('Tomorrow!');
          else setResult(`${diff} days remaining`);
          break;
        }
        case 'addDays': {
          if (!date1 || !daysToAdd) { setResult('Enter a date and number of days'); return; }
          const d = new Date(date1);
          if (isNaN(d.getTime())) { setResult('Invalid date format'); return; }
          const daysNum = parseInt(daysToAdd);
          if (isNaN(daysNum)) { setResult('Enter a valid number of days'); return; }
          d.setDate(d.getDate() + daysNum);
          if (isNaN(d.getTime())) { setResult('Result date is invalid'); return; }
          setResult(d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
          break;
        }
        case 'schoolDays': {
          if (!date1 || !date2) { setResult('Enter both dates'); return; }
          const d1 = new Date(date1);
          const d2 = new Date(date2);
          if (isNaN(d1.getTime()) || isNaN(d2.getTime())) { setResult('Invalid date format'); return; }
          if (d1 > d2) { setResult('Start date must be before end date'); return; }
          let count = 0;
          const current = new Date(d1);
          const maxIterations = 365 * 10; // Safety limit
          let iterations = 0;
          while (current <= d2 && iterations < maxIterations) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) count++;
            current.setDate(current.getDate() + 1);
            iterations++;
          }
          setResult(`${count} school days (excluding weekends)`);
          break;
        }
        case 'age': {
          if (!date1) { setResult('Enter a birth date'); return; }
          const birth = new Date(date1);
          if (isNaN(birth.getTime())) { setResult('Invalid date format'); return; }
          const now = new Date();
          if (birth > now) { setResult('Birth date cannot be in the future'); return; }
          let years = now.getFullYear() - birth.getFullYear();
          let months = now.getMonth() - birth.getMonth();
          let days = now.getDate() - birth.getDate();
          if (days < 0) { months--; days += 30; }
          if (months < 0) { years--; months += 12; }
          setResult(`${years} years, ${months} months, ${days} days`);
          break;
        }
      }
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : 'Calculation failed'}`);
    }
  };

  const modes: { id: DateMode; label: string }[] = [
    { id: 'difference', label: 'Days Between' },
    { id: 'countdown', label: 'Countdown' },
    { id: 'addDays', label: 'Add/Subtract Days' },
    { id: 'schoolDays', label: 'School Days' },
    { id: 'age', label: 'Age Calculator' },
  ];

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Date & Time Tools</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Calculate date differences, countdowns, and more.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {modes.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(''); }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${mode === m.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3 mb-4">
          {(mode === 'difference' || mode === 'schoolDays') && (
            <>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Start Date</label>
                <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">End Date</label>
                <input type="date" value={date2} onChange={e => setDate2(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </>
          )}
          {mode === 'countdown' && (
            <div>
              <label className="text-sm text-gray-500 block mb-1">Target Date</label>
              <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}
          {mode === 'addDays' && (
            <>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Start Date</label>
                <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Days to add (negative to subtract)</label>
                <input type="number" value={daysToAdd} onChange={e => setDaysToAdd(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </>
          )}
          {mode === 'age' && (
            <div>
              <label className="text-sm text-gray-500 block mb-1">Date of Birth</label>
              <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}
        </div>

        <button onClick={calculate} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Calculate</button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="font-mono text-lg font-bold">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
