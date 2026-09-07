import {
  explainTopicService,
  solveDoubtService,
  generateQuizService,
  generateRoadmapService,
  generateFlashcardsService,
  generateNotesService,
} from '../services/aiService.js';
import Quiz from '../models/Quiz.js';
import Roadmap from '../models/Roadmap.js';
import FlashcardSet from '../models/FlashcardSet.js';
import Note from '../models/Note.js';

// @desc    Explain topic using Gemini AI
// @route   POST /api/ai/explain
// @access  Private / Public
export const explainTopic = async (req, res) => {
  try {
    const { topic, level, focus } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid topic name',
      });
    }

    const explanation = await explainTopicService({
      topic: topic.trim(),
      level: level || 'Intermediate',
      focus: focus || 'Concept Breakdown',
    });

    return res.status(200).json({
      success: true,
      ...explanation,
    });
  } catch (error) {
    console.error(`AI Explain Topic Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate topic explanation',
    });
  }
};

// @desc    Solve code/database doubt using Gemini AI
// @route   POST /api/ai/doubt
// @access  Private / Public
export const solveDoubt = async (req, res) => {
  try {
    const { category, title, code } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a doubt title or error summary',
      });
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the code snippet or schema for diagnosis',
      });
    }

    const solution = await solveDoubtService({
      category: category || 'compiler',
      title: title.trim(),
      code: code.trim(),
    });

    return res.status(200).json({
      success: true,
      ...solution,
    });
  } catch (error) {
    console.error(`AI Solve Doubt Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to diagnose code doubt',
    });
  }
};

// @desc    Generate structured quiz using Gemini AI & persist to MongoDB
// @route   POST /api/ai/quiz/generate
// @access  Private
export const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty, type, count, goal, roadmapId } = req.body;
    const userId = req.user._id;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a quiz topic',
      });
    }

    const quizData = await generateQuizService({
      topic: topic.trim(),
      difficulty: difficulty || 'Intermediate',
      type: type || 'Multiple Choice',
      count: parseInt(count, 10) || 5,
      goal: goal || 'Practice',
    });

    // Save generated quiz to MongoDB bound strictly to req.user._id
    const quizDoc = await Quiz.create({
      user: userId,
      title: quizData.title || `${topic} Quiz`,
      subject: topic.trim(),
      topic: topic.trim(),
      difficulty: difficulty || 'Intermediate',
      type: type || 'Multiple Choice',
      description: goal ? `Goal: ${goal}` : `Practice quiz on ${topic}`,
      questions: quizData.questions || [],
      timeLimit: (quizData.questions?.length || 5) * 90,
      roadmap: roadmapId || null,
    });

    return res.status(201).json({
      success: true,
      message: 'AI Quiz generated and saved successfully!',
      quiz: typeof quizDoc.toSafeObject === 'function' ? quizDoc.toSafeObject() : quizDoc,
    });
  } catch (error) {
    console.error(`AI Generate Quiz Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI quiz',
    });
  }
};

// @desc    Generate personalized learning roadmap using Gemini AI & persist to MongoDB
// @route   POST /api/ai/roadmap/generate
// @access  Private
export const generateRoadmap = async (req, res) => {
  try {
    const { goal, subject, currentLevel, targetLevel, dailyStudyTime, duration } = req.body;
    const userId = req.user._id;

    if (!goal || typeof goal !== 'string' || !goal.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a primary learning goal',
      });
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a subject topic',
      });
    }

    const roadmapData = await generateRoadmapService({
      goal: goal.trim(),
      subject: subject.trim(),
      currentLevel: currentLevel || 'Beginner',
      targetLevel: targetLevel || 'Advanced',
      dailyStudyTime: dailyStudyTime || '1 hour/day',
      duration: duration || '1 Month',
    });

    // Save generated roadmap to MongoDB bound strictly to req.user._id
    const roadmapDoc = await Roadmap.create({
      user: userId,
      title: roadmapData.title || goal.trim(),
      goal: goal.trim(),
      subject: subject.trim(),
      currentLevel: currentLevel || 'Beginner',
      targetLevel: targetLevel || 'Advanced',
      duration: duration || '1 Month',
      dailyStudyTime: dailyStudyTime || '1 hour/day',
      progress: 0,
      status: 'in-progress',
      topics: roadmapData.topics || [],
    });

    return res.status(201).json({
      success: true,
      message: 'AI Learning Roadmap generated and saved successfully!',
      roadmap: typeof roadmapDoc.toSafeObject === 'function' ? roadmapDoc.toSafeObject() : roadmapDoc,
    });
  } catch (error) {
    console.error(`AI Generate Roadmap Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI learning roadmap',
    });
  }
};

// @desc    Generate flashcard set using Gemini AI & persist to MongoDB
// @route   POST /api/ai/flashcards/generate
// @access  Private
export const generateFlashcards = async (req, res) => {
  try {
    const { topic, count } = req.body;
    const userId = req.user._id;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a topic for flashcards',
      });
    }

    const flashcardsData = await generateFlashcardsService({
      topic: topic.trim(),
      count: parseInt(count, 10) || 10,
    });

    // Save generated flashcards to MongoDB bound strictly to req.user._id
    const deckDoc = await FlashcardSet.create({
      user: userId,
      title: flashcardsData.title || `${topic} Flashcards`,
      subject: topic.trim(),
      topic: topic.trim(),
      totalCards: flashcardsData.cards?.length || 0,
      cards: flashcardsData.cards || [],
    });

    return res.status(201).json({
      success: true,
      message: 'AI Flashcards generated and saved successfully!',
      flashcards: typeof deckDoc.toSafeObject === 'function' ? deckDoc.toSafeObject() : deckDoc,
    });
  } catch (error) {
    console.error(`AI Generate Flashcards Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI flashcards',
    });
  }
};

// @desc    Generate revision notes using Gemini AI & persist to MongoDB
// @route   POST /api/ai/notes/generate
// @access  Private
export const generateNotes = async (req, res) => {
  try {
    const { topic, subject, level } = req.body;
    const userId = req.user._id;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a topic for revision notes',
      });
    }

    const notesData = await generateNotesService({
      topic: topic.trim(),
      subject: subject || 'General CS',
      level: level || 'Intermediate',
    });

    // Save generated note to MongoDB bound strictly to req.user._id
    const noteDoc = await Note.create({
      user: userId,
      title: notesData.title || `${topic} Revision Notes`,
      subject: subject || 'General CS',
      topic: topic.trim(),
      summary: notesData.summary || '',
      sections: notesData.sections || [],
      keyTakeaways: notesData.keyTakeaways || [],
      isFavorite: false,
    });

    return res.status(201).json({
      success: true,
      message: 'AI Revision Notes generated and saved successfully!',
      note: typeof noteDoc.toSafeObject === 'function' ? noteDoc.toSafeObject() : noteDoc,
    });
  } catch (error) {
    console.error(`AI Generate Notes Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI revision notes',
    });
  }
};
