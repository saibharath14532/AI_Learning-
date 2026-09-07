import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notesAPI, aiAPI } from '../services/api';
import { generateMockNotes } from '../data/mockData';
import { useAuth } from './AuthContext';

const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [savedNotes, setSavedNotes] = useState(() => {
    const saved = localStorage.getItem('ailp_saved_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeNote, setActiveNote] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  // Sync to localStorage as local cache
  useEffect(() => {
    if (savedNotes && savedNotes.length > 0) {
      localStorage.setItem('ailp_saved_notes', JSON.stringify(savedNotes));
    }
  }, [savedNotes]);

  // Fetch saved notes from MongoDB
  const fetchNotes = useCallback(async (params = {}) => {
    if (!isAuthenticated && !localStorage.getItem('ailp_token')) {
      setIsLoadingNotes(false);
      return;
    }

    setIsLoadingNotes(true);
    try {
      const res = await notesAPI.getAll(params);
      if (res.success && Array.isArray(res.notes)) {
        setSavedNotes(res.notes);
      }
    } catch (err) {
      console.warn('Failed to fetch notes from MongoDB:', err);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes, user?.id, user?._id]);

  // Generate Notes via Gemini AI
  const generateNotes = useCallback(async (topic, type, difficulty, length, learningGoal) => {
    setIsGenerating(true);
    try {
      let createdNote = null;
      try {
        const res = await aiAPI.generateNotes({ topic, subject: topic, level: difficulty, type, length, learningGoal });
        if (res.success && res.note) {
          createdNote = res.note;
          setSavedNotes(prev => [res.note, ...prev]);
        }
      } catch (aiErr) {
        console.warn('Backend AI Notes generation failed, using mock note builder fallback:', aiErr);
      }

      if (!createdNote) {
        createdNote = generateMockNotes(topic, type, difficulty, length, learningGoal);
      }

      setActiveNote(createdNote);
      return createdNote;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Save active note to MongoDB
  const saveNote = useCallback(async (noteToSave) => {
    let alreadySaved = false;

    // Check if already saved by ID or Topic/Type
    const noteId = noteToSave.id || noteToSave._id;
    const exists = savedNotes.some(
      n => (n.id || n._id) === noteId || (n.topic?.toLowerCase() === noteToSave.topic?.toLowerCase() && n.type === noteToSave.type)
    );

    if (exists) {
      alreadySaved = true;
    }

    const payload = {
      title: noteToSave.title || `${noteToSave.topic} Notes`,
      subject: noteToSave.subject || noteToSave.topic,
      topic: noteToSave.topic,
      type: noteToSave.type || 'Detailed Notes',
      difficulty: noteToSave.difficulty || 'Intermediate',
      length: noteToSave.length || 'Medium',
      learningGoal: noteToSave.learningGoal || '',
      overview: noteToSave.overview || '',
      sections: noteToSave.sections || [],
      keyTakeaways: noteToSave.keyTakeaways || [],
      importantTerms: noteToSave.importantTerms || [],
      quickRevision: noteToSave.quickRevision || '',
      content: noteToSave.content || noteToSave.overview || '',
      summary: noteToSave.summary || noteToSave.overview || '',
      tags: noteToSave.tags || [noteToSave.topic],
      sourceType: noteToSave.sourceType || 'manual',
      roadmap: noteToSave.roadmap || null,
    };

    let savedRecord = null;
    try {
      const res = await notesAPI.create(payload);
      if (res.success && res.note) {
        savedRecord = res.note;
      }
    } catch (apiErr) {
      console.warn('MongoDB API save note failed, using fallback:', apiErr);
    }

    if (!savedRecord) {
      savedRecord = {
        ...noteToSave,
        id: `saved_${Date.now()}`,
        savedAt: new Date().toISOString()
      };
    }

    setSavedNotes(prev => [
      savedRecord,
      ...prev.filter(n => (n.id || n._id) !== (savedRecord.id || savedRecord._id))
    ]);

    if (activeNote) {
      setActiveNote(savedRecord);
    }

    return !alreadySaved;
  }, [savedNotes, activeNote]);

  // Delete saved note
  const deleteNote = useCallback(async (noteId) => {
    setSavedNotes(prev => prev.filter(n => (n.id || n._id) !== noteId));

    if (activeNote && (activeNote.id === noteId || activeNote._id === noteId)) {
      setActiveNote(null);
    }

    if (noteId && !noteId.startsWith('saved_')) {
      try {
        await notesAPI.delete(noteId);
      } catch (err) {
        console.warn('Failed to delete note from MongoDB:', err);
      }
    }
  }, [activeNote]);

  // Toggle favorite on MongoDB
  const toggleFavoriteNote = useCallback(async (noteId) => {
    setSavedNotes(prev =>
      prev.map(n => {
        if ((n.id || n._id) === noteId) {
          return { ...n, isFavorite: !n.isFavorite };
        }
        return n;
      })
    );

    if (noteId && !noteId.startsWith('saved_')) {
      try {
        const res = await notesAPI.favorite(noteId);
        if (res.success && res.note) {
          setSavedNotes(prev =>
            prev.map(n => ((n.id || n._id) === noteId ? res.note : n))
          );
        }
      } catch (err) {
        console.warn('Failed to toggle favorite note on MongoDB:', err);
      }
    }
  }, []);

  // Select note to view
  const selectNote = useCallback((note) => {
    setActiveNote(note);
  }, []);

  // Clear active viewer
  const clearActiveNote = useCallback(() => {
    setActiveNote(null);
  }, []);

  const value = {
    savedNotes,
    activeNote,
    isGenerating,
    isLoadingNotes,
    fetchNotes,
    generateNotes,
    saveNote,
    deleteNote,
    toggleFavoriteNote,
    selectNote,
    clearActiveNote,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within a NotesProvider');
  return ctx;
}

export default NotesContext;
