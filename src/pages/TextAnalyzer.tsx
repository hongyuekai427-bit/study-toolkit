import { useState } from 'react';

export default function TextAnalyzerPage() {
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/) : [];
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()) : [];
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()) : [];

  // Average sentence length
  const avgSentenceLength = sentences.length > 0 ? (words.length / sentences.length).toFixed(1) : '0';

  // Average word length
  const avgWordLength = words.length > 0 ? (words.join('').length / words.length).toFixed(1) : '0';

  // Long words (>6 chars)
  const longWords = words.filter(w => w.replace(/[^a-zA-Z]/g, '').length > 6);

  // Repeated words (frequency)
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-zA-Z]/g, '');
    if (clean.length > 2) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
  });
  const repeatedWords = Object.entries(wordFreq).filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Unique words
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-zA-Z]/g, '')).filter(w => w.length > 0));

  // Simple readability estimate (Flesch-like)
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const fleschScore = sentences.length > 0 && words.length > 0
    ? 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllableCount / words.length)
    : 0;

  function countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-zA-Z]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  const getReadability = (score: number) => {
    if (score >= 90) return { level: 'Very Easy', color: 'text-green-600' };
    if (score >= 80) return { level: 'Easy', color: 'text-green-500' };
    if (score >= 70) return { level: 'Fairly Easy', color: 'text-yellow-600' };
    if (score >= 60) return { level: 'Standard', color: 'text-yellow-500' };
    if (score >= 50) return { level: 'Fairly Difficult', color: 'text-orange-500' };
    if (score >= 30) return { level: 'Difficult', color: 'text-red-500' };
    return { level: 'Very Difficult', color: 'text-red-600' };
  };

  const readability = getReadability(fleschScore);

  return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Text Analyzer</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Analyze writing for readability, patterns, and word usage.</p>

      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste your text here to analyze..." className="w-full min-h-[200px] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y mb-6" />

      {text.trim() && (
        <div className="space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-xl font-bold">{avgSentenceLength}</p>
              <p className="text-xs text-gray-500">Avg Words/Sentence</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-xl font-bold">{avgWordLength}</p>
              <p className="text-xs text-gray-500">Avg Word Length</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-xl font-bold">{uniqueWords.size}</p>
              <p className="text-xs text-gray-500">Unique Words</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-xl font-bold">{longWords.length}</p>
              <p className="text-xs text-gray-500">Long Words (6+)</p>
            </div>
          </div>

          {/* Readability */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold mb-2">Readability Estimate</h3>
            <div className="flex items-center gap-3">
              <p className={`text-2xl font-bold ${readability.color}`}>{Math.round(fleschScore)}</p>
              <div>
                <p className={`font-medium ${readability.color}`}>{readability.level}</p>
                <p className="text-xs text-gray-500">Flesch Reading Ease (0-100, higher = easier)</p>
              </div>
            </div>
          </div>

          {/* Repeated Words */}
          {repeatedWords.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold mb-2">Most Frequent Words</h3>
              <div className="flex flex-wrap gap-2">
                {repeatedWords.map(([word, count]) => (
                  <span key={word} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                    <span className="font-medium">{word}</span>
                    <span className="text-gray-500 ml-1">×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Paragraph Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold mb-2">Paragraph Analysis</h3>
            <div className="space-y-1">
              {paragraphs.map((p, i) => {
                const pWords = p.trim().split(/\s+/).length;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-16">P{i + 1}:</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, pWords * 2)}%` }} />
                    </div>
                    <span className="text-gray-500 w-16 text-right">{pWords} words</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
