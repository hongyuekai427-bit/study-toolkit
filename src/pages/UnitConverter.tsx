import { useState } from 'react';

type Category = 'length' | 'mass' | 'area' | 'volume' | 'temperature' | 'time' | 'data';

interface UnitDef { name: string; toBase: (v: number) => number; fromBase: (v: number) => number; }

const units: Record<Category, { label: string; units: Record<string, UnitDef> }> = {
  length: {
    label: 'Length',
    units: {
      mm: { name: 'Millimeters (mm)', toBase: v => v / 1000, fromBase: v => v * 1000 },
      cm: { name: 'Centimeters (cm)', toBase: v => v / 100, fromBase: v => v * 100 },
      m: { name: 'Meters (m)', toBase: v => v, fromBase: v => v },
      km: { name: 'Kilometers (km)', toBase: v => v * 1000, fromBase: v => v / 1000 },
      inch: { name: 'Inches (in)', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      foot: { name: 'Feet (ft)', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      yard: { name: 'Yards (yd)', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
      mile: { name: 'Miles (mi)', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    }
  },
  mass: {
    label: 'Mass',
    units: {
      mg: { name: 'Milligrams (mg)', toBase: v => v / 1000000, fromBase: v => v * 1000000 },
      g: { name: 'Grams (g)', toBase: v => v / 1000, fromBase: v => v * 1000 },
      kg: { name: 'Kilograms (kg)', toBase: v => v, fromBase: v => v },
      oz: { name: 'Ounces (oz)', toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
      lb: { name: 'Pounds (lb)', toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
      tonne: { name: 'Tonnes (t)', toBase: v => v * 1000, fromBase: v => v / 1000 },
    }
  },
  area: {
    label: 'Area',
    units: {
      mm2: { name: 'mm²', toBase: v => v / 1000000, fromBase: v => v * 1000000 },
      cm2: { name: 'cm²', toBase: v => v / 10000, fromBase: v => v * 10000 },
      m2: { name: 'm²', toBase: v => v, fromBase: v => v },
      km2: { name: 'km²', toBase: v => v * 1000000, fromBase: v => v / 1000000 },
      ft2: { name: 'ft²', toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
      acre: { name: 'Acres', toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
    }
  },
  volume: {
    label: 'Volume',
    units: {
      ml: { name: 'Milliliters (mL)', toBase: v => v / 1000, fromBase: v => v * 1000 },
      l: { name: 'Liters (L)', toBase: v => v, fromBase: v => v },
      cm3: { name: 'cm³', toBase: v => v / 1000, fromBase: v => v * 1000 },
      m3: { name: 'm³', toBase: v => v * 1000, fromBase: v => v / 1000 },
      gallon: { name: 'Gallons (US)', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
      pint: { name: 'Pints (US)', toBase: v => v * 0.473176, fromBase: v => v / 0.473176 },
      cup: { name: 'Cups (US)', toBase: v => v * 0.236588, fromBase: v => v / 0.236588 },
    }
  },
  temperature: {
    label: 'Temperature',
    units: {
      c: { name: 'Celsius (°C)', toBase: v => v, fromBase: v => v },
      f: { name: 'Fahrenheit (°F)', toBase: v => (v - 32) * 5/9, fromBase: v => v * 9/5 + 32 },
      k: { name: 'Kelvin (K)', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    }
  },
  time: {
    label: 'Time',
    units: {
      ms: { name: 'Milliseconds', toBase: v => v / 1000, fromBase: v => v * 1000 },
      s: { name: 'Seconds', toBase: v => v, fromBase: v => v },
      min: { name: 'Minutes', toBase: v => v * 60, fromBase: v => v / 60 },
      hr: { name: 'Hours', toBase: v => v * 3600, fromBase: v => v / 3600 },
      day: { name: 'Days', toBase: v => v * 86400, fromBase: v => v / 86400 },
      week: { name: 'Weeks', toBase: v => v * 604800, fromBase: v => v / 604800 },
    }
  },
  data: {
    label: 'Data Storage',
    units: {
      bit: { name: 'Bits', toBase: v => v / 8, fromBase: v => v * 8 },
      byte: { name: 'Bytes', toBase: v => v, fromBase: v => v },
      kb: { name: 'Kilobytes (KB)', toBase: v => v * 1000, fromBase: v => v / 1000 },
      kib: { name: 'Kibibytes (KiB)', toBase: v => v * 1024, fromBase: v => v / 1024 },
      mb: { name: 'Megabytes (MB)', toBase: v => v * 1000000, fromBase: v => v / 1000000 },
      mib: { name: 'Mebibytes (MiB)', toBase: v => v * 1048576, fromBase: v => v / 1048576 },
      gb: { name: 'Gigabytes (GB)', toBase: v => v * 1e9, fromBase: v => v / 1e9 },
      gib: { name: 'Gibibytes (GiB)', toBase: v => v * 1073741824, fromBase: v => v / 1073741824 },
      tb: { name: 'Terabytes (TB)', toBase: v => v * 1e12, fromBase: v => v / 1e12 },
      tib: { name: 'Tebibytes (TiB)', toBase: v => v * 1099511627776, fromBase: v => v / 1099511627776 },
    }
  },
};

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');
  const [value, setValue] = useState('1');
  const [result, setResult] = useState('');

  const convert = () => {
    const num = parseFloat(value);
    if (isNaN(num)) { setResult('Enter a valid number'); return; }
    if (!isFinite(num)) { setResult('Number is too large'); return; }
    const cat = units[category];
    const from = cat.units[fromUnit];
    const to = cat.units[toUnit];
    if (!from || !to) { setResult('Invalid units selected'); return; }
    try {
      const base = from.toBase(num);
      const converted = to.fromBase(base);
      if (!isFinite(converted)) { setResult('Result is undefined or infinite'); return; }
      const formatted = Math.abs(converted) < 0.0001 && converted !== 0 
        ? converted.toExponential(4) 
        : parseFloat(converted.toPrecision(10)).toString();
      setResult(`${num} ${fromUnit} = ${formatted} ${toUnit}`);
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : 'Conversion failed'}`);
    }
  };

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    const unitKeys = Object.keys(units[cat].units);
    setFromUnit(unitKeys[0]);
    setToUnit(unitKeys[1] || unitKeys[0]);
    setResult('');
  };

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Unit Converter</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Convert between units of measurement.</p>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(units) as Category[]).map(cat => (
          <button key={cat} onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${category === cat ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {units[cat].label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">From</label>
            <div className="flex gap-2">
              <input type="number" value={value} onChange={e => setValue(e.target.value)} className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="px-3 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {Object.entries(units[category].units).map(([key, u]) => (
                  <option key={key} value={key}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <button onClick={() => { const temp = fromUnit; setFromUnit(toUnit); setToUnit(temp); }} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
              ⇅
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">To</label>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {Object.entries(units[category].units).map(([key, u]) => (
                <option key={key} value={key}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={convert} className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Convert</button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="font-mono text-lg font-bold">{result}</p>
          </div>
        )}

        {category === 'data' && (
          <p className="mt-3 text-xs text-gray-500">KB/MB/GB/TB use decimal (1000-based). KiB/MiB/GiB/TiB use binary (1024-based) storage units.</p>
        )}
      </div>
    </div>
  );
}
