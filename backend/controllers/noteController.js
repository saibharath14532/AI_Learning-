import mongoose from 'mongoose';
import Note from '../models/Note.js';
import Roadmap from '../models/Roadmap.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
  try {
    const {
      title,
      subject,
      topic,
      type,
      difficulty,
      length,
      learningGoal,
      overview,
      sections,
      keyTakeaways,
      importantTerms,
      quickRevision,
      content,
      summary,
      tags,
      sourceType,
      roadmap,
    } = req.body;

    const finalTitle = (title || topic || subject || '').trim();
    const finalTopic = (topic || title || subject || '').trim();

    if (!finalTitle || !finalTopic) {
      return res.status(400).json({
        success: false,
        message: 'Title and topic are required to save a note',
      });
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

    const newNote = await Note.create({
      user: req.user._id,
      roadmap: roadmapId,
      title: finalTitle,
      subject: (subject || finalTopic).trim(),
      topic: finalTopic,
      type: type || 'Detailed Notes',
      difficulty: difficulty || 'Intermediate',
      length: length || 'Medium',
      learningGoal: learningGoal ? String(learningGoal).trim() : '',
      overview: overview ? String(overview).trim() : '',
      sections: Array.isArray(sections) ? sections : [],
      keyTakeaways: Array.isArray(keyTakeaways) ? keyTakeaways : [],
      importantTerms: Array.isArray(importantTerms) ? importantTerms : [],
      quickRevision: quickRevision ? String(quickRevision).trim() : '',
      content: content ? String(content).trim() : '',
      summary: summary ? String(summary).trim() : '',
      tags: Array.isArray(tags) ? tags : [],
      sourceType: sourceType || 'manual',
    });

    return res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note: newNote.toSafeObject(),
    });
  } catch (error) {
    console.error(`Create Note Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error creating note',
    });
  }
};

// @desc    Get all notes for authenticated user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const { subject, topic, roadmap, favorite, isFavorite, search } = req.query;

    const query = { user: req.user._id };

    if (subject) query.subject = new RegExp(subject, 'i');
    if (topic) query.topic = new RegExp(topic, 'i');
    if (roadmap && isValidObjectId(roadmap)) query.roadmap = roadmap;

    const favFlag = favorite !== undefined ? favorite : isFavorite;
    if (favFlag === 'true' || favFlag === true) {
      query.isFavorite = true;
    }

    if (search && String(search).trim() !== '') {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { topic: searchRegex },
        { subject: searchRegex },
        { overview: searchRegex },
        { content: searchRegex },
        { summary: searchRegex },
        { tags: searchRegex },
      ];
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });
    const safeNotes = notes.map(n => n.toSafeObject());

    return res.status(200).json({
      success: true,
      count: safeNotes.length,
      notes: safeNotes,
    });
  } catch (error) {
    console.error(`Get Notes Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving notes',
    });
  }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Private
export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this note.',
      });
    }

    return res.status(200).json({
      success: true,
      note: note.toSafeObject(),
    });
  } catch (error) {
    console.error(`Get Note By Id Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving note',
    });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this note.',
      });
    }

    const {
      title,
      subject,
      topic,
      type,
      difficulty,
      length,
      learningGoal,
      overview,
      sections,
      keyTakeaways,
      importantTerms,
      quickRevision,
      content,
      summary,
      tags,
      isFavorite,
      roadmap,
    } = req.body;

    if (title !== undefined) note.title = String(title).trim();
    if (subject !== undefined) note.subject = String(subject).trim();
    if (topic !== undefined) note.topic = String(topic).trim();
    if (type !== undefined) note.type = type;
    if (difficulty !== undefined) note.difficulty = difficulty;
    if (length !== undefined) note.length = length;
    if (learningGoal !== undefined) note.learningGoal = String(learningGoal).trim();
    if (overview !== undefined) note.overview = String(overview).trim();
    if (sections !== undefined && Array.isArray(sections)) note.sections = sections;
    if (keyTakeaways !== undefined && Array.isArray(keyTakeaways)) note.keyTakeaways = keyTakeaways;
    if (importantTerms !== undefined && Array.isArray(importantTerms)) note.importantTerms = importantTerms;
    if (quickRevision !== undefined) note.quickRevision = String(quickRevision).trim();
    if (content !== undefined) note.content = String(content).trim();
    if (summary !== undefined) note.summary = String(summary).trim();
    if (tags !== undefined && Array.isArray(tags)) note.tags = tags;
    if (isFavorite !== undefined) note.isFavorite = Boolean(isFavorite);

    if (roadmap !== undefined) {
      if (roadmap && isValidObjectId(roadmap)) {
        const existingRoadmap = await Roadmap.findById(roadmap);
        if (existingRoadmap && existingRoadmap.user.toString() === req.user._id.toString()) {
          note.roadmap = existingRoadmap._id;
        }
      } else {
        note.roadmap = null;
      }
    }

    const updatedNote = await note.save();

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote.toSafeObject(),
    });
  } catch (error) {
    console.error(`Update Note Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error updating note',
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this note.',
      });
    }

    await Note.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error(`Delete Note Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting note',
    });
  }
};

// @desc    Toggle favorite flag on note
// @route   PUT /api/notes/:id/favorite
// @access  Private
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this note.',
      });
    }

    note.isFavorite = !note.isFavorite;
    const updatedNote = await note.save();

    return res.status(200).json({
      success: true,
      message: 'Note favorite status updated',
      note: updatedNote.toSafeObject(),
    });
  } catch (error) {
    console.error(`Toggle Favorite Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error toggling favorite status',
    });
  }
};
