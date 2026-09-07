import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, Plus, Trash2, ArrowLeft, ArrowRight, RotateCcw, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { useFlashcards } from '../../context/FlashcardContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loader';
import Flashcard from '../../components/flashcards/Flashcard';
import DeckProgress from '../../components/flashcards/DeckProgress';
import { toast } from 'react-hot-toast';

const TOPIC_EXAMPLES = [
  'React Hooks & State',
  'SQL Database Joins',
  'System Design Pillars',
  'Git Commands Cheat',
];

const COUNTS = ['5', '10', '15', '20'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Flashcards() {
  const {
    decks,
    activeDeck,
    currentCardIndex,
    setCurrentCardIndex,
    isGenerating,
    isLoadingDecks,
    generateDeck,
    updateCardStatus,
    resetDeck,
    deleteDeck,
    selectDeck,
    closeDeck
  } = useFlashcards();

  const [topic, setTopic] = useState('');
  const [count, setCount] = useState('5');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [loadingStep, setLoadingStep] = useState(0);

  // SEO Update
  useEffect(() => {
    document.title = "AI Flashcards - AI Learning Platform";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Study and master core definitions, code terminology, and exam questions with interactive flippable memory cards.');
    }
  }, []);

  // Cycle loading status messages
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingStep(step => (step + 1) % 4);
    }, 450);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a flashcard topic.');
      return;
    }

    try {
      await generateDeck(topic, count, difficulty);
      toast.success('Flashcard deck created successfully!');
      setTopic('');
    } catch {
      toast.error('Failed to generate flashcard deck.');
    }
  };

  const handleRating = (rating) => {
    if (!activeDeck) return;
    const currentCard = activeDeck.cards[currentCardIndex];
    
    // Update card rating
    updateCardStatus(activeDeck.id, currentCard.id, rating);
    
    // Feedback toast
    if (rating === 'known') {
      toast.success('Marked as Mastered! 🎉');
    } else if (rating === 'review') {
      toast.success('Marked for Review 🔍');
    } else {
      toast.error('Marked as Unfamiliar ❌');
    }

    // Auto-advance to next card if not the last one
    if (currentCardIndex < activeDeck.cards.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
      }, 500);
    } else {
      toast.success('You have finished reviewing all cards in this session!');
    }
  };

  const loadingMessages = [
    "Analyzing study topic vocabulary...",
    "Drafting core prompt questions...",
    "Formulating detailed definitions...",
    "Assembling your memory recall deck..."
  ];

  // 0. INITIAL LOADING SCREEN FROM MONGODB
  if (isLoadingDecks) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
        <PageHeader
          title="AI Flashcards"
          subtitle="Review core definitions and concepts using spaced-repetition Leitner study decks."
        />
        <PageLoader />
      </div>
    );
  }

  // 1. GENERATING LOADER SCREEN
  if (isGenerating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <Card className="max-w-md w-full p-8 flex flex-col items-center justify-center gap-6 shadow-lg border-indigo-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Layers className="text-indigo-600 animate-pulse" size={26} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-slate-800">AI is creating your flashcards...</h3>
            <p className="text-sm text-slate-500 min-h-[40px] px-4 leading-relaxed font-medium">
              {loadingMessages[loadingStep]}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // 2. ACTIVE STUDY DECK PLAY AREA
  if (activeDeck) {
    const totalCards = activeDeck.cards.length;
    const activeCard = activeDeck.cards[currentCardIndex];

    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-24 animate-fade-in">
        {/* Back control */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <button
            onClick={closeDeck}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Library</span>
          </button>
          <span className="text-xs font-bold text-slate-400">
            {activeDeck.difficulty} Deck
          </span>
        </div>

        {/* Deck Title */}
        <div>
          <Badge color="indigo" size="xs" className="mb-1 w-max">Active Review</Badge>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
            {activeDeck.topic}
          </h2>
        </div>

        {/* Live Deck Progress bar */}
        <DeckProgress cards={activeDeck.cards} />

        {/* Card Counter Info */}
        <div className="text-center font-bold text-slate-400 text-xs">
          Card {currentCardIndex + 1} of {totalCards}
        </div>

        {/* interactive 3D Flippable card */}
        <Flashcard card={activeCard} />

        {/* Leitner Feedback Selector Buttons */}
        <div className="space-y-3 pt-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">
            How well did you know this card?
          </span>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleRating('unknown')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                activeCard.status === 'unknown'
                  ? 'border-red-500 bg-red-50/50 text-red-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-650 hover:border-red-200 hover:bg-red-50/20'
              }`}
            >
              <AlertTriangle size={15} className="mb-1.5 text-red-500" />
              <span className="text-xs font-extrabold block">Don't Know</span>
              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Show again often</span>
            </button>

            <button
              onClick={() => handleRating('review')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                activeCard.status === 'review'
                  ? 'border-amber-500 bg-amber-50/50 text-amber-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-650 hover:border-amber-200 hover:bg-amber-50/20'
              }`}
            >
              <HelpCircle size={15} className="mb-1.5 text-amber-500" />
              <span className="text-xs font-extrabold block">Need Review</span>
              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Show moderately</span>
            </button>

            <button
              onClick={() => handleRating('known')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                activeCard.status === 'known'
                  ? 'border-emerald-500 bg-emerald-50/55 text-emerald-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-650 hover:border-emerald-250 hover:bg-emerald-50/20'
              }`}
            >
              <CheckCircle2 size={15} className="mb-1.5 text-emerald-500" />
              <span className="text-xs font-extrabold block">I Know It</span>
              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Mute for now</span>
            </button>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
            disabled={currentCardIndex === 0}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-650 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Previous</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => resetDeck(activeDeck.id)}
            leftIcon={<RotateCcw size={12} />}
            className="text-slate-500 border-slate-200 hover:border-slate-300"
          >
            Reset progress
          </Button>

          <button
            onClick={() => setCurrentCardIndex(prev => Math.min(totalCards - 1, prev + 1))}
            disabled={currentCardIndex === totalCards - 1}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-655 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <span>Next</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  // 3. DECK LIBRARY & GENERATOR CONFIG
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-24">
      <PageHeader
        title="AI Flashcards"
        subtitle="Review core definitions and concepts using spaced-repetition Leitner study decks."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Generator Form */}
        <div className="md:col-span-1">
          <Card className="shadow-sm">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-500" />
              Build New Deck
            </h3>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Topic / Vocabulary</label>
                <Input
                  id="flashcard-topic"
                  placeholder="e.g. React Hooks, SQL Joins..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-xs py-2"
                  required
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {TOPIC_EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setTopic(ex)}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cards Count</label>
                  <select
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="form-input text-xs py-1.5 cursor-pointer"
                  >
                    {COUNTS.map(c => <option key={c} value={c}>{c} Cards</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="form-input text-xs py-1.5 cursor-pointer"
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <Button
                id="btn-generate-deck"
                type="submit"
                variant="gradient"
                fullWidth
                size="sm"
                leftIcon={<Plus size={14} />}
                className="mt-2"
              >
                Create AI Deck
              </Button>
            </form>
          </Card>
        </div>

        {/* Decks Library list */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">Study Library</h3>
            <span className="text-[10px] text-slate-400 font-semibold">
              {decks.length} deck{decks.length !== 1 ? 's' : ''} available
            </span>
          </div>

          {decks.length === 0 ? (
            <Card className="py-12 border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <Layers className="text-slate-300" size={32} />
              <div>
                <h4 className="text-xs font-bold text-slate-700">No Decks Generated</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                  Configure topics in the setup panel on the left to create flippable flashcard decks.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {decks.map(deck => {
                const deckKey = deck.id || deck._id;
                const total = deck.cards ? deck.cards.length : 0;
                const masteredCount = deck.cards ? deck.cards.filter(c => c.status === 'known' || c.known).length : 0;
                const percentage = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

                return (
                  <Card key={deckKey} className="hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between p-5 min-h-[150px]">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <Badge size="xs">{deck.difficulty || 'Intermediate'}</Badge>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this flashcard deck?')) {
                              deleteDeck(deckKey);
                              toast.success('Deck deleted.');
                            }
                          }}
                          className="text-slate-350 hover:text-red-500 transition-colors p-1 rounded-md cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <h4 className="text-sm font-black text-slate-800 line-clamp-1 leading-snug">
                        {deck.topic || deck.title}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {total} Cards • {masteredCount} Mastered
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-4 mt-3">
                      {/* Linear miniature bar */}
                      <div className="flex-1">
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-[9px] font-semibold text-slate-400 mt-1 block">
                          {percentage}% Mastery
                        </span>
                      </div>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => selectDeck(deckKey)}
                        className="text-indigo-600 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/50 flex-shrink-0"
                      >
                        Study
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

