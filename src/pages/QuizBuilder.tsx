import { useState, useEffect } from 'react';
import { Plus, Trash2, Play, RotateCw, Award } from 'lucide-react';
import { dbGetAll, dbPut, dbDelete } from '../lib/storage';
import type { Quiz, QuizQuestion } from '../types';
import { v4 as uuid } from 'uuid';

export default function QuizBuilderPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '' });
  const [newQuestion, setNewQuestion] = useState<Partial<QuizQuestion>>({ type: 'multiple-choice', question: '', options: ['', '', '', ''], correctAnswer: '', points: 1 });

  useEffect(() => { loadQuizzes(); }, []);

  const loadQuizzes = async () => {
    const data = await dbGetAll<Quiz>('quizzes');
    setQuizzes(data);
  };

  const createQuiz = async () => {
    if (!form.name.trim()) return;
    const quiz: Quiz = { id: uuid(), name: form.name.trim(), subject: form.subject.trim(), questions: [], createdAt: new Date().toISOString() };
    await dbPut('quizzes', quiz);
    setForm({ name: '', subject: '' });
    setShowCreate(false);
    loadQuizzes();
  };

  const deleteQuiz = async (id: string) => {
    await dbDelete('quizzes', id);
    if (activeQuiz?.id === id) setActiveQuiz(null);
    loadQuizzes();
  };

  const addQuestion = async () => {
    if (!activeQuiz || !newQuestion.question?.trim()) return;
    const q: QuizQuestion = {
      id: uuid(), type: newQuestion.type as QuizQuestion['type'],
      question: newQuestion.question.trim(),
      options: newQuestion.type === 'short-answer' ? [] : (newQuestion.options || []).filter(o => o.trim()),
      correctAnswer: newQuestion.correctAnswer?.trim() || '',
      points: newQuestion.points || 1,
    };
    const updated = { ...activeQuiz, questions: [...activeQuiz.questions, q] };
    await dbPut('quizzes', updated);
    setActiveQuiz(updated);
    setNewQuestion({ type: 'multiple-choice', question: '', options: ['', '', '', ''], correctAnswer: '', points: 1 });
    loadQuizzes();
  };

  const startQuiz = () => {
    if (!activeQuiz || activeQuiz.questions.length === 0) return;
    const shuffled = [...activeQuiz.questions].sort(() => Math.random() - 0.5);
    setActiveQuiz({ ...activeQuiz, questions: shuffled });
    setCurrentQ(0);
    setScore(0);
    setAnswer('');
    setShowResult(false);
    setQuizFinished(false);
    setStudyMode(true);
  };

  const submitAnswer = () => {
    if (!activeQuiz) return;
    const q = activeQuiz.questions[currentQ];
    const isCorrect = answer.trim().toLowerCase() === q.correctAnswer.toLowerCase();
    if (isCorrect) setScore(prev => prev + q.points);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQ < activeQuiz.questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setAnswer('');
      setShowResult(false);
    } else {
      setQuizFinished(true);
      // Save stats
      const maxScore = activeQuiz.questions.reduce((s, q) => s + q.points, 0);
      try {
        const stats = JSON.parse(localStorage.getItem('studyscope_stats') || '{}');
        stats.quizScores = [...(stats.quizScores || []), Math.round((score / maxScore) * 100)];
        localStorage.setItem('studyscope_stats', JSON.stringify(stats));
      } catch { /* ignore */ }
    }
  };

  if (studyMode && activeQuiz && !quizFinished) {
    const q = activeQuiz.questions[currentQ];
    const maxScore = activeQuiz.questions.reduce((s, qu) => s + qu.points, 0);
    return (
      <div className="max-w-lg mx-auto pb-20 lg:pb-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStudyMode(false)} className="text-sm text-gray-500 hover:text-gray-700">Exit Quiz</button>
          <span className="text-sm text-gray-500">{currentQ + 1}/{activeQuiz.questions.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((currentQ + 1) / activeQuiz.questions.length) * 100}%` }} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-xs text-gray-500 mb-1">{q.type === 'short-answer' ? 'Short Answer' : q.type === 'true-false' ? 'True/False' : 'Multiple Choice'} • {q.points} pt{q.points > 1 ? 's' : ''}</p>
          <p className="text-lg font-medium mb-4">{q.question}</p>
          {q.type === 'multiple-choice' ? (
            <div className="space-y-2 mb-4">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => !showResult && setAnswer(opt)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${answer === opt ? (showResult ? (opt.toLowerCase() === q.correctAnswer.toLowerCase() ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20') : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20') : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}>
                  {opt}
                </button>
              ))}
            </div>
          ) : q.type === 'true-false' ? (
            <div className="flex gap-3 mb-4">
              {['True', 'False'].map(opt => (
                <button key={opt} onClick={() => !showResult && setAnswer(opt)}
                  className={`flex-1 py-3 rounded-lg border font-medium ${answer === opt ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-600'}`}>{opt}</button>
              ))}
            </div>
          ) : (
            <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} disabled={showResult} placeholder="Your answer..." className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          )}
          {showResult && (
            <p className={`text-sm font-medium mb-3 ${answer.toLowerCase() === q.correctAnswer.toLowerCase() ? 'text-green-600' : 'text-red-600'}`}>
              {answer.toLowerCase() === q.correctAnswer.toLowerCase() ? '✓ Correct!' : `✗ Correct answer: ${q.correctAnswer}`}
            </p>
          )}
          {!showResult ? (
            <button onClick={submitAnswer} disabled={!answer} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">Submit</button>
          ) : (
            <button onClick={nextQuestion} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">{currentQ < activeQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</button>
          )}
        </div>
        <p className="text-center text-sm text-gray-500 mt-3">Score: {score}/{maxScore}</p>
      </div>
    );
  }

  if (studyMode && quizFinished && activeQuiz) {
    const maxScore = activeQuiz.questions.reduce((s, q) => s + q.points, 0);
    const pct = Math.round((score / maxScore) * 100);
    return (
      <div className="max-w-lg mx-auto pb-20 lg:pb-0 text-center">
        <Award size={48} className="mx-auto mb-4 text-indigo-500" />
        <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{pct}%</p>
        <p className="text-gray-500 mb-6">{score} out of {maxScore} points</p>
        <div className="flex gap-3 justify-center">
          <button onClick={startQuiz} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><RotateCw size={16} /> Retake</button>
          <button onClick={() => setStudyMode(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Done</button>
        </div>
      </div>
    );
  }

  if (activeQuiz) {
    return (
      <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
        <button onClick={() => setActiveQuiz(null)} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back</button>
        <h1 className="text-2xl font-bold mb-1">{activeQuiz.name}</h1>
        <p className="text-gray-500 text-sm mb-4">{activeQuiz.questions.length} questions</p>

        <button onClick={startQuiz} disabled={activeQuiz.questions.length === 0} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 mb-6"><Play size={16} /> Start Quiz</button>

        {/* Add Question */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3">Add Question</h3>
          <div className="space-y-3">
            <select value={newQuestion.type} onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value as QuizQuestion['type'] })} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm">
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
            </select>
            <textarea value={newQuestion.question} onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })} placeholder="Question text" rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {newQuestion.type === 'multiple-choice' && (
              <div className="space-y-2">
                {(newQuestion.options || ['', '', '', '']).map((opt, i) => (
                  <input key={i} type="text" value={opt} onChange={e => { const opts = [...(newQuestion.options || ['', '', '', ''])]; opts[i] = e.target.value; setNewQuestion({ ...newQuestion, options: opts }); }} placeholder={`Option ${i + 1}`} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                ))}
              </div>
            )}
            <input type="text" value={newQuestion.correctAnswer} onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })} placeholder="Correct answer" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={addQuestion} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Add Question</button>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-2">
          {activeQuiz.questions.map((q, i) => (
            <div key={q.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{i + 1}. {q.question}</p>
                <p className="text-xs text-gray-500 mt-1">Answer: {q.correctAnswer} • {q.points} pt</p>
              </div>
              <button onClick={async () => { const updated = { ...activeQuiz, questions: activeQuiz.questions.filter(qu => qu.id !== q.id) }; await dbPut('quizzes', updated); setActiveQuiz(updated); loadQuizzes(); }} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} className="text-red-500" /></button>
            </div>
          ))}
        </div>

        <button onClick={async () => { await deleteQuiz(activeQuiz.id); }} className="mt-4 text-sm text-red-500 hover:underline">Delete quiz</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quiz Builder</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><Plus size={16} /> New Quiz</button>
      </div>
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="space-y-3">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Quiz name" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={createQuiz} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Quiz</button>
          </div>
        </div>
      )}
      {quizzes.length === 0 ? (
        <div className="text-center py-16 text-gray-500"><p className="text-lg mb-2">No quizzes yet</p><p className="text-sm">Create a quiz to test your knowledge</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quizzes.map(q => (
            <button key={q.id} onClick={() => setActiveQuiz(q)} className="text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all">
              <h3 className="font-semibold">{q.name}</h3>
              {q.subject && <p className="text-sm text-gray-500">{q.subject}</p>}
              <p className="text-xs text-gray-400 mt-1">{q.questions.length} questions</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
