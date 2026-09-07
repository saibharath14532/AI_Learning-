import mongoose from 'mongoose';
import FlashcardSet from '../models/FlashcardSet.js';
import Roadmap from '../models/Roadmap.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new flashcard set
// @route   POST /api/flashcards
// @access  Private
export const createFlashcardSet = async (req, res) => {
  try {
    const {
      title,
      subject,
      topic,
      difficulty,
      description,
      cards,
      roadmap,
    } = req.body;

    const finalTopic = (topic || title || subject || '').trim();
    if (!finalTopic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required to create a flashcard set',
      });
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Flashcard set must contain at least one card',
      });
    }

    // Validate cards questions and answers
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const qText = (c.question || c.front || '').trim();
      const aText = (c.answer || c.back || '').trim();

      if (!qText || !aText) {
        return res.status(400).json({
          success: false,
          message: `Card at position ${i + 1} must have a valid question and answer`,
        });
      }
    }

    // Verify roadmap ownership if provided
    let roadmapId = null;
    if (roadmap) {
      if (!isValidObjectId(roadmap)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid roadmap ID format',
        });
      }
      const existingRoadmap = await Roadmap.findById(roadmap);
      if (!existingRoadmap || existingRoadmap.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Referenced roadmap not found or access denied',
        });
      }
      roadmapId = existingRoadmap._id;
    }

    const formattedCards = cards.map((c, idx) => {
      const qText = (c.question || c.front || '').trim();
      const aText = (c.answer || c.back || '').trim();
      const statusVal = c.status || (c.known ? 'known' : 'unknown');

      return {
        id: c.id || `fc_${Date.now()}_${idx + 1}`,
        question: qText,
        front: qText,
        answer: aText,
        back: aText,
        explanation: c.explanation ? String(c.explanation).trim() : '',
        difficulty: c.difficulty || difficulty || 'Intermediate',
        order: c.order || (idx + 1),
        status: ['known', 'review', 'unknown'].includes(statusVal) ? statusVal : 'unknown',
        known: statusVal === 'known',
      };
    });

    const newSet = await FlashcardSet.create({
      user: req.user._id,
      roadmap: roadmapId,
      title: (title || finalTopic).trim(),
      subject: (subject || finalTopic).trim(),
      topic: finalTopic,
      difficulty: difficulty || 'Intermediate',
      description: description ? String(description).trim() : '',
      cards: formattedCards,
    });

    return res.status(201).json({
      success: true,
      message: 'Flashcard set created successfully',
      flashcardSet: newSet.toSafeObject(),
    });
  } catch (error) {
    console.error(`Create FlashcardSet Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error creating flashcard set',
    });
  }
};

// @desc    Get all flashcard sets for authenticated user
// @route   GET /api/flashcards
// @access  Private
export const getFlashcardSets = async (req, res) => {
  try {
    const { subject, topic, roadmap } = req.query;

    const query = { user: req.user._id };
    if (subject) query.subject = new RegExp(subject, 'i');
    if (topic) query.topic = new RegExp(topic, 'i');
    if (roadmap && isValidObjectId(roadmap)) query.roadmap = roadmap;

    const sets = await FlashcardSet.find(query).sort({ createdAt: -1 });
    const safeSets = sets.map(s => s.toSafeObject());

    return res.status(200).json({
      success: true,
      count: safeSets.length,
      flashcardSets: safeSets,
    });
  } catch (error) {
    console.error(`Get FlashcardSets Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving flashcard sets',
    });
  }
};

// @desc    Get single flashcard set by ID
// @route   GET /api/flashcards/:id
// @access  Private
export const getFlashcardSetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
    }

    const set = await FlashcardSet.findById(id);

    if (!set) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
    }

    if (set.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this flashcard set.',
      });
    }

    return res.status(200).json({
      success: true,
      flashcardSet: set.toSafeObject(),
    });
  } catch (error) {
    console.error(`Get FlashcardSet By Id Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving flashcard set',
    });
  }
};

// @desc    Update flashcard set
// @route   PUT /api/flashcards/:id
// @access  Private
export const updateFlashcardSet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
    }

    const set = await FlashcardSet.findById(id);

    if (!set) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
    }

    if (set.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this flashcard set.',
      });
    }

    const {
      title,
      subject,
      topic,
      difficulty,
      description,
      cards,
    } = req.body;

    if (title !== undefined) set.title = String(title).trim();
    if (subject !== undefined) set.subject = String(subject).trim();
    if (topic !== undefined) set.topic = String(topic).trim();
    if (difficulty !== undefined) set.difficulty = difficulty;
    if (description !== undefined) set.description = String(description).trim();

    if (cards !== undefined && Array.isArray(cards)) {
      set.cards = cards.map((c, idx) => {
        const qText = (c.question || c.front || '').trim();
        const aText = (c.answer || c.back || '').trim();
        const statusVal = c.status || (c.known ? 'known' : 'unknown');

        return {
          id: c.id || `card_${idx + 1}`,
          question: qText,
          front: qText,
          answer: aText,
          back: aText,
          explanation: c.explanation ? String(c.explanation).trim() : '',
          difficulty: c.difficulty || set.difficulty || 'Intermediate',
          order: c.order || (idx + 1),
          status: ['known', 'review', 'unknown'].includes(statusVal) ? statusVal : 'unknown',
          known: statusVal === 'known',
        };
      });
    }

    const updatedSet = await set.save();

    return res.status(200).json({
      success: true,
      message: 'Flashcard set updated successfully',
      flashcardSet: updatedSet.toSafeObject(),
    });
  } catch (error) {
    console.error(`Update FlashcardSet Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error updating flashcard set',
    });
  }
};

// @desc    Delete flashcard set
// @route   DELETE /api/flashcards/:id
// @access  Private
export const deleteFlashcardSet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
    }

    const set = await FlashcardSet.findById(id);

    if (!set) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
    }

    if (set.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this flashcard set.',
      });
    }

    await FlashcardSet.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Flashcard set deleted successfully',
    });
  } catch (error) {
    console.error(`Delete FlashcardSet Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting flashcard set',
    });
  }
};

// @desc    Update single card status & recalculate set progress on server
// @route   PUT /api/flashcards/:id/progress
// @access  Private
export const updateCardProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardId, status, known } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
    }

    const set = await FlashcardSet.findById(id);

    if (!set) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard set not found',
      });
    }

    if (set.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this flashcard set.',
      });
    }

    if (!cardId) {
      return res.status(400).json({
        success: false,
        message: 'cardId is required',
      });
    }

    const targetCard = set.cards.find(c => c.id === cardId);
    if (!targetCard) {
      return res.status(404).json({
        success: false,
        message: 'Card not found in this flashcard set',
      });
    }

    let newStatus = status;
    if (!newStatus && known !== undefined) {
      newStatus = known ? 'known' : 'unknown';
    }

    if (!['known', 'review', 'unknown'].includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: known, review, unknown',
      });
    }

    targetCard.status = newStatus;
    targetCard.known = newStatus === 'known';

    // Mongoose pre('save') will automatically recalculate totalCards, masteredCards, progress, and status!
    const updatedSet = await set.save();

    return res.status(200).json({
      success: true,
      message: 'Card progress updated successfully',
      flashcardSet: updatedSet.toSafeObject(),
    });
  } catch (error) {
    console.error(`Update Card Progress Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error updating card progress',
    });
  }
};
