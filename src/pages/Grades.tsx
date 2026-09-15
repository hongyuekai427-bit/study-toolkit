import { useState } from 'react';
import { Plus, Trash2, Calculator, Award } from 'lucide-react';

type CalcMode = 'average' | 'weighted' | 'target' | 'gpa';

interface GradeRow { id: string; name: string; score: string; maxScore: string; weight: string; }
interface GPARow { id: string; course: string; grade: string; gradePoint: string; credits: string; }

const defaultScale: Record<string, number> = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0.0 };

export default function GradesPage() {
  const [mode, setMode] = useState<CalcMode>('average');
  const [grades, setGrades] = useState<GradeRow[]>([{ id: '1', name: '', score: '', maxScore: '100', weight: '1' }]);
  const [gpaRows, setGpaRows] = useState<GPARow[]>([{ id: '1', course: '', grade: 'A', gradePoint: '4.0', credits: '3' }]);
  const [targetOverall, setTargetOverall] = useState('85');
  const [scale, setScale] = useState<Record<string, number>>(defaultScale);
  const [showScaleEditor, setShowScaleEditor] = useState(false);

  const addGradeRow = () => setGrades(prev => [...prev, { id: Date.now().toString(), name: '', score: '', maxScore: '100', weight: '1' }]);
  const removeGradeRow = (id: string) => setGrades(prev => prev.filter(g => g.id !== id));
  const updateGradeRow = (id: string, field: keyof GradeRow, value: string) => setGrades(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));

  const addGPARow = () => setGpaRows(prev => [...prev, { id: Date.now().toString(), course: '', grade: 'A', gradePoint: scale['A']?.toString() || '4.0', credits: '3' }]);
  const removeGPARow = (id: string) => setGpaRows(prev => prev.filter(g => g.id !== id));
  const updateGPARow = (id: string, field: keyof GPARow, value: string) => {
    setGpaRows(prev => prev.map(g => {
      if (g.id !== id) return g;
      if (field === 'grade' && scale[value] !== undefined) {
        return { ...g, grade: value, gradePoint: scale[value].toString() };
      }
      return { ...g, [field]: value };
    }));
  };

  // Simple average
  const simpleAvg = () => {
    const valid = grades.filter(g => g.score && g.maxScore);
    if (valid.length === 0) return null;
    const total = valid.reduce((sum, g) => sum + (parseFloat(g.score) / parseFloat(g.maxScore) * 100), 0);
    return (total / valid.length).toFixed(2);
  };

  // Weighted average
  const weightedAvg = () => {
    const valid = grades.filter(g => g.score && g.maxScore && g.weight);
    if (valid.length === 0) return null;
    let totalWeighted = 0;
    let totalWeight = 0;
    valid.forEach(g => {
      const pct = parseFloat(g.score) / parseFloat(g.maxScore) * 100;
      const w = parseFloat(g.weight);
      totalWeighted += pct * w;
      totalWeight += w;
    });
    if (totalWeight === 0) return null;
    return (totalWeighted / totalWeight).toFixed(2);
  };

  // Target grade
  const targetGrade = () => {
    const valid = grades.filter(g => g.score && g.maxScore && g.weight);
    if (valid.length === 0) return null;
    const target = parseFloat(targetOverall);
    if (isNaN(target)) return null;
    let currentWeighted = 0;
    let currentWeight = 0;
    valid.forEach(g => {
      const pct = parseFloat(g.score) / parseFloat(g.maxScore) * 100;
      const w = parseFloat(g.weight);
      currentWeighted += pct * w;
      currentWeight += w;
    });
    if (currentWeight === 0) return null;
    // Assuming the last entry is the "final" we need to calculate for
    const lastGrade = valid[valid.length - 1];
    const lastWeight = parseFloat(lastGrade.weight);
    const otherWeighted = currentWeighted - (parseFloat(lastGrade.score) / parseFloat(lastGrade.maxScore) * 100 * lastWeight);
    const otherWeight = currentWeight - lastWeight;
    if (otherWeight === 0) return null;
    const needed = (target * currentWeight - otherWeighted) / lastWeight;
    return needed.toFixed(2);
  };

  // GPA
  const gpaResult = () => {
    const valid = gpaRows.filter(g => g.gradePoint && g.credits);
    if (valid.length === 0) return null;
    let totalPoints = 0;
    let totalCredits = 0;
    valid.forEach(g => {
      totalPoints += parseFloat(g.gradePoint) * parseFloat(g.credits);
      totalCredits += parseFloat(g.credits);
    });
    if (totalCredits === 0) return null;
    return (totalPoints / totalCredits).toFixed(3);
  };

  const modes: { id: CalcMode; label: string }[] = [
    { id: 'average', label: 'Simple Average' },
    { id: 'weighted', label: 'Weighted' },
    { id: 'target', label: 'Target Grade' },
    { id: 'gpa', label: 'GPA' },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Grade Calculator</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Calculate averages, weighted grades, and GPA.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {modes.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${mode === m.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* GPA Scale Editor */}
      {mode === 'gpa' && (
        <div className="mb-4">
          <button onClick={() => setShowScaleEditor(!showScaleEditor)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            {showScaleEditor ? 'Hide' : 'Edit'} grade scale
          </button>
          {showScaleEditor && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 mb-2">⚠️ GPA systems vary by school and country. Verify the scale used by your institution.</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {Object.entries(scale).map(([letter, points]) => (
                  <div key={letter} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8">{letter}</span>
                    <input type="number" step="0.1" value={points} onChange={e => setScale(prev => ({ ...prev, [letter]: parseFloat(e.target.value) || 0 }))} className="w-20 px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {mode !== 'gpa' ? (
          <>
            {/* Grade rows */}
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium px-1">
                <span className="col-span-3">Name</span>
                <span className="col-span-2">Score</span>
                <span className="col-span-2">Max</span>
                <span className="col-span-3">Weight %</span>
                <span className="col-span-2"></span>
              </div>
              {grades.map(g => (
                <div key={g.id} className="grid grid-cols-12 gap-2 items-center">
                  <input type="text" value={g.name} onChange={e => updateGradeRow(g.id, 'name', e.target.value)} placeholder="Assignment" className="col-span-3 px-2 py-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <input type="number" value={g.score} onChange={e => updateGradeRow(g.id, 'score', e.target.value)} placeholder="0" className="col-span-2 px-2 py-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <input type="number" value={g.maxScore} onChange={e => updateGradeRow(g.id, 'maxScore', e.target.value)} className="col-span-2 px-2 py-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <input type="number" value={g.weight} onChange={e => updateGradeRow(g.id, 'weight', e.target.value)} className="col-span-3 px-2 py-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <button onClick={() => removeGradeRow(g.id)} className="col-span-2 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} className="text-red-500 mx-auto" /></button>
                </div>
              ))}
            </div>
            <button onClick={addGradeRow} className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4"><Plus size={14} /> Add row</button>

            {mode === 'target' && (
              <div className="mb-4">
                <label className="text-sm text-gray-500 block mb-1">Target overall grade (%)</label>
                <input type="number" value={targetOverall} onChange={e => setTargetOverall(e.target.value)} className="w-32 px-3 py-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
            )}

            {/* Result */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {mode === 'average' && simpleAvg() && (
                <p className="text-lg font-bold">Average: <span className="text-indigo-600 dark:text-indigo-400">{simpleAvg()}%</span></p>
              )}
              {mode === 'weighted' && weightedAvg() && (
                <p className="text-lg font-bold">Weighted Average: <span className="text-indigo-600 dark:text-indigo-400">{weightedAvg()}%</span></p>
              )}
              {mode === 'target' && targetGrade() !== null && (
                <p className="text-lg font-bold">You need: <span className="text-indigo-600 dark:text-indigo-400">{targetGrade()}%</span> on the final to reach {targetOverall}%</p>
              )}
              {mode === 'average' && !simpleAvg() && <p className="text-gray-500 text-sm">Enter scores to calculate</p>}
              {mode === 'weighted' && !weightedAvg() && <p className="text-gray-500 text-sm">Enter scores and weights to calculate</p>}
            </div>
          </>
        ) : (
          <>
            {/* GPA rows */}
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium px-1">
                <span className="col-span-4">Course</span>
                <span className="col-span-3">Grade</span>
                <span className="col-span-2">Points</span>
                <span className="col-span-2">Credits</span>
                <span className="col-span-1"></span>
              </div>
              {gpaRows.map(g => (
                <div key={g.id} className="grid grid-cols-12 gap-2 items-center">
                  <input type="text" value={g.course} onChange={e => updateGPARow(g.id, 'course', e.target.value)} placeholder="Course name" className="col-span-4 px-2 py-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <select value={g.grade} onChange={e => updateGPARow(g.id, 'grade', e.target.value)} className="col-span-3 px-2 py-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    {Object.keys(scale).map(letter => <option key={letter} value={letter}>{letter}</option>)}
                  </select>
                  <input type="number" step="0.1" value={g.gradePoint} onChange={e => updateGPARow(g.id, 'gradePoint', e.target.value)} className="col-span-2 px-2 py-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <input type="number" value={g.credits} onChange={e => updateGPARow(g.id, 'credits', e.target.value)} className="col-span-2 px-2 py-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <button onClick={() => removeGPARow(g.id)} className="col-span-1 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} className="text-red-500 mx-auto" /></button>
                </div>
              ))}
            </div>
            <button onClick={addGPARow} className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4"><Plus size={14} /> Add course</button>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {gpaResult() && (
                <div className="flex items-center gap-3">
                  <Award size={24} className="text-indigo-500" />
                  <p className="text-lg font-bold">GPA: <span className="text-indigo-600 dark:text-indigo-400">{gpaResult()}</span></p>
                </div>
              )}
              {!gpaResult() && <p className="text-gray-500 text-sm">Add courses to calculate GPA</p>}
              <p className="text-xs text-gray-500 mt-2">GPA systems vary by school and country. Verify the scale used by your institution.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
