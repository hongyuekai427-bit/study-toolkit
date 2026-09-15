import { useState } from 'react';
import { Atom, Calculator as CalcIcon } from 'lucide-react';

type ScienceCategory = 'physics' | 'chemistry' | 'general';

export function ScienceToolsPage() {
  const [category, setCategory] = useState<ScienceCategory>('physics');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState('');
  const [formula, setFormula] = useState('');

  const physicsFormulas = [
    { id: 'speed', name: 'Speed', formula: 'v = d / t', fields: ['distance', 'time'], unit: 'm/s', calc: (d: number, t: number) => d / t, desc: 'Speed = Distance ÷ Time' },
    { id: 'force', name: 'Force', formula: 'F = m × a', fields: ['mass (kg)', 'acceleration (m/s²)'], unit: 'N', calc: (m: number, a: number) => m * a, desc: 'Force = Mass × Acceleration' },
    { id: 'work', name: 'Work', formula: 'W = F × d', fields: ['force (N)', 'distance (m)'], unit: 'J', calc: (f: number, d: number) => f * d, desc: 'Work = Force × Distance' },
    { id: 'power', name: 'Power', formula: 'P = W / t', fields: ['work (J)', 'time (s)'], unit: 'W', calc: (w: number, t: number) => w / t, desc: 'Power = Work ÷ Time' },
    { id: 'density', name: 'Density', formula: 'ρ = m / V', fields: ['mass (kg)', 'volume (m³)'], unit: 'kg/m³', calc: (m: number, v: number) => m / v, desc: 'Density = Mass ÷ Volume' },
    { id: 'ohm', name: "Ohm's Law", formula: 'V = I × R', fields: ['current (A)', 'resistance (Ω)'], unit: 'V', calc: (i: number, r: number) => i * r, desc: 'Voltage = Current × Resistance' },
    { id: 'kinetic', name: 'Kinetic Energy', formula: 'KE = ½mv²', fields: ['mass (kg)', 'velocity (m/s)'], unit: 'J', calc: (m: number, v: number) => 0.5 * m * v * v, desc: 'Kinetic Energy = ½ × Mass × Velocity²' },
    { id: 'pressure', name: 'Pressure', formula: 'P = F / A', fields: ['force (N)', 'area (m²)'], unit: 'Pa', calc: (f: number, a: number) => f / a, desc: 'Pressure = Force ÷ Area' },
  ];

  const chemistryFormulas = [
    { id: 'moles', name: 'Moles', formula: 'n = m / M', fields: ['mass (g)', 'molar mass (g/mol)'], unit: 'mol', calc: (m: number, M: number) => m / M, desc: 'Moles = Mass ÷ Molar Mass' },
    { id: 'concentration', name: 'Concentration', formula: 'C = n / V', fields: ['moles (mol)', 'volume (L)'], unit: 'mol/L', calc: (n: number, v: number) => n / v, desc: 'Concentration = Moles ÷ Volume' },
    { id: 'dilution', name: 'Dilution', formula: 'C₁V₁ = C₂V₂', fields: ['C₁ (mol/L)', 'V₁ (L)', 'V₂ (L)'], unit: 'mol/L', calc: (c1: number, v1: number, v2: number) => (c1 * v1) / v2, desc: 'C₂ = C₁V₁ ÷ V₂' },
    { id: 'ph', name: 'pH', formula: 'pH = -log[H⁺]', fields: ['[H⁺] (mol/L)'], unit: '', calc: (h: number) => -Math.log10(h), desc: 'pH = -log₁₀ of hydrogen ion concentration' },
  ];

  const generalFormulas = [
    { id: 'sciNotation', name: 'Scientific Notation', formula: 'a × 10ⁿ', fields: ['number'], unit: '', calc: (n: number) => n.toExponential(), desc: 'Convert to scientific notation' },
    { id: 'sigFigs', name: 'Significant Figures', formula: 'Count significant digits', fields: ['number'], unit: '', calc: (n: number) => { const s = n.toString(); return `${s} (${s.replace(/[^1-9]/g, '').length} sig figs)`; }, desc: 'Count significant figures' },
  ];

  const getFormulas = () => {
    switch (category) { case 'physics': return physicsFormulas; case 'chemistry': return chemistryFormulas; case 'general': return generalFormulas; }
  };

  const [selectedFormula, setSelectedFormula] = useState(getFormulas()[0].id);
  const currentFormula = getFormulas().find(f => f.id === selectedFormula) || getFormulas()[0];

  const calculate = () => {
    const values = currentFormula.fields.map((_, i) => parseFloat(inputs[`field_${i}`]));
    if (values.some(v => isNaN(v) || v === 0)) { setResult('Enter valid non-zero numbers'); return; }
    try {
      const res = (currentFormula.calc as (...args: number[]) => string | number)(...values);
      if (typeof res === 'string') {
        setResult(res);
      } else if (!isFinite(res)) {
        setResult('Result is undefined or infinite');
      } else {
        setResult(`${parseFloat(res.toPrecision(10))} ${currentFormula.unit}`);
      }
      setFormula(currentFormula.desc);
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : 'Calculation failed'}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Science Tools</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Physics, chemistry, and general science calculators with formulas.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['physics', 'chemistry', 'general'] as ScienceCategory[]).map(c => (
          <button key={c} onClick={() => { setCategory(c); setInputs({}); setResult(''); setSelectedFormula(getFormulas()[0].id); }}
            className={`px-3 py-1.5 text-sm rounded-lg capitalize ${category === c ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{c}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {getFormulas().map(f => (
          <button key={f.id} onClick={() => { setSelectedFormula(f.id); setInputs({}); setResult(''); }}
            className={`px-3 py-1.5 text-xs rounded-lg ${selectedFormula === f.id ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{f.name}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center mb-4">
          <p className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{currentFormula.formula}</p>
          <p className="text-sm text-gray-500 mt-1">{currentFormula.desc}</p>
        </div>
        <div className="space-y-3 mb-4">
          {currentFormula.fields.map((field, i) => (
            <div key={i}>
              <label className="text-sm text-gray-500 block mb-1">{field}</label>
              <input type="number" value={inputs[`field_${i}`] || ''} onChange={e => setInputs({ ...inputs, [`field_${i}`]: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder={`Enter ${field}`} />
            </div>
          ))}
        </div>
        <button onClick={calculate} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Calculate</button>
        {result && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="font-mono text-lg font-bold">{result}</p>
            {formula && <p className="text-xs text-gray-500 mt-1">{formula}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

type Shape = 'square' | 'rectangle' | 'triangle' | 'circle' | 'trapezoid' | 'cylinder' | 'sphere' | 'cone';

export function GeometryPage() {
  const [shape, setShape] = useState<Shape>('circle');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<string[]>([]);

  const shapes: Record<Shape, { name: string; fields: string[]; calc: (vals: number[]) => string[] }> = {
    square: { name: 'Square', fields: ['Side length'], calc: ([a]) => [`Area = ${a * a}`, `Perimeter = ${4 * a}`, `Diagonal = ${(a * Math.SQRT2).toFixed(4)}`] },
    rectangle: { name: 'Rectangle', fields: ['Length', 'Width'], calc: ([l, w]) => [`Area = ${l * w}`, `Perimeter = ${2 * (l + w)}`, `Diagonal = ${Math.sqrt(l * l + w * w).toFixed(4)}`] },
    triangle: { name: 'Triangle', fields: ['Base', 'Height', 'Side A', 'Side B'], calc: ([b, h, a, c]) => [`Area = ${(0.5 * b * h).toFixed(4)}`, `Perimeter = ${(a + b + c).toFixed(4)}`] },
    circle: { name: 'Circle', fields: ['Radius'], calc: ([r]) => [`Area = πr² = ${(Math.PI * r * r).toFixed(4)}`, `Circumference = 2πr = ${(2 * Math.PI * r).toFixed(4)}`, `Diameter = ${2 * r}`] },
    trapezoid: { name: 'Trapezoid', fields: ['Side A (top)', 'Side B (bottom)', 'Height'], calc: ([a, b, h]) => [`Area = ½(a+b)×h = ${(0.5 * (a + b) * h).toFixed(4)}`] },
    cylinder: { name: 'Cylinder', fields: ['Radius', 'Height'], calc: ([r, h]) => [`Volume = πr²h = ${(Math.PI * r * r * h).toFixed(4)}`, `Surface Area = 2πr(r+h) = ${(2 * Math.PI * r * (r + h)).toFixed(4)}`, `Lateral Area = 2πrh = ${(2 * Math.PI * r * h).toFixed(4)}`] },
    sphere: { name: 'Sphere', fields: ['Radius'], calc: ([r]) => [`Volume = (4/3)πr³ = ${((4 / 3) * Math.PI * r * r * r).toFixed(4)}`, `Surface Area = 4πr² = ${(4 * Math.PI * r * r).toFixed(4)}`] },
    cone: { name: 'Cone', fields: ['Radius', 'Height'], calc: ([r, h]) => { const l = Math.sqrt(r * r + h * h); return [`Volume = (1/3)πr²h = ${((1 / 3) * Math.PI * r * r * h).toFixed(4)}`, `Slant height = ${l.toFixed(4)}`, `Surface Area = πr(r+l) = ${(Math.PI * r * (r + l)).toFixed(4)}`]; } },
  };

  const calculate = () => {
    const values = shapes[shape].fields.map((_, i) => parseFloat(inputs[`f${i}`]));
    if (values.some(v => isNaN(v))) { setResults(['Enter valid numbers']); return; }
    if (values.some(v => v <= 0)) { setResults(['All values must be positive']); return; }
    try {
      const results = shapes[shape].calc(values);
      setResults(results.map(r => {
        // Format numbers in results
        return r.replace(/(\d+\.\d{4})\d+/g, (_, num) => parseFloat(num).toString());
      }));
    } catch (e) {
      setResults([`Error: ${e instanceof Error ? e.message : 'Calculation failed'}`]);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Geometry Calculator</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Calculate area, perimeter, volume, and surface area of shapes.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(shapes) as Shape[]).map(s => (
          <button key={s} onClick={() => { setShape(s); setInputs({}); setResults([]); }}
            className={`px-3 py-1.5 text-sm rounded-lg capitalize ${shape === s ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{shapes[s].name}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3 mb-4">
          {shapes[shape].fields.map((field, i) => (
            <div key={i}>
              <label className="text-sm text-gray-500 block mb-1">{field}</label>
              <input type="number" value={inputs[`f${i}`] || ''} onChange={e => setInputs({ ...inputs, [`f${i}`]: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}
        </div>
        <button onClick={calculate} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Calculate</button>
        {results.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-1">
            {results.map((r, i) => <p key={i} className="font-mono text-sm">{r}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}
