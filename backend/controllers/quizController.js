import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Roadmap from '../models/Roadmap.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private
export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      subject,
      topic,
      difficulty,
      type,
      description,
      questions,
      timeLimit,
      roadmap,
    } = req.body;

    const finalTitle = (title || subject || '').trim();
    const finalSubject = (subject || title || '').trim();

    if (!finalTitle || !finalSubject) {
      return res.status(400).json({
        success: false,
        message: 'Quiz title and subject are required',
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz must contain at least one question',
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

    // Ensure all questions have unique identifiers and clean fields
    const formattedQuestions = questions.map((q, idx) => ({
      id: q.id || `q_${Date.now()}_${idx + 1}`,
      question: (q.question || '').trim(),
      options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : [],
      correctAnswer: q.correctAnswer !== undefined ? String(q.correctAnswer).trim() : '',
      correctIndex: q.correctIndex !== undefined ? Number(q.correctIndex) : (typeof q.correctAnswer === 'number' ? q.correctAnswer : 0),
      explanation: q.explanation ? String(q.explanation).trim() : '',
      points: Number(q.points) > 0 ? Number(q.points) : 1,
    }));

    const newQuiz = await Quiz.create({
      user: req.user._id,
      roadmap: roadmapId,
      title: finalTitle,
      subject: finalSubject,
      topic: (topic || finalSubject).trim(),
      difficulty: difficulty || 'Intermediate',
      type: type || 'Multiple Choice',
      description: description ? String(description).trim() : '',
      questions: formattedQuestions,
      timeLimit: Number(timeLimit) > 0 ? Number(timeLimit) : formattedQuestions.length * 90,
      status: 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: newQuiz.toSafeObject(),
    });
  } catch (error) {
    console.error(`Create Quiz Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error creating quiz',
    });
  }
};

// @desc    Get user's quizzes with optional filters
// @route   GET /api/quizzes
// @access  Private
export const getQuizzes = async (req, res) => {
  try {
    const { subject, topic, difficulty, roadmap } = req.query;

    const query = { user: req.user._id };

    if (subject) query.subject = new RegExp(subject, 'i');
    if (topic) query.topic = new RegExp(topic, 'i');
    if (difficulty) query.difficulty = difficulty;
    if (roadmap && isValidObjectId(roadmap)) query.roadmap = roadmap;

    const quizzes = await Quiz.find(query).sort({ createdAt: -1 });
    const safeQuizzes = quizzes.map(q => q.toSafeObject());

    return res.status(200).json({
      success: true,
      count: safeQuizzes.length,
      quizzes: safeQuizzes,
    });
  } catch (error) {
    console.error(`Get Quizzes Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving quizzes',
    });
  }
};

// @desc    Get single quiz by ID (Sanitized for test-taking)
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const { forReview } = req.query;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Verify ownership
    if (quiz.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this quiz.',
      });
    }

    // If query contains forReview=true, return full quiz. Otherwise return answer-hidden payload!
    const responsePayload = forReview === 'true' ? quiz.toSafeObject() : quiz.toTakeObject();

    return res.status(200).json({
      success: true,
      quiz: responsePayload,
    });
  } catch (error) {
    console.error(`Get Quiz By Id Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving quiz',
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    if (quiz.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this quiz.',
      });
    }

    const {
      title,
      subject,
      topic,
      difficulty,
      type,
      description,
      questions,
      timeLimit,
      status,
    } = req.body;

    if (title !== undefined) quiz.title = String(title).trim();
    if (subject !== undefined) quiz.subject = String(subject).trim();
    if (topic !== undefined) quiz.topic = String(topic).trim();
    if (difficulty !== undefined) quiz.difficulty = difficulty;
    if (type !== undefined) quiz.type = type;
    if (description !== undefined) quiz.description = String(description).trim();
    if (timeLimit !== undefined && Number(timeLimit) > 0) quiz.timeLimit = Number(timeLimit);
    if (status !== undefined && ['draft', 'active', 'completed'].includes(status)) quiz.status = status;

    if (questions !== undefined && Array.isArray(questions)) {
      quiz.questions = questions.map((q, idx) => ({
        id: q.id || `q_${Date.now()}_${idx + 1}`,
        question: (q.question || '').trim(),
        options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : [],
        correctAnswer: q.correctAnswer !== undefined ? String(q.correctAnswer).trim() : '',
        correctIndex: q.correctIndex !== undefined ? Number(q.correctIndex) : 0,
        explanation: q.explanation ? String(q.explanation).trim() : '',
        points: Number(q.points) > 0 ? Number(q.points) : 1,
      }));
    }

    const updatedQuiz = await quiz.save();

    return res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz: updatedQuiz.toSafeObject(),
    });
  } catch (error) {
    console.error(`Update Quiz Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error updating quiz',
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    if (quiz.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this quiz.',
      });
    }

    await Quiz.findByIdAndDelete(id);
    // Also delete associated attempt records
    await QuizAttempt.deleteMany({ quiz: id });

    return res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error(`Delete Quiz Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting quiz',
    });
  }
};

// @desc    Submit quiz answers & perform server-side scoring evaluation
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Retrieve quiz document with full correct answers from MongoDB
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    if (quiz.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this quiz.',
      });
    }

    const submittedAnswersMap = new Map();
    if (Array.isArray(answers)) {
      answers.forEach(a => {
        if (a && a.questionId !== undefined) {
          submittedAnswersMap.set(String(a.questionId), a.selectedAnswer);
        }
      });
    } else if (answers && typeof answers === 'object') {
      Object.keys(answers).forEach(qId => {
        submittedAnswersMap.set(String(qId), answers[qId]);
      });
    }

    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;
    let unansweredCount = 0;
    let totalPointsEarned = 0;
    let totalPossiblePoints = 0;

    const evaluatedAnswers = [];
    const reviewDetails = [];

    quiz.questions.forEach((q, idx) => {
      const qId = q.id || `q_${idx + 1}`;
      const qPoints = q.points || 1;
      totalPossiblePoints += qPoints;

      let userSel = submittedAnswersMap.get(qId);
      if (userSel === undefined) {
        userSel = submittedAnswersMap.get(String(idx));
      }

      const hasAnswered = userSel !== undefined && userSel !== null && String(userSel).trim() !== '';

      let isCorrect = false;

      if (hasAnswered) {
        const userAnsStr = String(userSel).trim();

        if (quiz.type === 'Fill in the Blanks') {
          const expected = (q.correctAnswer || '').trim().toLowerCase();
          isCorrect = userAnsStr.toLowerCase() === expected;
        } else {
          // Multiple Choice or True/False
          const targetIndex = q.correctIndex !== undefined ? q.correctIndex : parseInt(q.correctAnswer, 10);
          const targetAnswerStr = (q.correctAnswer || '').trim().toLowerCase();

          if (!isNaN(parseInt(userAnsStr, 10)) && parseInt(userAnsStr, 10) === targetIndex) {
            isCorrect = true;
          } else if (userAnsStr.toLowerCase() === targetAnswerStr) {
            isCorrect = true;
          } else if (q.options && q.options[targetIndex] && q.options[targetIndex].toLowerCase() === userAnsStr.toLowerCase()) {
            isCorrect = true;
          }
        }

        if (isCorrect) {
          correctAnswersCount++;
          totalPointsEarned += qPoints;
        } else {
          incorrectAnswersCount++;
        }
      } else {
        unansweredCount++;
      }

      evaluatedAnswers.push({
        questionId: qId,
        selectedAnswer: hasAnswered ? String(userSel) : '',
        isCorrect,
        pointsEarned: isCorrect ? qPoints : 0,
      });

      reviewDetails.push({
        id: qId,
        question: q.question,
        options: q.options || [],
        userAnswer: hasAnswered ? userSel : null,
        correctAnswer: quiz.type === 'Fill in the Blanks' ? q.correctAnswer : (q.correctIndex !== undefined ? q.correctIndex : q.correctAnswer),
        explanation: q.explanation || '',
        isCorrect,
        topic: quiz.topic,
      });
    });

    const totalQCount = quiz.questions.length || 1;
    const percentage = Math.round((correctAnswersCount / totalQCount) * 100);

    // Save QuizAttempt in MongoDB
    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      roadmap: quiz.roadmap,
      answers: evaluatedAnswers,
      score: correctAnswersCount,
      totalPoints: totalPossiblePoints,
      percentage,
      correctAnswers: correctAnswersCount,
      incorrectAnswers: incorrectAnswersCount,
      unanswered: unansweredCount,
      timeTaken: Number(timeTaken) || 0,
      completedAt: new Date(),
    });

    // Determine strong vs weak topics
    const strongTopics = percentage >= 80 ? [quiz.topic] : [];
    const weakTopics = percentage < 80 ? [quiz.topic] : [];

    // Format time string
    const minTaken = Math.floor((Number(timeTaken) || 0) / 60);
    const secTaken = (Number(timeTaken) || 0) % 60;
    const timeTakenFormatted = `${minTaken.toString().padStart(2, '0')}:${secTaken.toString().padStart(2, '0')}`;

    return res.status(200).json({
      success: true,
      message: 'Quiz submitted and evaluated successfully',
      result: {
        attemptId: attempt._id.toString(),
        quizId: quiz._id.toString(),
        title: quiz.title,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        type: quiz.type,
        score: correctAnswersCount,
        total: totalQCount,
        totalPoints: totalPossiblePoints,
        percentage,
        correctAnswers: correctAnswersCount,
        incorrectAnswers: incorrectAnswersCount,
        unanswered: unansweredCount,
        timeTaken: timeTakenFormatted,
        timeTakenSeconds: attempt.timeTaken,
        completedAt: attempt.completedAt,
        strongTopics,
        weakTopics,
        reviewDetails,
      },
    });
  } catch (error) {
    console.error(`Submit Quiz Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error processing quiz submission',
    });
  }
};

// @desc    Get user's previous attempt history
// @route   GET /api/quizzes/history
// @access  Private
export const getQuizHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .populate('quiz', 'title subject topic difficulty type')
      .sort({ completedAt: -1 });

    const formattedHistory = attempts.map(att => ({
      id: att._id.toString(),
      quizId: att.quiz ? att.quiz._id.toString() : null,
      title: att.quiz ? att.quiz.title : 'Quiz Attempt',
      subject: att.quiz ? att.quiz.subject : 'General',
      topic: att.quiz ? att.quiz.topic : 'General',
      difficulty: att.quiz ? att.quiz.difficulty : 'Intermediate',
      score: att.score,
      totalPoints: att.totalPoints,
      percentage: att.percentage,
      correctAnswers: att.correctAnswers,
      incorrectAnswers: att.incorrectAnswers,
      unanswered: att.unanswered,
      timeTaken: att.timeTaken,
      completedAt: att.completedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedHistory.length,
      history: formattedHistory,
    });
  } catch (error) {
    console.error(`Get Quiz History Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving quiz history',
    });
  }
};

// @desc    Get results for a specific quiz
// @route   GET /api/quizzes/:id/results
// @access  Private
export const getQuizResults = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const attempts = await QuizAttempt.find({
      user: req.user._id,
      quiz: id,
    }).sort({ completedAt: -1 });

    const safeAttempts = attempts.map(a => a.toSafeObject());

    return res.status(200).json({
      success: true,
      count: safeAttempts.length,
      results: safeAttempts,
    });
  } catch (error) {
    console.error(`Get Quiz Results Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving quiz results',
    });
  }
};
