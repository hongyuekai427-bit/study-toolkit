import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, RotateCw, Layers } from 'lucide-react';
import { dbGetAll, dbPut, dbDelete } from '../lib/storage';
import type { FlashcardDeck, Flashcard } from '../types';
import { v4 as uuid } from 'uuid';

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');

  useEffect(() => { loadDecks(); }, []);

  const loadDecks = async () => {
    const data = await dbGetAll<FlashcardDeck>('flashcards');
    setDecks(data);
  };

  const createDeck = async () => {
    if (!newDeckName.trim()) return;
    const deck: FlashcardDeck = {
      id: uuid(),
      name: newDeckName.trim(),
      subject: newDeckSubject.trim(),
      tags: [],
      cards: [],
      createdAt: new Date().toISOString(),
    };
    await dbPut('flashcards', deck);
    setNewDeckName('');
    setNewDeckSubject('');
    setShowCreateDeck(false);
    loadDecks();
  };

  const deleteDeck = async (id: string) => {
    await dbDelete('flashcards', id);
    if (activeDeck?.id === id) setActiveDeck(null);
    loadDecks();
  };

  const addCard = async () => {
    if (!activeDeck || !newCardFront.trim() || !newCardBack.trim()) return;
    const card: Flashcard = {
      id: uuid(),
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      difficulty: 0,
      lastReviewed: null,
      reviewCount: 0,
    };
    const updated = { ...activeDeck, cards: [...activeDeck.cards, card] };
    await dbPut('flashcards', updated);
    setActiveDeck(updated);
    setNewCardFront('');
    setNewCardBack('');
    setShowAddCard(false);
    loadDecks();
  };

  const deleteCard = async (cardId: string) => {
    if (!activeDeck) return;
    const updated = { ...activeDeck, cards: activeDeck.cards.filter(c => c.id !== cardId) };
    await dbPut('flashcards', updated);
    setActiveDeck(updated);
    loadDecks();
  };

  const rateCard = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!activeDeck) return;
    const card = activeDeck.cards[currentCardIndex];
    const diffMap = { again: 0, hard: 1, good: 2, easy: 3 };
    const updatedCard = { ...card, difficulty: diffMap[rating], lastReviewed: new Date().toISOString(), reviewCount: card.reviewCount + 1 };
    const updatedCards = [...activeDeck.cards];
    updatedCards[currentCardIndex] = updatedCard;
    const updated = { ...activeDeck, cards: updatedCards };
    await dbPut('flashcards', updated);
    setActiveDeck(updated);

    // Update stats
    try {
      const stats = JSON.parse(localStorage.getItem('studyscope_stats') || '{}');
      stats.flashcardsReviewed = (stats.flashcardsReviewed || 0) + 1;
      localStorage.setItem('studyscope_stats', JSON.stringify(stats));
    } catch { /* ignore */ }

    setShowAnswer(false);
    if (currentCardIndex < activeDeck.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setStudyMode(false);
      setCurrentCardIndex(0);
    }
  };

  const startStudy = () => {
    if (!activeDeck || activeDeck.cards.length === 0) return;
    // Shuffle cards for study
    const shuffled = [...activeDeck.cards].sort(() => Math.random() - 0.5);
    setActiveDeck({ ...activeDeck, cards: shuffled });
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyMode(true);
  };

  if (studyMode && activeDeck) {
    const card = activeDeck.cards[currentCardIndex];
    return (
      <div className="max-w-lg mx-auto pb-20 lg:pb-0">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setStudyMode(false)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700"><ArrowLeft size={18} /> Exit</button>
          <span className="text-sm text-gray-500">{currentCardIndex + 1} / {activeDeck.cards.length}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((currentCardIndex + 1) / activeDeck.cards.length) * 100}%` }} />
        </div>

        {/* Card */}
        <div onClick={() => setShowAnswer(!showAnswer)} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 min-h-[300px] flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow mb-6">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-2">{showAnswer ? 'Answer' : 'Question'}</p>
            <p className="text-xl font-medium">{showAnswer ? card.back : card.front}</p>
          </div>
        </div>

        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">Reveal Answer</button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => rateCard('again')} className="py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 text-sm">Again</button>
            <button onClick={() => rateCard('hard')} className="py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 text-sm">Hard</button>
            <button onClick={() => rateCard('good')} className="py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl font-medium hover:bg-green-200 dark:hover:bg-green-900/50 text-sm">Good</button>
            <button onClick={() => rateCard('easy')} className="py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 text-sm">Easy</button>
          </div>
        )}
      </div>
    );
  }

  if (activeDeck) {
    return (
      <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setActiveDeck(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700"><ArrowLeft size={18} /> Back</button>
          <button onClick={startStudy} disabled={activeDeck.cards.length === 0} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <RotateCw size={18} /> Study
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-1">{activeDeck.name}</h1>
        {activeDeck.subject && <p className="text-gray-500 mb-4">{activeDeck.subject}</p>}
        <p className="text-sm text-gray-500 mb-4">{activeDeck.cards.length} cards</p>

        <button onClick={() => setShowAddCard(!showAddCard)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 mb-4 text-sm">
          <Plus size={16} /> Add Card
        </button>

        {showAddCard && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
            <div className="space-y-3">
              <textarea value={newCardFront} onChange={e => setNewCardFront(e.target.value)} placeholder="Front (question)" rows={2} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              <textarea value={newCardBack} onChange={e => setNewCardBack(e.target.value)} placeholder="Back (answer)" rows={2} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              <button onClick={addCard} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Add Card</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {activeDeck.cards.map((card, i) => (
            <div key={card.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{card.front}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.back}</p>
                  {card.lastReviewed && <p className="text-xs text-gray-400 mt-1">Reviewed {new Date(card.lastReviewed).toLocaleDateString()} • {card.reviewCount} times</p>}
                </div>
                <button onClick={() => deleteCard(card.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} className="text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => deleteDeck(activeDeck.id)} className="mt-6 text-sm text-red-500 hover:underline">Delete this deck</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <button onClick={() => setShowCreateDeck(!showCreateDeck)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> New Deck
        </button>
      </div>

      {showCreateDeck && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="space-y-3">
            <input type="text" value={newDeckName} onChange={e => setNewDeckName(e.target.value)} placeholder="Deck name" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={newDeckSubject} onChange={e => setNewDeckSubject(e.target.value)} placeholder="Subject (optional)" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={createDeck} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Deck</button>
          </div>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Layers size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No flashcard decks yet</p>
          <p className="text-sm">Create a deck to start studying</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map(deck => (
            <button key={deck.id} onClick={() => setActiveDeck(deck)} className="text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all">
              <h3 className="font-semibold">{deck.name}</h3>
              {deck.subject && <p className="text-sm text-gray-500">{deck.subject}</p>}
              <p className="text-sm text-gray-400 mt-1">{deck.cards.length} cards</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
