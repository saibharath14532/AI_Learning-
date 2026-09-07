import Certificate from '../models/Certificate.js';
import Roadmap from '../models/Roadmap.js';
import QuizAttempt from '../models/QuizAttempt.js';

// @desc    Get user certificates, in-progress roadmaps, and stats
// @route   GET /api/certificates
// @access  Private
export const getCertificates = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch earned certificates for user
    const dbCertificates = await Certificate.find({ user: userId }).sort({ completionDate: -1 });
    const earnedCertificates = dbCertificates.map(c => typeof c.toSafeObject === 'function' ? c.toSafeObject() : c);

    // Fetch user roadmaps to calculate in-progress & locked credentials
    const roadmaps = await Roadmap.find({ user: userId });

    const issuedRoadmapIds = new Set(dbCertificates.map(c => c.roadmap.toString()));

    const inProgressCertificates = [];
    const lockedCertificates = [];
    let totalTopicsMastered = 0;

    roadmaps.forEach(r => {
      const completedTopics = Array.isArray(r.topics)
        ? r.topics.filter(t => t.status === 'Completed').length
        : 0;
      totalTopicsMastered += completedTopics;

      const rObj = {
        id: r._id.toString(),
        roadmapId: r._id.toString(),
        courseName: r.goal || r.subject || 'Custom Learning Roadmap',
        progress: r.progress || 0,
        estimatedCompletion: 'In 2 Weeks',
        topicsCompleted: completedTopics,
        totalTopics: Array.isArray(r.topics) ? r.topics.length : 0,
        percentage: r.progress >= 100 ? 90 : Math.max(70, Math.round(r.progress * 0.85)),
        status: r.progress >= 100 ? 'Eligible' : r.progress > 0 ? 'In Progress' : 'Locked',
        requirement: 'Complete Roadmap to 100%',
        requirements: {
          roadmap: r.progress || 0,
          topics: `${completedTopics} / ${Array.isArray(r.topics) ? r.topics.length : 0}`,
          quiz: r.progress >= 80 ? 85 : 0,
          finalAssessment: r.progress >= 100 ? 90 : 0,
        },
      };

      if (!issuedRoadmapIds.has(r._id.toString())) {
        if (r.progress > 0) {
          inProgressCertificates.push(rObj);
        } else {
          lockedCertificates.push(rObj);
        }
      }
    });

    // Calculate user quiz average score
    const attempts = await QuizAttempt.find({ user: userId });
    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
      : 87;

    return res.status(200).json({
      success: true,
      data: {
        earnedCertificates,
        inProgressCertificates,
        lockedCertificates,
        stats: {
          earnedCount: earnedCertificates.length,
          completedCoursesCount: earnedCertificates.length,
          topicsMastered: totalTopicsMastered,
          averageScore: avgScore,
        },
      },
    });
  } catch (error) {
    console.error(`Get Certificates Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving certificates',
    });
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
export const getCertificateById = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate credential not found',
      });
    }

    // Security check: ensure certificate belongs to req.user._id
    if (cert.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this certificate',
      });
    }

    return res.status(200).json({
      success: true,
      data: cert.toSafeObject(),
    });
  } catch (error) {
    console.error(`Get Certificate By Id Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving certificate details',
    });
  }
};

// @desc    Check certificate eligibility for a given roadmap
// @route   GET /api/certificates/eligibility/:roadmapId
// @access  Private
export const checkCertificateEligibility = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user._id;

    const roadmap = await Roadmap.findOne({ _id: roadmapId, user: userId });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found or does not belong to user',
      });
    }

    const isEligible = roadmap.progress >= 100;
    const existingCert = await Certificate.findOne({ user: userId, roadmap: roadmapId });

    if (!isEligible) {
      return res.status(200).json({
        success: true,
        eligible: false,
        roadmapProgress: roadmap.progress || 0,
        reason: `Roadmap is ${roadmap.progress || 0}% complete. Complete all roadmap topics to 100% to unlock your certificate.`,
      });
    }

    return res.status(200).json({
      success: true,
      eligible: true,
      roadmapProgress: 100,
      alreadyIssued: !!existingCert,
      certificateId: existingCert?.certificateId || null,
      reason: 'Roadmap completed successfully! You are eligible to claim your certificate.',
    });
  } catch (error) {
    console.error(`Check Certificate Eligibility Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error checking certificate eligibility',
    });
  }
};

// @desc    Issue a new certificate for a completed roadmap
// @route   POST /api/certificates/issue
// @access  Private
export const issueCertificate = async (req, res) => {
  try {
    const { roadmapId } = req.body;
    const userId = req.user._id;

    if (!roadmapId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roadmapId',
      });
    }

    // 1. Find roadmap and verify ownership
    const roadmap = await Roadmap.findOne({ _id: roadmapId, user: userId });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found or does not belong to user',
      });
    }

    // 2. Verify backend eligibility (must be 100% completed)
    if (roadmap.progress < 100) {
      return res.status(400).json({
        success: false,
        eligible: false,
        roadmapProgress: roadmap.progress || 0,
        message: `Cannot issue certificate. Roadmap is not 100% complete (current progress: ${roadmap.progress || 0}%).`,
      });
    }

    // 3. Duplicate Prevention: Check if certificate already exists
    const existingCert = await Certificate.findOne({ user: userId, roadmap: roadmapId });
    if (existingCert) {
      return res.status(200).json({
        success: true,
        message: 'Certificate has already been issued for this roadmap',
        data: existingCert.toSafeObject(),
      });
    }

    // 4. Calculate student metrics
    const attempts = await QuizAttempt.find({ user: userId });
    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
      : 88;

    const completedTopicsCount = Array.isArray(roadmap.topics)
      ? roadmap.topics.filter(t => t.status === 'Completed').length
      : 8;

    // Generate unique Certificate ID and Verification Code
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    const certificateId = `CERT-${year}-${randomHex}`;
    const verificationCode = `VC-${Math.floor(100000 + Math.random() * 900000)}-${year}`;

    // Create Certificate in MongoDB
    const cert = await Certificate.create({
      user: userId,
      roadmap: roadmapId,
      title: 'Certificate of Completion',
      courseName: roadmap.goal || roadmap.subject || 'Personalized Learning Roadmap',
      studentName: req.user.name || 'Student',
      certificateId,
      verificationCode,
      percentage: avgScore,
      score: avgScore,
      grade: avgScore >= 85 ? 'Excellence' : avgScore >= 70 ? 'Merit' : 'Pass',
      status: 'Completed',
      topicsCompleted: completedTopicsCount,
      studyHours: Math.round(completedTopicsCount * 1.8 * 10) / 10,
      completionDate: new Date(),
      issuedAt: new Date(),
      requirements: {
        roadmap: 100,
        topics: `${completedTopicsCount} / ${completedTopicsCount}`,
        quiz: avgScore,
        finalAssessment: avgScore,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate issued successfully!',
      data: cert.toSafeObject(),
    });
  } catch (error) {
    console.error(`Issue Certificate Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error issuing certificate',
    });
  }
};

// @desc    Verify certificate publicly by verification code or certificateId
// @route   GET /api/certificates/verify/:code
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;

    const cert = await Certificate.findOne({
      $or: [{ certificateId: code }, { verificationCode: code }],
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Certificate credential not found or invalid verification code',
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      data: {
        certificateId: cert.certificateId,
        verificationCode: cert.verificationCode,
        studentName: cert.studentName,
        courseName: cert.courseName,
        percentage: cert.percentage,
        completionDate: cert.completionDate,
        status: cert.status,
      },
    });
  } catch (error) {
    console.error(`Verify Certificate Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying certificate',
    });
  }
};
