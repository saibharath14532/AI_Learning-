import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { flashcardAPI, aiAPI } from '../services/api';
import { generateMockFlashcards } from '../data/mockData';
import { useAuth } from './AuthContext';

const FlashcardContext = createContext(null);

export function FlashcardProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [decks, setDecks] = useState(() => {
    const saved = localStorage.getItem('ailp_flashcards_decks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeDeckId, setActiveDeckId] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);

  // Sync to localStorage as local cache
  useEffect(() => {
    if (decks && decks.length > 0) {
      localStorage.setItem('ailp_flashcards_decks', JSON.stringify(decks));
    }
  }, [decks]);

  // Fetch flashcard sets from MongoDB
  const fetchDecks = useCallback(async () => {
    if (!isAuthenticated && !localStorage.getItem('ailp_token')) {
      setIsLoadingDecks(false);
      return;
    }

    setIsLoadingDecks(true);
    try {
      const res = await flashcardAPI.getAll();
      if (res.success && Array.isArray(res.flashcardSets)) {
        setDecks(res.flashcardSets);
      } else if (res.success && Array.isArray(res.decks)) {
        setDecks(res.decks);
      }
    } catch (err) {
      console.warn('Failed to fetch flashcard sets from MongoDB:', err);
    } finally {
      setIsLoadingDecks(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks, user?.id, user?._id]);

  // Generate & Create Deck in MongoDB via Gemini AI
  const generateDeck = useCallback(async (topic, count, difficulty, roadmapId = null) => {
    setIsGenerating(true);
    try {
      let newSet = null;

      // 1. Try backend Gemini AI endpoint first
      try {
        const aiRes = await aiAPI.generateFlashcards({ topic: topic.trim(), count: parseInt(count, 10) || 10 });
        if (aiRes.success && (aiRes.flashcards || aiRes.flashcardSet)) {
          newSet = aiRes.flashcards || aiRes.flashcardSet;
        }
      } catch (aiErr) {
        console.warn('AI Flashcards API generation failed, trying standard create endpoint:', aiErr);
      }

      // 2. Fallback to template + create set endpoint if AI endpoint fails
      if (!newSet) {
        const generatedCards = generateMockFlashcards(topic, count, difficulty);
        const payload = {
          title: `${topic.trim()} Deck`,
          subject: topic.trim(),
          topic: topic.trim(),
          difficulty: difficulty || 'Intermediate',
          description: `${count} flashcards on ${topic.trim()}`,
          cards: generatedCards,
          roadmap: roadmapId,
        };

        try {
          const res = await flashcardAPI.create(payload);
          if (res.success && res.flashcardSet) {
            newSet = res.flashcardSet;
          }
        } catch (apiErr) {
          console.warn('MongoDB API create set failed, using fallback object:', apiErr);
          newSet = {
            id: `deck_${Date.now()}`,
            topic: topic.trim(),
            difficulty,
            cards: generatedCards,
            createdAt: new Date().toISOString(),
          };
        }
      }

      setDecks(prev => [newSet, ...prev.filter(d => (d.id || d._id) !== (newSet.id || newSet._id))]);
      setActiveDeckId(newSet.id || newSet._id);
      setCurrentCardIndex(0);
      return newSet;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Update card rating & sync progress to MongoDB
  const updateCardStatus = useCallback(async (deckId, cardId, status) => {
    // Optimistic UI update
    setDecks(prevDecks =>
      prevDecks.map(deck => {
        const dId = deck.id || deck._id;
        if (dId !== deckId) return deck;
        return {
          ...deck,
          cards: deck.cards.map(card => {
            if (card.id !== cardId) return card;
            return { ...card, status, known: status === 'known' };
          })
        };
      })
    );

    // Sync progress to MongoDB
    if (deckId && !deckId.startsWith('deck_')) {
      try {
        const res = await flashcardAPI.updateCardProgress(deckId, cardId, { status });
        if (res.success && res.flashcardSet) {
          setDecks(prevDecks =>
            prevDecks.map(deck => ((deck.id || deck._id) === deckId ? res.flashcardSet : deck))
          );
        }
      } catch (err) {
        console.error('Failed to sync card progress to MongoDB:', err);
      }
    }
  }, []);

  // Reset deck state (make all unknown)
  const resetDeck = useCallback(async (deckId) => {
    setDecks(prevDecks =>
      prevDecks.map(deck => {
        const dId = deck.id || deck._id;
        if (dId !== deckId) return deck;
        const resetCards = deck.cards.map(card => ({ ...card, status: 'unknown', known: false }));
        return { ...deck, cards: resetCards, progress: 0, masteredCards: 0 };
      })
    );

    setCurrentCardIndex(0);

    // Sync reset to MongoDB if set has DB ID
    if (deckId && !deckId.startsWith('deck_')) {
      try {
        const targetDeck = decks.find(d => (d.id || d._id) === deckId);
        if (targetDeck) {
          const resetCards = targetDeck.cards.map(card => ({ ...card, status: 'unknown', known: false }));
          await flashcardAPI.update(deckId, { cards: resetCards });
        }
      } catch (err) {
        console.warn('Failed to sync deck reset to MongoDB:', err);
      }
    }
  }, [decks]);

  // Delete Deck
  const deleteDeck = useCallback(async (deckId) => {
    setDecks(prev => prev.filter(d => (d.id || d._id) !== deckId));
    if (activeDeckId === deckId) {
      setActiveDeckId(null);
      setCurrentCardIndex(0);
    }

    if (deckId && !deckId.startsWith('deck_')) {
      try {
        await flashcardAPI.delete(deckId);
      } catch (err) {
        console.warn('Failed to delete deck from MongoDB:', err);
      }
    }
  }, [activeDeckId]);

  // Select active deck
  const selectDeck = useCallback((deckId) => {
    setActiveDeckId(deckId);
    setCurrentCardIndex(0);
  }, []);

  // Close active deck
  const closeDeck = useCallback(() => {
    setActiveDeckId(null);
    setCurrentCardIndex(0);
  }, []);

  const activeDeck = decks.find(d => (d.id || d._id) === activeDeckId) || null;

  const value = {
    decks,
    activeDeck,
    currentCardIndex,
    setCurrentCardIndex,
    isGenerating,
    isLoadingDecks,
    fetchDecks,
    generateDeck,
    updateCardStatus,
    resetDeck,
    deleteDeck,
    selectDeck,
    closeDeck,
  };

  return <FlashcardContext.Provider value={value}>{children}</FlashcardContext.Provider>;
}

export function useFlashcards() {
  const ctx = useContext(FlashcardContext);
  if (!ctx) throw new Error('useFlashcards must be used within a FlashcardProvider');
  return ctx;
}

export default FlashcardContext;
