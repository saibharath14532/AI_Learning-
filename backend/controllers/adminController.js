import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import FlashcardSet from '../models/FlashcardSet.js';
import Note from '../models/Note.js';
import Certificate from '../models/Certificate.js';

// @desc    Get real-time system dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalRoadmaps,
      totalQuizzes,
      totalQuizAttempts,
      totalFlashcardSets,
      totalNotes,
      totalCertificates
    ] = await Promise.all([
      User.countDocuments(),
      Roadmap.countDocuments(),
      Quiz.countDocuments(),
      QuizAttempt.countDocuments(),
      FlashcardSet.countDocuments(),
      Note.countDocuments(),
      Certificate.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRoadmaps,
        totalQuizzes,
        totalQuizAttempts,
        totalFlashcardSets,
        totalNotes,
        totalCertificates,
      },
    });
  } catch (error) {
    console.error(`Get Admin Dashboard Stats Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving admin dashboard statistics',
    });
  }
};

// @desc    Get paginated user list with server-side search
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = req.query.search ? req.query.search.trim() : '';

    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [{ name: searchRegex }, { email: searchRegex }],
      };
    }

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const users = await User.find(query)
      .select('-password -verificationCode -verificationCodeExpires')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const safeUsers = users.map((u) => u.toSafeObject());

    return res.status(200).json({
      success: true,
      users: safeUsers,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error(`Get Admin Users Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving users list',
    });
  }
};

// @desc    Get complete individual user details, learning stats & activity
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select(
      '-password -verificationCode -verificationCodeExpires'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const [roadmaps, attempts, flashcardSets, notes, certificates] =
      await Promise.all([
        Roadmap.find({ user: userId }).sort({ updatedAt: -1 }),
        QuizAttempt.find({ user: userId })
          .sort({ completedAt: -1 })
          .populate('quiz', 'title topic subject'),
        FlashcardSet.find({ user: userId }).sort({ updatedAt: -1 }),
        Note.find({ user: userId }).sort({ createdAt: -1 }),
        Certificate.find({ user: userId }).sort({ createdAt: -1 }),
      ]);

    const totalRoadmaps = roadmaps.length;
    const completedRoadmaps = roadmaps.filter((r) => r.progress === 100).length;
    const quizzesTaken = attempts.length;
    const avgQuizScore =
      quizzesTaken > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
              quizzesTaken
          )
        : 0;
    const totalFlashcardSets = flashcardSets.length;
    const totalNotes = notes.length;
    const totalCertificates = certificates.length;

    const statistics = {
      roadmaps: totalRoadmaps,
      completedRoadmaps,
      quizzesTaken,
      averageQuizScore: avgQuizScore,
      flashcardSets: totalFlashcardSets,
      notes: totalNotes,
      currentStreak: user.statistics?.currentStreak || 0,
      longestStreak: user.statistics?.longestStreak || 0,
      certificates: totalCertificates,
    };

    // Aggregate recent user activities
    const activities = [];

    attempts.slice(0, 5).forEach((att) => {
      activities.push({
        id: `quiz_${att._id}`,
        type: 'quiz',
        description: `Completed Quiz: ${att.quiz?.title || 'Quiz'} (${att.percentage || 0}%)`,
        date: att.completedAt || att.createdAt,
      });
    });

    roadmaps.slice(0, 5).forEach((r) => {
      activities.push({
        id: `roadmap_${r._id}`,
        type: 'roadmap',
        description: `Updated Roadmap: ${r.subject || r.goal} (${r.progress}% complete)`,
        date: r.updatedAt || r.createdAt,
      });
    });

    notes.slice(0, 5).forEach((n) => {
      activities.push({
        id: `note_${n._id}`,
        type: 'notes',
        description: `Created Note: ${n.topic || n.title}`,
        date: n.createdAt,
      });
    });

    certificates.slice(0, 5).forEach((c) => {
      activities.push({
        id: `cert_${c._id}`,
        type: 'certificate',
        description: `Earned Certificate: ${c.courseName} (${c.certificateId})`,
        date: c.issuedAt || c.createdAt,
      });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({
      success: true,
      user: user.toSafeObject(),
      statistics,
      recentActivity: activities.slice(0, 15),
    });
  } catch (error) {
    console.error(`Get Admin User Details Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user details',
    });
  }
};

// @desc    Get system-wide analytics & growth metrics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      totalQuizAttempts,
      completedRoadmaps,
      totalCertificates,
      attemptsAvg,
      activeUsers7DaysRaw,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      QuizAttempt.countDocuments(),
      Roadmap.countDocuments({ progress: 100 }),
      Certificate.countDocuments(),
      QuizAttempt.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$percentage' } } },
      ]),
      QuizAttempt.distinct('user', { completedAt: { $gte: sevenDaysAgo } }),
    ]);

    const avgQuizScore =
      attemptsAvg.length > 0 ? Math.round(attemptsAvg[0].avgScore || 0) : 0;
    const activeUsers7Days = activeUsers7DaysRaw.length;

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        newUsersLast7Days,
        newUsersLast30Days,
        totalQuizAttempts,
        avgQuizScore,
        completedRoadmaps,
        totalCertificates,
        activeUsers7Days,
      },
    });
  } catch (error) {
    console.error(`Get Admin Analytics Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving analytics data',
    });
  }
};

// @desc    Get paginated roadmaps with owner info
// @route   GET /api/admin/roadmaps
// @access  Private/Admin
export const getAllRoadmaps = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const total = await Roadmap.countDocuments();
    const totalPages = Math.ceil(total / limit) || 1;

    const roadmaps = await Roadmap.find()
      .populate('user', 'name email role')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      roadmaps,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error(`Get Admin Roadmaps Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving roadmaps',
    });
  }
};

// @desc    Get paginated quizzes with aggregate statistics (answer keys sanitized)
// @route   GET /api/admin/quizzes
// @access  Private/Admin
export const getAllQuizzes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const total = await Quiz.countDocuments();
    const totalPages = Math.ceil(total / limit) || 1;

    const quizzes = await Quiz.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Format quizzes without revealing internal answer indexes unnecessarily
    const formattedQuizzes = quizzes.map((q) => {
      const obj = q.toObject();
      return {
        _id: obj._id,
        title: obj.title,
        subject: obj.subject,
        topic: obj.topic,
        questionCount: Array.isArray(obj.questions) ? obj.questions.length : 0,
        user: obj.user,
        createdAt: obj.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      quizzes: formattedQuizzes,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error(`Get Admin Quizzes Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving quizzes',
    });
  }
};

// @desc    Get paginated flashcards with owner info
// @route   GET /api/admin/flashcards
// @access  Private/Admin
export const getAllFlashcards = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const total = await FlashcardSet.countDocuments();
    const totalPages = Math.ceil(total / limit) || 1;

    const flashcards = await FlashcardSet.find()
      .populate('user', 'name email role')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const formattedSets = flashcards.map((f) => ({
      _id: f._id,
      topic: f.topic,
      subject: f.subject,
      totalCards: f.totalCards || (Array.isArray(f.cards) ? f.cards.length : 0),
      masteredCards: f.masteredCards || 0,
      progress: f.progress || 0,
      user: f.user,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      flashcardSets: formattedSets,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error(`Get Admin Flashcards Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving flashcards',
    });
  }
};

// @desc    Get paginated notes metadata with owner info
// @route   GET /api/admin/notes
// @access  Private/Admin
export const getAllNotes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const total = await Note.countDocuments();
    const totalPages = Math.ceil(total / limit) || 1;

    const notes = await Note.find()
      .select('title topic summary isFavorite user createdAt updatedAt')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      notes,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error(`Get Admin Notes Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving notes',
    });
  }
};

// @desc    Get paginated certificates with owner info
// @route   GET /api/admin/certificates
// @access  Private/Admin
export const getAllCertificates = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const total = await Certificate.countDocuments();
    const totalPages = Math.ceil(total / limit) || 1;

    const certificates = await Certificate.find()
      .populate('user', 'name email role')
      .sort({ issuedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      certificates,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error(`Get Admin Certificates Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving certificates',
    });
  }
};
