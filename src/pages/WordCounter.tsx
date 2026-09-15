import { useState } from 'react';

export default function WordCounterPage() {
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  const readingTime = Math.ceil(words / 200);
  const speakingTime = Math.ceil(words / 130);

  return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Word Counter</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Analyze your text for word count, characters, and reading time.</p>

      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste or type your text here..." className="w-full min-h-[300px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{words}</p>
          <p className="text-xs text-gray-500">Words</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{characters}</p>
          <p className="text-xs text-gray-500">Characters</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{charactersNoSpaces}</p>
          <p className="text-xs text-gray-500">No Spaces</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{sentences}</p>
          <p className="text-xs text-gray-500">Sentences</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{paragraphs}</p>
          <p className="text-xs text-gray-500">Paragraphs</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{readingTime}m</p>
          <p className="text-xs text-gray-500">Read Time</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Reading time estimated at ~200 words/min. Speaking time: ~{speakingTime} min at ~130 words/min.</p>
    </div>
  );
}
