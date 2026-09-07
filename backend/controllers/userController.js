import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    let user = req.user;
    if (!user || typeof user.toSafeObject !== 'function') {
      user = await User.findById(req.user?._id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error(`Get Profile Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 1. Validate fields if they are provided in request body
    const {
      name, phone, institution, course, year, level,
      learningGoal, preferredStudyTime, dailyGoal, learningStyle,
      avatar, bio, notificationsSettings
    } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty',
        });
      }
      if (name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot exceed 100 characters',
        });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone === 'string' && phone.trim().length > 30) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is too long',
        });
      }
      user.phone = typeof phone === 'string' ? phone.trim() : '';
    }

    if (institution !== undefined) {
      if (typeof institution === 'string' && institution.trim().length > 150) {
        return res.status(400).json({
          success: false,
          message: 'Institution name cannot exceed 150 characters',
        });
      }
      user.institution = typeof institution === 'string' ? institution.trim() : '';
    }

    if (course !== undefined) {
      if (typeof course === 'string' && course.trim().length > 150) {
        return res.status(400).json({
          success: false,
          message: 'Course name cannot exceed 150 characters',
        });
      }
      user.course = typeof course === 'string' ? course.trim() : '';
    }

    if (year !== undefined) {
      const yearStr = String(year).trim();
      if (yearStr.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Year of study cannot exceed 50 characters',
        });
      }
      user.year = yearStr;
    }

    if (level !== undefined) {
      if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid learning level. Must be Beginner, Intermediate, or Advanced',
        });
      }
      user.level = level;
    }

    if (learningGoal !== undefined) {
      const validGoals = ['Exam Preparation', 'Interview Preparation', 'Skill Development', 'General Learning'];
      if (!validGoals.includes(learningGoal) && (typeof learningGoal !== 'string' || learningGoal.trim().length > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid primary learning goal',
        });
      }
      user.learningGoal = learningGoal;
    }

    if (preferredStudyTime !== undefined) {
      const validTimes = ['Morning', 'Afternoon', 'Evening', 'Night'];
      if (!validTimes.includes(preferredStudyTime)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid preferred study time. Must be Morning, Afternoon, Evening, or Night',
        });
      }
      user.preferredStudyTime = preferredStudyTime;
    }

    if (dailyGoal !== undefined) {
      const validDailyGoals = ['30 minutes', '1 hour', '2 hours', '3+ hours'];
      if (!validDailyGoals.includes(dailyGoal)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid daily study goal. Must be 30 minutes, 1 hour, 2 hours, or 3+ hours',
        });
      }
      user.dailyGoal = dailyGoal;
    }

    if (learningStyle !== undefined) {
      const validStyles = ['Visual', 'Practice-based', 'Reading', 'Mixed'];
      if (!validStyles.includes(learningStyle)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid learning style. Must be Visual, Practice-based, Reading, or Mixed',
        });
      }
      user.learningStyle = learningStyle;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (bio !== undefined) {
      if (typeof bio === 'string' && bio.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Bio cannot exceed 500 characters',
        });
      }
      user.bio = typeof bio === 'string' ? bio.trim() : '';
    }

    if (notificationsSettings !== undefined && typeof notificationsSettings === 'object') {
      user.notificationsSettings = {
        ...user.notificationsSettings,
        ...notificationsSettings,
      };
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toSafeObject(),
    });
  } catch (error) {
    console.error(`Update Profile Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile',
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old and new passwords are required',
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error(`Change Password Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error changing password',
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      statistics: req.user.statistics,
    });
  } catch (error) {
    console.error(`Get Stats Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving statistics',
    });
  }
};

// @desc    Get user dashboard summary
// @route   GET /api/users/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
      statistics: req.user.statistics,
    });
  } catch (error) {
    console.error(`Get Dashboard Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard',
    });
  }
};
