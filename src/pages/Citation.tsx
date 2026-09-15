import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

type CitationFormat = 'apa' | 'mla' | 'chicago';
type SourceType = 'book' | 'website' | 'journal' | 'video';

export default function CitationPage() {
  const [format, setFormat] = useState<CitationFormat>('apa');
  const [sourceType, setSourceType] = useState<SourceType>('website');
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [date, setDate] = useState('');
  const [url, setUrl] = useState('');
  const [accessDate, setAccessDate] = useState('');
  const [journalName, setJournalName] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCitation = (): string => {
    const a = author.trim() || 'Unknown Author';
    const t = title.trim() || 'Untitled';
    const d = date.trim() || 'n.d.';
    const p = publisher.trim();
    const u = url.trim();
    const ad = accessDate.trim();

    switch (format) {
      case 'apa': {
        if (sourceType === 'website') {
          return `${a} (${d}). ${t}. ${p ? p + '.' : ''}${u ? ' Retrieved from ' + u : ''}${ad ? ' (Accessed: ' + ad + ')' : ''}`;
        }
        if (sourceType === 'book') {
          return `${a} (${d}). ${t}. ${p || 'Publisher'}.`;
        }
        if (sourceType === 'journal') {
          return `${a} (${d}). ${t}. ${journalName}, ${volume}${issue ? '(' + issue + ')' : ''}${pages ? ', ' + pages : ''}.`;
        }
        return `${a} (${d}). ${t} [Video]. ${p || 'YouTube'}.${u ? ' ' + u : ''}`;
      }
      case 'mla': {
        if (sourceType === 'website') {
          return `${a}. "${t}." ${p ? p + ', ' : ''}${d}.${u ? ' ' + u : ''}${ad ? ' Accessed ' + ad + '.' : ''}`;
        }
        if (sourceType === 'book') {
          return `${a}. ${t}. ${p || 'Publisher'}, ${d}.`;
        }
        if (sourceType === 'journal') {
          return `${a}. "${t}." ${journalName}, vol. ${volume}, no. ${issue}, ${d}${pages ? ', pp. ' + pages : ''}.`;
        }
        return `${a}. "${t}." ${p || 'YouTube'}, ${d}.${u ? ' ' + u : ''}`;
      }
      case 'chicago': {
        if (sourceType === 'website') {
          return `${a}. "${t}." ${p ? p + '. ' : ''}${d}.${u ? ' ' + u : ''}${ad ? '. Accessed ' + ad : ''}.`;
        }
        if (sourceType === 'book') {
          return `${a}. ${t}. ${p ? p + ', ' : ''}${d}.`;
        }
        if (sourceType === 'journal') {
          return `${a}. "${t}." ${journalName} ${volume}, no. ${issue} (${d})${pages ? ': ' + pages : ''}.`;
        }
        return `${a}. "${t}." ${p || 'YouTube'}, ${d}.${u ? ' ' + u : ''}`;
      }
    }
  };

  const citation = generateCitation();

  const copyCitation = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Citation Generator</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Generate citations in APA, MLA, and Chicago formats.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['apa', 'mla', 'chicago'] as CitationFormat[]).map(f => (
          <button key={f} onClick={() => setFormat(f)} className={`px-4 py-2 text-sm rounded-lg transition-colors ${format === f ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['website', 'book', 'journal', 'video'] as SourceType[]).map(t => (
          <button key={t} onClick={() => setSourceType(t)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${sourceType === t ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Author(s)</label>
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Last, First M." className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title of work" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Date/Year</label>
              <input type="text" value={date} onChange={e => setDate(e.target.value)} placeholder="2024" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">{sourceType === 'journal' ? 'Journal Name' : 'Publisher/Site'}</label>
              <input type="text" value={sourceType === 'journal' ? journalName : publisher} onChange={e => sourceType === 'journal' ? setJournalName(e.target.value) : setPublisher(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          {sourceType === 'journal' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Volume</label>
                <input type="text" value={volume} onChange={e => setVolume(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Issue</label>
                <input type="text" value={issue} onChange={e => setIssue(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Pages</label>
                <input type="text" value={pages} onChange={e => setPages(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-500 block mb-1">URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Access Date</label>
            <input type="date" value={accessDate} onChange={e => setAccessDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Result */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-mono leading-relaxed flex-1">{citation}</p>
            <button onClick={copyCitation} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 shrink-0" aria-label="Copy citation">
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">⚠️ Check your school's required citation guidelines. Generated citations should be verified for accuracy.</p>
      </div>
    </div>
  );
}
