import mongoose from 'mongoose';
import Roadmap from '../models/Roadmap.js';

// Helper function to check valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new roadmap
// @route   POST /api/roadmaps
// @access  Private
export const createRoadmap = async (req, res) => {
  try {
    const {
      title,
      goal,
      subject,
      currentLevel,
      targetLevel,
      duration,
      dailyStudyTime,
      progress,
      status,
      topics,
      modules,
    } = req.body;

    const finalSubject = (subject || goal || title || '').trim();
    if (!finalSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject or learning goal is required',
      });
    }

    if (progress !== undefined) {
      const numProgress = Number(progress);
      if (isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
        return res.status(400).json({
          success: false,
          message: 'Progress must be a number between 0 and 100',
        });
      }
    }

    if (status !== undefined && !['not-started', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: not-started, in-progress, completed',
      });
    }

    // Always assign ownership strictly via JWT (req.user._id)
    const newRoadmap = await Roadmap.create({
      user: req.user._id,
      title: (title || goal || finalSubject).trim(),
      goal: (goal || finalSubject).trim(),
      subject: finalSubject,
      currentLevel: currentLevel || 'Beginner',
      targetLevel: targetLevel || 'Advanced',
      duration: duration || '1 Month',
      dailyStudyTime: dailyStudyTime || '1 hour/day',
      progress: progress !== undefined ? Number(progress) : 0,
      status: status || 'in-progress',
      topics: Array.isArray(topics) ? topics : [],
      modules: Array.isArray(modules) ? modules : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Roadmap created successfully',
      roadmap: newRoadmap.toSafeObject(),
    });
  } catch (error) {
    console.error(`Create Roadmap Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error creating roadmap',
    });
  }
};

// @desc    Get all roadmaps for the authenticated user
// @route   GET /api/roadmaps
// @access  Private
export const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user._id }).sort({ createdAt: -1 });

    const safeRoadmaps = roadmaps.map((r) => r.toSafeObject());

    return res.status(200).json({
      success: true,
      count: safeRoadmaps.length,
      roadmaps: safeRoadmaps,
    });
  } catch (error) {
    console.error(`Get Roadmaps Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving roadmaps',
    });
  }
};

// @desc    Get single roadmap by ID
// @route   GET /api/roadmaps/:id
// @access  Private
export const getRoadmapById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    const roadmap = await Roadmap.findById(id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    // Verify User Ownership
    if (roadmap.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this roadmap.',
      });
    }

    return res.status(200).json({
      success: true,
      roadmap: roadmap.toSafeObject(),
    });
  } catch (error) {
    console.error(`Get Roadmap By Id Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving roadmap',
    });
  }
};

// @desc    Update roadmap by ID
// @route   PUT /api/roadmaps/:id
// @access  Private
export const updateRoadmap = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    const roadmap = await Roadmap.findById(id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    // Verify User Ownership
    if (roadmap.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this roadmap.',
      });
    }

    const {
      title,
      goal,
      subject,
      currentLevel,
      targetLevel,
      duration,
      dailyStudyTime,
      progress,
      status,
      topics,
      modules,
    } = req.body;

    if (progress !== undefined) {
      const numProgress = Number(progress);
      if (isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
        return res.status(400).json({
          success: false,
          message: 'Progress must be a number between 0 and 100',
        });
      }
      roadmap.progress = numProgress;
      if (numProgress === 100) {
        roadmap.status = 'completed';
      }
    }

    if (status !== undefined) {
      if (!['not-started', 'in-progress', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be one of: not-started, in-progress, completed',
        });
      }
      roadmap.status = status;
    }

    if (title !== undefined) roadmap.title = String(title).trim();
    if (goal !== undefined) roadmap.goal = String(goal).trim();
    if (subject !== undefined) roadmap.subject = String(subject).trim();
    if (currentLevel !== undefined) roadmap.currentLevel = currentLevel;
    if (targetLevel !== undefined) roadmap.targetLevel = targetLevel;
    if (duration !== undefined) roadmap.duration = duration;
    if (dailyStudyTime !== undefined) roadmap.dailyStudyTime = dailyStudyTime;
    if (topics !== undefined && Array.isArray(topics)) roadmap.topics = topics;
    if (modules !== undefined && Array.isArray(modules)) roadmap.modules = modules;

    const updatedRoadmap = await roadmap.save();

    return res.status(200).json({
      success: true,
      message: 'Roadmap updated successfully',
      roadmap: updatedRoadmap.toSafeObject(),
    });
  } catch (error) {
    console.error(`Update Roadmap Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error updating roadmap',
    });
  }
};

// @desc    Delete roadmap by ID
// @route   DELETE /api/roadmaps/:id
// @access  Private
export const deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    const roadmap = await Roadmap.findById(id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    // Verify User Ownership
    if (roadmap.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this roadmap.',
      });
    }

    await Roadmap.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Roadmap deleted successfully',
    });
  } catch (error) {
    console.error(`Delete Roadmap Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting roadmap',
    });
  }
};
