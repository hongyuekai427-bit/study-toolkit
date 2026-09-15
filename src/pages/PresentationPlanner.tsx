import { useState, useEffect } from 'react';
import { Plus, Trash2, Presentation as PresIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { dbGetAll, dbPut, dbDelete } from '../lib/storage';
import type { Presentation, PresentationSlide } from '../types';
import { v4 as uuid } from 'uuid';

export default function PresentationPlannerPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [activePres, setActivePres] = useState<Presentation | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '' });

  useEffect(() => { loadPresentations(); }, []);

  const loadPresentations = async () => {
    const data = await dbGetAll<Presentation>('presentations');
    setPresentations(data);
  };

  const createPresentation = async () => {
    if (!form.title.trim()) return;
    const pres: Presentation = {
      id: uuid(), title: form.title.trim(), subject: form.subject.trim(),
      slides: [{ id: uuid(), title: 'Title Slide', keyPoints: [], speakerNotes: '', visualIdea: '' }],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    await dbPut('presentations', pres);
    setForm({ title: '', subject: '' });
    setShowCreate(false);
    loadPresentations();
  };

  const savePresentation = async () => {
    if (!activePres) return;
    const updated = { ...activePres, updatedAt: new Date().toISOString() };
    await dbPut('presentations', updated);
    loadPresentations();
  };

  const deletePresentation = async (id: string) => {
    await dbDelete('presentations', id);
    if (activePres?.id === id) setActivePres(null);
    loadPresentations();
  };

  const addSlide = () => {
    if (!activePres) return;
    const slide: PresentationSlide = { id: uuid(), title: `Slide ${activePres.slides.length + 1}`, keyPoints: [], speakerNotes: '', visualIdea: '' };
    setActivePres({ ...activePres, slides: [...activePres.slides, slide] });
  };

  const removeSlide = (id: string) => {
    if (!activePres || activePres.slides.length <= 1) return;
    setActivePres({ ...activePres, slides: activePres.slides.filter(s => s.id !== id) });
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (!activePres) return;
    const slides = [...activePres.slides];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    [slides[index], slides[newIndex]] = [slides[newIndex], slides[index]];
    setActivePres({ ...activePres, slides });
  };

  const updateSlide = (slideId: string, field: string, value: string | string[]) => {
    if (!activePres) return;
    setActivePres({ ...activePres, slides: activePres.slides.map(s => s.id === slideId ? { ...s, [field]: value } : s) });
  };

  const addKeyPoint = (slideId: string) => {
    if (!activePres) return;
    setActivePres({ ...activePres, slides: activePres.slides.map(s => s.id === slideId ? { ...s, keyPoints: [...s.keyPoints, ''] } : s) });
  };

  const updateKeyPoint = (slideId: string, index: number, value: string) => {
    if (!activePres) return;
    setActivePres({ ...activePres, slides: activePres.slides.map(s => s.id === slideId ? { ...s, keyPoints: s.keyPoints.map((k, i) => i === index ? value : k) } : s) });
  };

  const removeKeyPoint = (slideId: string, index: number) => {
    if (!activePres) return;
    setActivePres({ ...activePres, slides: activePres.slides.map(s => s.id === slideId ? { ...s, keyPoints: s.keyPoints.filter((_, i) => i !== index) } : s) });
  };

  if (activePres) {
    return (
      <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
        <button onClick={() => { savePresentation(); setActivePres(null); }} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back</button>
        <h1 className="text-2xl font-bold mb-1">{activePres.title}</h1>
        {activePres.subject && <p className="text-gray-500 text-sm mb-6">{activePres.subject}</p>}

        <div className="space-y-4">
          {activePres.slides.map((slide, i) => (
            <div key={slide.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">Slide {i + 1}</span>
                  <input type="text" value={slide.title} onChange={e => updateSlide(slide.id, 'title', e.target.value)} className="font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-lg" />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveSlide(i, 'up')} disabled={i === 0} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowUp size={14} /></button>
                  <button onClick={() => moveSlide(i, 'down')} disabled={i === activePres.slides.length - 1} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"><ArrowDown size={14} /></button>
                  <button onClick={() => removeSlide(slide.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} className="text-red-500" /></button>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Key Points</label>
                  {slide.keyPoints.map((point, j) => (
                    <div key={j} className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 text-xs">•</span>
                      <input type="text" value={point} onChange={e => updateKeyPoint(slide.id, j, e.target.value)} placeholder="Key point..." className="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      <button onClick={() => removeKeyPoint(slide.id, j)} className="text-red-400 hover:text-red-600 text-xs">×</button>
                    </div>
                  ))}
                  <button onClick={() => addKeyPoint(slide.id)} className="text-xs text-indigo-500 hover:underline">+ Add point</button>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Speaker Notes</label>
                  <textarea value={slide.speakerNotes} onChange={e => updateSlide(slide.id, 'speakerNotes', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Notes for your presentation..." />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Visual Idea</label>
                  <input type="text" value={slide.visualIdea} onChange={e => updateSlide(slide.id, 'visualIdea', e.target.value)} placeholder="Image, diagram, chart idea..." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={addSlide} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><Plus size={16} /> Add Slide</button>
          <button onClick={savePresentation} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600">Save</button>
          <button onClick={() => deletePresentation(activePres.id)} className="ml-auto text-sm text-red-500 hover:underline">Delete</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Presentation Planner</h1>
          <p className="text-gray-500 text-sm">Plan presentations slide by slide.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><Plus size={16} /> New</button>
      </div>
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="space-y-3">
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Presentation title" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={createPresentation} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
          </div>
        </div>
      )}
      {presentations.length === 0 ? (
        <div className="text-center py-16 text-gray-500"><PresIcon size={48} className="mx-auto mb-4 opacity-50" /><p className="text-lg mb-2">No presentations yet</p></div>
      ) : (
        <div className="space-y-3">
          {presentations.map(p => (
            <button key={p.id} onClick={() => setActivePres(p)} className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all">
              <h3 className="font-semibold">{p.title}</h3>
              {p.subject && <p className="text-sm text-gray-500">{p.subject}</p>}
              <p className="text-xs text-gray-400 mt-1">{p.slides.length} slides</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
