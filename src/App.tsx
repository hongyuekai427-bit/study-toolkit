import { HashRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import Layout from './components/Layout';
import { evaluate } from './lib/math-parser';

// Lazy load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CalculatorPage = lazy(() => import('./pages/Calculator'));
const FractionCalcPage = lazy(() => import('./pages/FractionCalc'));
const PercentagePage = lazy(() => import('./pages/PercentageTools'));
const UnitConverterPage = lazy(() => import('./pages/UnitConverter'));
const DateToolsPage = lazy(() => import('./pages/DateTools'));
const TimerPage = lazy(() => import('./pages/Timer'));
const TasksPage = lazy(() => import('./pages/Tasks'));
const NotesPage = lazy(() => import('./pages/Notes'));
const FlashcardsPage = lazy(() => import('./pages/Flashcards'));
const GradesPage = lazy(() => import('./pages/Grades'));
const WordCounterPage = lazy(() => import('./pages/WordCounter'));
const TextAnalyzerPage = lazy(() => import('./pages/TextAnalyzer'));
const CitationPage = lazy(() => import('./pages/Citation'));
const EssayPlannerPage = lazy(() => import('./pages/EssayPlanner'));
const PlannerPage = lazy(() => import('./pages/Planner'));
const ProjectsPage = lazy(() => import('./pages/Projects'));
const PresentationPlannerPage = lazy(() => import('./pages/PresentationPlanner'));
const QuizBuilderPage = lazy(() => import('./pages/QuizBuilder'));
const ReferencesPage = lazy(() => import('./pages/Utilities').then(m => ({ default: m.ReferencesPage })));
const SettingsPage = lazy(() => import('./pages/Utilities').then(m => ({ default: m.SettingsPage })));
const PasswordGeneratorPage = lazy(() => import('./pages/RandomTools').then(m => ({ default: m.PasswordGeneratorPage })));
const RandomToolsPage = lazy(() => import('./pages/RandomTools').then(m => ({ default: m.RandomToolsPage })));
const ColorToolsPage = lazy(() => import('./pages/ColorTools').then(m => ({ default: m.ColorToolsPage })));
const QRCodePage = lazy(() => import('./pages/Utilities').then(m => ({ default: m.QRCodePage })));
const DataTablePage = lazy(() => import('./pages/Utilities').then(m => ({ default: m.DataTablePage })));
const ChartsPage = lazy(() => import('./pages/Utilities').then(m => ({ default: m.ChartsPage })));
const FileToolsPage = lazy(() => import('./pages/Utilities').then(m => ({ default: m.FileToolsPage })));
const ScienceToolsPage = lazy(() => import('./pages/ScienceGeometry').then(m => ({ default: m.ScienceToolsPage })));
const GeometryPage = lazy(() => import('./pages/ScienceGeometry').then(m => ({ default: m.GeometryPage })));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="fractions" element={<FractionCalcPage />} />
            <Route path="percentage" element={<PercentagePage />} />
            <Route path="units" element={<UnitConverterPage />} />
            <Route path="dates" element={<DateToolsPage />} />
            <Route path="timer" element={<TimerPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />
            <Route path="grades" element={<GradesPage />} />
            <Route path="wordcount" element={<WordCounterPage />} />
            <Route path="textanalyzer" element={<TextAnalyzerPage />} />
            <Route path="citation" element={<CitationPage />} />
            <Route path="essay" element={<EssayPlannerPage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="presentation" element={<PresentationPlannerPage />} />
            <Route path="quiz" element={<QuizBuilderPage />} />
            <Route path="references" element={<ReferencesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="password" element={<PasswordGeneratorPage />} />
            <Route path="random" element={<RandomToolsPage />} />
            <Route path="color" element={<ColorToolsPage />} />
            <Route path="qrcode" element={<QRCodePage />} />
            <Route path="datatable" element={<DataTablePage />} />
            <Route path="charts" element={<ChartsPage />} />
            <Route path="filetools" element={<FileToolsPage />} />
            <Route path="science" element={<ScienceToolsPage />} />
            <Route path="geometry" element={<GeometryPage />} />
            <Route path="graph" element={<GraphPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

// Simple function grapher
function GraphPage() {
  const [functions, setFunctions] = useState([{ id: '1', expr: 'x^2', color: '#6366f1' }]);
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);

  const addFunction = () => {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    setFunctions(prev => [...prev, { id: Date.now().toString(), expr: '', color: colors[prev.length % colors.length] }]);
  };

  const removeFunction = (id: string) => setFunctions(prev => prev.filter(f => f.id !== id));
  const updateFunction = (id: string, expr: string) => setFunctions(prev => prev.map(f => f.id === id ? { ...f, expr } : f));

  const width = 500;
  const height = 400;
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  const toScreenX = (x: number) => ((x - xMin) / xRange) * width;
  const toScreenY = (y: number) => height - ((y - yMin) / yRange) * height;

  const generatePath = (expr: string) => {
    if (!expr.trim()) return '';
    const points: string[] = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * xRange;
      try {
        const y = evaluate(expr.replace(/x/gi, `(${x})`), false);
        if (isFinite(y) && y >= yMin - 5 && y <= yMax + 5) {
          const sx = toScreenX(x);
          const sy = toScreenY(y);
          points.push(`${points.length === 0 ? 'M' : 'L'} ${sx} ${sy}`);
        }
      } catch { /* skip */ }
    }
    return points.join(' ');
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Function Grapher</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Plot mathematical functions. Use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">x</code> as the variable. Supports: +, -, *, /, ^, sin, cos, tan, sqrt, log, ln, pi, e</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="space-y-2 mb-4">
          {functions.map(f => (
            <div key={f.id} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: f.color }} />
              <span className="text-sm text-gray-500">y =</span>
              <input type="text" value={f.expr} onChange={e => updateFunction(f.id, e.target.value)} placeholder="e.g. x^2, sin(x), 2x+3" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {functions.length > 1 && <button onClick={() => removeFunction(f.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">×</button>}
            </div>
          ))}
        </div>
        <button onClick={addFunction} className="text-sm text-indigo-600 hover:underline">+ Add function</button>
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div><label className="text-xs text-gray-500">X min</label><input type="number" value={xMin} onChange={e => setXMin(parseFloat(e.target.value) || -10)} className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm" /></div>
          <div><label className="text-xs text-gray-500">X max</label><input type="number" value={xMax} onChange={e => setXMax(parseFloat(e.target.value) || 10)} className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm" /></div>
          <div><label className="text-xs text-gray-500">Y min</label><input type="number" value={yMin} onChange={e => setYMin(parseFloat(e.target.value) || -10)} className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm" /></div>
          <div><label className="text-xs text-gray-500">Y max</label><input type="number" value={yMax} onChange={e => setYMax(parseFloat(e.target.value) || 10)} className="w-full px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm" /></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl mx-auto" style={{ minHeight: '300px' }}>
          {/* Grid */}
          {Array.from({ length: 11 }, (_, i) => {
            const x = xMin + (i / 10) * xRange;
            const y = yMin + (i / 10) * yRange;
            return (
              <g key={i}>
                <line x1={toScreenX(x)} y1={0} x2={toScreenX(x)} y2={height} stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-700" />
                <line x1={0} y1={toScreenY(y)} x2={width} y2={toScreenY(y)} stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-700" />
              </g>
            );
          })}
          {/* Axes */}
          {xMin <= 0 && xMax >= 0 && <line x1={toScreenX(0)} y1={0} x2={toScreenX(0)} y2={height} stroke="currentColor" strokeWidth="1" className="text-gray-400 dark:text-gray-500" />}
          {yMin <= 0 && yMax >= 0 && <line x1={0} y1={toScreenY(0)} x2={width} y2={toScreenY(0)} stroke="currentColor" strokeWidth="1" className="text-gray-400 dark:text-gray-500" />}
          {/* Functions */}
          {functions.map(f => (
            <path key={f.id} d={generatePath(f.expr)} fill="none" stroke={f.color} strokeWidth="2" />
          ))}
        </svg>
      </div>
    </div>
  );
}
