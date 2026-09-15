import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search, Pin, Star, Edit2, X, Save } from 'lucide-react';
import { dbGetAll, dbPut, dbDelete } from '../lib/storage';
import type { Note } from '../types';
import { v4 as uuid } from 'uuid';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    const data = await dbGetAll<Note>('notes');
    setNotes(data.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }));
  };

  const createNote = async () => {
    const note: Note = {
      id: uuid(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      pinned: false,
      favorite: false,
      subject: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dbPut('notes', note);
    setSelectedNote(note);
    setEditContent('');
    setEditTitle('Untitled Note');
    setEditTags('');
    setEditSubject('');
    setIsEditing(true);
    loadNotes();
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    const updated: Note = {
      ...selectedNote,
      title: editTitle.trim() || 'Untitled Note',
      content: editContent,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      subject: editSubject.trim(),
      updatedAt: new Date().toISOString(),
    };
    await dbPut('notes', updated);
    setSelectedNote(updated);
    setIsEditing(false);
    loadNotes();
  };

  const deleteNote = async (id: string) => {
    await dbDelete('notes', id);
    if (selectedNote?.id === id) { setSelectedNote(null); setIsEditing(false); }
    loadNotes();
  };

  const togglePin = async (note: Note) => {
    await dbPut('notes', { ...note, pinned: !note.pinned });
    loadNotes();
  };

  const toggleFavorite = async (note: Note) => {
    await dbPut('notes', { ...note, favorite: !note.favorite });
    loadNotes();
  };

  const filtered = notes.filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
  });

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setEditContent(note.content);
    setEditTitle(note.title);
    setEditTags(note.tags.join(', '));
    setEditSubject(note.subject);
    setIsEditing(false);
  };

  const exportNote = (note: Note) => {
    const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple markdown rendering
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/^- \[ \] (.+)$/gm, '<li class="ml-4">☐ $1</li>')
      .replace(/^- \[x\] (.+)$/gm, '<li class="ml-4 line-through text-gray-500">☑ $1</li>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-indigo-500 underline" target="_blank" rel="noopener">$1</a>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <button onClick={createNote} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> New Note
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar */}
        <div className="lg:w-80 shrink-0">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notes..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No notes yet</p>
            ) : (
              filtered.map(note => (
                <button key={note.id} onClick={() => selectNote(note)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${selectedNote?.id === note.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'}`}>
                  <div className="flex items-center gap-1">
                    {note.pinned && <Pin size={12} className="text-indigo-500" />}
                    {note.favorite && <Star size={12} className="text-yellow-500" />}
                    <p className="text-sm font-medium truncate">{note.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{note.content.slice(0, 60) || 'Empty note'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {note.subject && <span className="text-xs text-gray-400">{note.subject}</span>}
                    <span className="text-xs text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor/Preview */}
        <div className="flex-1 min-w-0">
          {selectedNote ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-lg font-bold bg-transparent border-none focus:outline-none" />
                  ) : (
                    <h2 className="text-lg font-bold">{selectedNote.title}</h2>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => togglePin(selectedNote)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Pin note">
                    <Pin size={16} className={selectedNote.pinned ? 'text-indigo-500' : 'text-gray-400'} />
                  </button>
                  <button onClick={() => toggleFavorite(selectedNote)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Favorite note">
                    <Star size={16} className={selectedNote.favorite ? 'text-yellow-500' : 'text-gray-400'} />
                  </button>
                  {isEditing ? (
                    <button onClick={saveNote} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"><Save size={14} /> Save</button>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"><Edit2 size={14} /> Edit</button>
                  )}
                  <button onClick={() => exportNote(selectedNote)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">Export</button>
                  <button onClick={() => deleteNote(selectedNote.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Delete note">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={editSubject} onChange={e => setEditSubject(e.target.value)} placeholder="Subject" className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="text" value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="Tags (comma separated)" className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <textarea ref={textareaRef} value={editContent} onChange={e => setEditContent(e.target.value)} placeholder="Write your note... (Markdown supported: # headings, **bold**, *italic*, - lists, [links](url))" className="w-full min-h-[400px] px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-y" />
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedNote.subject && <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">{selectedNote.subject}</span>}
                    {selectedNote.tags.map(tag => <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">#{tag}</span>)}
                  </div>
                  <div className="prose dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedNote.content || 'Empty note. Click Edit to start writing.') }} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">Select a note or create a new one</p>
              <button onClick={createNote} className="text-indigo-600 hover:underline">Create your first note</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
