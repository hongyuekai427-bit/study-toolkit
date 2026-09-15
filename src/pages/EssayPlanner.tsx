import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { dbGetAll, dbPut, dbDelete } from '../lib/storage';
import type { EssayPlan } from '../types';
import { v4 as uuid } from 'uuid';

export default function EssayPlannerPage() {
  const [plans, setPlans] = useState<EssayPlan[]>([]);
  const [activePlan, setActivePlan] = useState<EssayPlan | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '' });

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    const data = await dbGetAll<EssayPlan>('essayPlans');
    setPlans(data);
  };

  const createPlan = async () => {
    if (!form.title.trim()) return;
    const plan: EssayPlan = {
      id: uuid(), title: form.title.trim(), subject: form.subject.trim(),
      introduction: { hook: '', context: '', thesis: '' },
      bodyParagraphs: [{ id: uuid(), topicSentence: '', evidence: '', explanation: '', example: '', link: '' }],
      conclusion: { restateThesis: '', summarizePoints: '', finalThought: '' },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await dbPut('essayPlans', plan);
    setForm({ title: '', subject: '' });
    setShowCreate(false);
    loadPlans();
  };

  const savePlan = async () => {
    if (!activePlan) return;
    const updated = { ...activePlan, updatedAt: new Date().toISOString() };
    await dbPut('essayPlans', updated);
    setActivePlan(updated);
    loadPlans();
  };

  const deletePlan = async (id: string) => {
    await dbDelete('essayPlans', id);
    if (activePlan?.id === id) setActivePlan(null);
    loadPlans();
  };

  const addParagraph = () => {
    if (!activePlan) return;
    const updated = { ...activePlan, bodyParagraphs: [...activePlan.bodyParagraphs, { id: uuid(), topicSentence: '', evidence: '', explanation: '', example: '', link: '' }] };
    setActivePlan(updated);
  };

  const removeParagraph = (id: string) => {
    if (!activePlan) return;
    const updated = { ...activePlan, bodyParagraphs: activePlan.bodyParagraphs.filter(p => p.id !== id) };
    setActivePlan(updated);
  };

  const updateIntro = (field: string, value: string) => {
    if (!activePlan) return;
    setActivePlan({ ...activePlan, introduction: { ...activePlan.introduction, [field]: value } });
  };

  const updateParagraph = (paraId: string, field: string, value: string) => {
    if (!activePlan) return;
    setActivePlan({ ...activePlan, bodyParagraphs: activePlan.bodyParagraphs.map(p => p.id === paraId ? { ...p, [field]: value } : p) });
  };

  const updateConclusion = (field: string, value: string) => {
    if (!activePlan) return;
    setActivePlan({ ...activePlan, conclusion: { ...activePlan.conclusion, [field]: value } });
  };

  if (activePlan) {
    return (
      <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
        <button onClick={() => { savePlan(); setActivePlan(null); }} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back</button>
        <h1 className="text-2xl font-bold mb-1">{activePlan.title}</h1>
        {activePlan.subject && <p className="text-gray-500 text-sm mb-6">{activePlan.subject}</p>}

        {/* Introduction */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs">1</span> Introduction</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Hook (attention grabber)</label>
              <textarea value={activePlan.introduction.hook} onChange={e => updateIntro('hook', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Start with something engaging..." />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Context / Background</label>
              <textarea value={activePlan.introduction.context} onChange={e => updateIntro('context', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Provide necessary background..." />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Thesis Statement</label>
              <textarea value={activePlan.introduction.thesis} onChange={e => updateIntro('thesis', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Your main argument or claim..." />
            </div>
          </div>
        </section>

        {/* Body Paragraphs */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs">2</span> Body Paragraphs</h2>
          {activePlan.bodyParagraphs.map((para, i) => (
            <div key={para.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Paragraph {i + 1}</h3>
                {activePlan.bodyParagraphs.length > 1 && <button onClick={() => removeParagraph(para.id)} className="text-xs text-red-500 hover:underline">Remove</button>}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Topic Sentence</label>
                  <textarea value={para.topicSentence} onChange={e => updateParagraph(para.id, 'topicSentence', e.target.value)} rows={1} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Evidence</label>
                    <textarea value={para.evidence} onChange={e => updateParagraph(para.id, 'evidence', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Explanation</label>
                    <textarea value={para.explanation} onChange={e => updateParagraph(para.id, 'explanation', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Example</label>
                    <textarea value={para.example} onChange={e => updateParagraph(para.id, 'example', e.target.value)} rows={1} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Link to thesis</label>
                    <textarea value={para.link} onChange={e => updateParagraph(para.id, 'link', e.target.value)} rows={1} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addParagraph} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"><Plus size={14} /> Add paragraph</button>
        </section>

        {/* Conclusion */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs">3</span> Conclusion</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Restate Thesis</label>
              <textarea value={activePlan.conclusion.restateThesis} onChange={e => updateConclusion('restateThesis', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Summarize Main Points</label>
              <textarea value={activePlan.conclusion.summarizePoints} onChange={e => updateConclusion('summarizePoints', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Final Thought</label>
              <textarea value={activePlan.conclusion.finalThought} onChange={e => updateConclusion('finalThought', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
          </div>
        </section>

        <button onClick={savePlan} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Save Plan</button>
        <button onClick={() => deletePlan(activePlan.id)} className="w-full mt-2 py-2 text-sm text-red-500 hover:underline">Delete this plan</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Essay Planner</h1>
          <p className="text-gray-500 text-sm">Structure your essays with introduction, body, and conclusion.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><Plus size={16} /> New Plan</button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="space-y-3">
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Essay title" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={createPlan} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Plan</button>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Edit3 size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No essay plans yet</p>
          <p className="text-sm">Create a plan to structure your essay</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <button key={plan.id} onClick={() => setActivePlan(plan)} className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all">
              <h3 className="font-semibold">{plan.title}</h3>
              {plan.subject && <p className="text-sm text-gray-500">{plan.subject}</p>}
              <p className="text-xs text-gray-400 mt-1">{plan.bodyParagraphs.length} body paragraphs • Updated {new Date(plan.updatedAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
