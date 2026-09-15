import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { dbGetAll, dbPut, dbDelete } from '../lib/storage';
import type { Subject, TimetableEntry } from '../types';
import { v4 as uuid } from 'uuid';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = Array.from({ length: 14 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

export default function PlannerPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#6366f1', teacher: '', room: '' });
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const subs = await dbGetAll<Subject>('subjects');
    setSubjects(subs);
    const entries = await dbGetAll<TimetableEntry>('timetable');
    setTimetable(entries);
  };

  const addSubject = async () => {
    if (!newSubject.name.trim()) return;
    const subject: Subject = { id: uuid(), ...newSubject };
    await dbPut('subjects', subject);
    setNewSubject({ name: '', color: '#6366f1', teacher: '', room: '' });
    setShowAddSubject(false);
    loadData();
  };

  const deleteSubject = async (id: string) => {
    await dbDelete('subjects', id);
    // Also remove timetable entries for this subject
    const entries = timetable.filter(e => e.subjectId !== id);
    for (const entry of timetable.filter(e => e.subjectId === id)) {
      await dbDelete('timetable', entry.id);
    }
    loadData();
  };

  const addEntry = async (day: number, time: string) => {
    if (subjects.length === 0) return;
    const entry: TimetableEntry = { id: uuid(), subjectId: subjects[0].id, day, startTime: time, endTime: time };
    await dbPut('timetable', entry);
    loadData();
  };

  const updateEntry = async (entry: TimetableEntry, field: string, value: string) => {
    await dbPut('timetable', { ...entry, [field]: value });
    loadData();
  };

  const deleteEntry = async (id: string) => {
    await dbDelete('timetable', id);
    loadData();
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';
  const getSubjectColor = (id: string) => subjects.find(s => s.id === id)?.color || '#6366f1';

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">School Planner</h1>
        <button onClick={() => setShowAddSubject(!showAddSubject)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {showAddSubject && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input type="text" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} placeholder="Subject name" className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="color" value={newSubject.color} onChange={e => setNewSubject({ ...newSubject, color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input type="text" value={newSubject.teacher} onChange={e => setNewSubject({ ...newSubject, teacher: e.target.value })} placeholder="Teacher (optional)" className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={newSubject.room} onChange={e => setNewSubject({ ...newSubject, room: e.target.value })} placeholder="Room (optional)" className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={addSubject} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Add Subject</button>
        </div>
      )}

      {/* Subjects List */}
      {subjects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Subjects</h2>
          <div className="flex flex-wrap gap-2">
            {subjects.map(s => (
              <div key={s.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-medium">{s.name}</span>
                {s.teacher && <span className="text-xs text-gray-500">({s.teacher})</span>}
                <button onClick={() => deleteSubject(s.id)} className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={12} className="text-red-500" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timetable */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Day tabs (mobile) */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 lg:hidden">
          {DAYS.slice(1, 6).map((day, i) => (
            <button key={day} onClick={() => setSelectedDay(i + 1)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${selectedDay === i + 1 ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Desktop: Full week view */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="p-3 text-left text-xs font-medium text-gray-500 w-20">Time</th>
                {DAYS.slice(1, 6).map(day => (
                  <th key={day} className="p-3 text-left text-xs font-medium text-gray-500">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map(time => (
                <tr key={time} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-2 text-xs text-gray-500 font-mono">{time}</td>
                  {DAYS.slice(1, 6).map((_, dayIdx) => {
                    const entry = timetable.find(e => e.day === dayIdx + 1 && e.startTime === time);
                    return (
                      <td key={dayIdx} className="p-1">
                        {entry ? (
                          <div className="rounded p-2 text-xs text-white relative group" style={{ backgroundColor: getSubjectColor(entry.subjectId) }}>
                            <span className="font-medium">{getSubjectName(entry.subjectId)}</span>
                            <button onClick={() => deleteEntry(entry.id)} className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 bg-black/20 rounded p-0.5">×</button>
                          </div>
                        ) : (
                          <button onClick={() => addEntry(dayIdx + 1, time)} className="w-full h-8 rounded border border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-xs text-gray-400 hover:text-indigo-500">+</button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Single day view */}
        <div className="lg:hidden p-4">
          <h3 className="font-medium mb-3">{DAYS[selectedDay]}</h3>
          <div className="space-y-2">
            {TIMES.map(time => {
              const entry = timetable.find(e => e.day === selectedDay && e.startTime === time);
              return (
                <div key={time} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-mono w-12">{time}</span>
                  {entry ? (
                    <div className="flex-1 rounded-lg p-3 text-white text-sm flex items-center justify-between" style={{ backgroundColor: getSubjectColor(entry.subjectId) }}>
                      <span className="font-medium">{getSubjectName(entry.subjectId)}</span>
                      <button onClick={() => deleteEntry(entry.id)} className="bg-black/20 rounded p-1 text-xs">×</button>
                    </div>
                  ) : (
                    <button onClick={() => addEntry(selectedDay, time)} className="flex-1 py-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400 hover:text-indigo-500 hover:border-indigo-300">Add class</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {subjects.length === 0 && (
        <p className="text-center text-gray-500 mt-4 text-sm">Add subjects first to build your timetable.</p>
      )}
    </div>
  );
}
