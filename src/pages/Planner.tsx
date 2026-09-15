import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Settings2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { dbGetAll, dbPut, dbDelete } from '../lib/storage';
import { useLocalStorage } from '../hooks';
import type { Subject, TimetableEntry } from '../types';
import { v4 as uuid } from 'uuid';

// Days ordered Monday to Sunday (1=Mon, 7=Sun)
const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 0, name: 'Sunday', short: 'Sun' },
];

const DEFAULT_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

export default function PlannerPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#6366f1', teacher: '', room: '' });
  const [selectedDay, setSelectedDay] = useState(1);
  const [timeSlots, setTimeSlots] = useLocalStorage<string[]>('timetableTimeSlots', DEFAULT_TIMES);
  const [showTimeManager, setShowTimeManager] = useState(false);
  const [newTime, setNewTime] = useState('08:00');
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [sortAscending, setSortAscending] = useState(true);

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
    for (const entry of timetable.filter(e => e.subjectId === id)) {
      await dbDelete('timetable', entry.id);
    }
    await dbDelete('subjects', id);
    loadData();
  };

  const addEntry = async (day: number, time: string) => {
    if (subjects.length === 0) return;
    // Find the next time slot for default end time
    const sorted = [...timeSlots].sort();
    const idx = sorted.indexOf(time);
    const endTime = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : time;
    const entry: TimetableEntry = {
      id: uuid(),
      subjectId: subjects[0].id,
      day,
      startTime: time,
      endTime,
    };
    await dbPut('timetable', entry);
    loadData();
  };

  const updateEntry = async (entry: TimetableEntry, updates: Partial<TimetableEntry>) => {
    await dbPut('timetable', { ...entry, ...updates });
    loadData();
  };

  const deleteEntry = async (id: string) => {
    await dbDelete('timetable', id);
    setEditingEntry(null);
    loadData();
  };

  const startEditEntry = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setEditSubjectId(entry.subjectId);
    setEditEndTime(entry.endTime || entry.startTime);
  };

  const saveEditEntry = async () => {
    if (!editingEntry) return;
    await updateEntry(editingEntry, {
      subjectId: editSubjectId,
      endTime: editEndTime,
    });
    setEditingEntry(null);
  };

  // Time slot management
  const addTimeSlot = () => {
    if (!newTime.trim()) return;
    // Validate time format
    const match = newTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return;
    const h = parseInt(match[1]);
    const m = parseInt(match[2]);
    if (h < 0 || h > 23 || m < 0 || m > 59) return;
    const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    if (timeSlots.includes(formatted)) return;
    setTimeSlots([...timeSlots, formatted].sort());
    setNewTime('');
  };

  const removeTimeSlot = (time: string) => {
    setTimeSlots(timeSlots.filter(t => t !== time));
  };

  const updateTimeSlot = (oldTime: string, newTimeValue: string) => {
    const match = newTimeValue.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return;
    const h = parseInt(match[1]);
    const m = parseInt(match[2]);
    if (h < 0 || h > 23 || m < 0 || m > 59) return;
    const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    if (timeSlots.includes(formatted)) return;
    const updated = timeSlots.map(t => t === oldTime ? formatted : t).sort();
    setTimeSlots(updated);
    // Update all entries with this time
    timetable.forEach(async entry => {
      if (entry.startTime === oldTime) {
        await dbPut('timetable', { ...entry, startTime: formatted });
      }
    });
    loadData();
  };

  const resetTimes = () => {
    setTimeSlots(DEFAULT_TIMES);
  };

  const sortedTimes = [...timeSlots].sort(sortAscending ? (a, b) => a.localeCompare(b) : (a, b) => b.localeCompare(a));

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Unknown';
  const getSubjectColor = (id: string) => subjects.find(s => s.id === id)?.color || '#6366f1';

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">School Planner</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowTimeManager(!showTimeManager)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm">
            <Clock size={16} /> Time Slots
          </button>
          <button onClick={() => setShowAddSubject(!showAddSubject)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
            <Plus size={16} /> Add Subject
          </button>
        </div>
      </div>

      {/* Time Slot Manager */}
      {showTimeManager && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Settings2 size={16} /> Manage Time Slots
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setSortAscending(!sortAscending)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title={sortAscending ? 'Sort ascending' : 'Sort descending'}>
                {sortAscending ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              <button onClick={resetTimes} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Reset to default</button>
            </div>
          </div>

          {/* Add new time */}
          <div className="flex gap-2 mb-3">
            <input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={addTimeSlot} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              <Plus size={14} />
            </button>
          </div>

          {/* Time slots list */}
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {sortedTimes.map(time => (
              <div key={time} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                <input
                  type="time"
                  defaultValue={time}
                  onBlur={e => {
                    if (e.target.value !== time) updateTimeSlot(time, e.target.value);
                  }}
                  className="bg-transparent text-sm font-mono focus:outline-none w-20"
                />
                <button onClick={() => removeTimeSlot(time)} className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30" aria-label="Remove time slot">
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </div>
            ))}
            {sortedTimes.length === 0 && (
              <p className="text-sm text-gray-500">No time slots. Add one above.</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Click any time to edit. Changes apply to existing classes.</p>
        </div>
      )}

      {/* Add Subject Form */}
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
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-medium">{s.name}</span>
                {s.teacher && <span className="text-xs text-gray-500">({s.teacher})</span>}
                {s.room && <span className="text-xs text-gray-400">• {s.room}</span>}
                <button onClick={() => deleteSubject(s.id)} className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Delete subject"><Trash2 size={12} className="text-red-500" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditingEntry(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-4">Edit Class</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Subject</label>
                <select value={editSubjectId} onChange={e => setEditSubjectId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">End Time</label>
                <input type="time" value={editEndTime} onChange={e => setEditEndTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-mono">{editingEntry.startTime}</span> • {DAYS.find(d => d.id === editingEntry.day)?.name}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveEditEntry} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Save</button>
              <button onClick={() => deleteEntry(editingEntry.id)} className="py-2 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm">Delete</button>
              <button onClick={() => setEditingEntry(null)} className="py-2 px-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Timetable */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Day tabs (mobile) */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 lg:hidden">
          {DAYS.map(day => (
            <button key={day.id} onClick={() => setSelectedDay(day.id)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${selectedDay === day.id ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
              {day.short}
            </button>
          ))}
        </div>

        {/* Desktop: Full week view */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="p-3 text-left text-xs font-medium text-gray-500 w-20 sticky left-0 bg-white dark:bg-gray-800 z-10">Time</th>
                {DAYS.map(day => (
                  <th key={day.id} className="p-3 text-left text-xs font-medium text-gray-500 min-w-[110px]">{day.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTimes.map(time => (
                <tr key={time} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-2 text-xs text-gray-500 font-mono sticky left-0 bg-white dark:bg-gray-800 z-10">{time}</td>
                  {DAYS.map(day => {
                    const entry = timetable.find(e => e.day === day.id && e.startTime === time);
                    return (
                      <td key={day.id} className="p-1 align-top">
                        {entry ? (
                          <button
                            onClick={() => startEditEntry(entry)}
                            className="w-full rounded p-2 text-xs text-white relative group text-left transition-all hover:shadow-md"
                            style={{ backgroundColor: getSubjectColor(entry.subjectId) }}
                          >
                            <span className="font-medium block truncate">{getSubjectName(entry.subjectId)}</span>
                            {entry.endTime && entry.endTime !== entry.startTime && (
                              <span className="text-[10px] opacity-80 block mt-0.5">{entry.startTime}–{entry.endTime}</span>
                            )}
                            <span className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 bg-black/20 rounded p-0.5 text-[10px]">✎</span>
                          </button>
                        ) : (
                          <button onClick={() => addEntry(day.id, time)} className="w-full h-10 rounded border border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-xs text-gray-400 hover:text-indigo-500">+</button>
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
          <h3 className="font-medium mb-3">{DAYS.find(d => d.id === selectedDay)?.name}</h3>
          {sortedTimes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No time slots configured. Tap "Time Slots" to add some.</p>
          ) : (
            <div className="space-y-2">
              {sortedTimes.map(time => {
                const entry = timetable.find(e => e.day === selectedDay && e.startTime === time);
                return (
                  <div key={time} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-mono w-12 shrink-0">{time}</span>
                    {entry ? (
                      <button
                        onClick={() => startEditEntry(entry)}
                        className="flex-1 rounded-lg p-3 text-white text-sm flex items-center justify-between hover:shadow-md transition-shadow"
                        style={{ backgroundColor: getSubjectColor(entry.subjectId) }}
                      >
                        <div>
                          <span className="font-medium block">{getSubjectName(entry.subjectId)}</span>
                          {entry.endTime && entry.endTime !== entry.startTime && (
                            <span className="text-xs opacity-80">until {entry.endTime}</span>
                          )}
                        </div>
                        <span className="text-xs opacity-70">✎</span>
                      </button>
                    ) : (
                      <button onClick={() => addEntry(selectedDay, time)} className="flex-1 py-2.5 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400 hover:text-indigo-500 hover:border-indigo-300">Add class</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {subjects.length === 0 && (
        <p className="text-center text-gray-500 mt-4 text-sm">Add subjects first to build your timetable.</p>
      )}

      {/* Help text */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>💡 Click any class to edit it. Click empty slots to add a class.</p>
        <p>💡 Use "Time Slots" to customize the schedule times (add, remove, or edit).</p>
      </div>
    </div>
  );
}
