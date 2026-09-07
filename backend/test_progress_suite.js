import {
  getProgressOverview,
  getQuizPerformance,
  getRoadmapProgress,
  getFlashcardProgress,
  getSubjectPerformance,
} from './controllers/progressController.js';
import { protect } from './middleware/authMiddleware.js';
import User from './models/User.js';
import Roadmap from './models/Roadmap.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import FlashcardSet from './models/FlashcardSet.js';
import Note from './models/Note.js';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

// Mock Response Helper
function createMockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    }
  };
  return res;
}

// In-memory collections
const mockRoadmaps = new Map();
const mockQuizzes = new Map();
const mockQuizAttempts = new Map();
const mockFlashcardSets = new Map();
const mockNotes = new Map();

function generateId(prefix = '66d0a1b2c3d4e5f6a7b') {
  return `${prefix}${Math.floor(Math.random() * 89999 + 10000)}`;
}

// Stub Mongoose Models
Roadmap.find = (query) => {
  let list = Array.from(mockRoadmaps.values());
  if (query.user) {
    list = list.filter(r => r.user.toString() === query.user.toString());
  }
  const promise = Promise.resolve(list);
  promise.sort = () => list;
  return promise;
};

QuizAttempt.find = (query) => {
  let list = Array.from(mockQuizAttempts.values());
  if (query.user) {
    list = list.filter(a => a.user.toString() === query.user.toString());
  }
  const populateFn = (field, props) => {
    return list.map(a => {
      const quizObj = mockQuizzes.get(a.quiz?.toString()) || null;
      return { ...a, quiz: quizObj };
    });
  };
  const promise = Promise.resolve(populateFn());
  promise.populate = populateFn;
  promise.sort = () => {
    const p = Promise.resolve(populateFn());
    p.populate = populateFn;
    return p;
  };
  return promise;
};

FlashcardSet.find = (query) => {
  let list = Array.from(mockFlashcardSets.values());
  if (query.user) {
    list = list.filter(s => s.user.toString() === query.user.toString());
  }
  const promise = Promise.resolve(list);
  promise.sort = () => list;
  return promise;
};

Note.find = (query) => {
  let list = Array.from(mockNotes.values());
  if (query.user) {
    list = list.filter(n => n.user.toString() === query.user.toString());
  }
  const promise = Promise.resolve(list);
  promise.sort = () => list;
  return promise;
};

async function runSuite() {
  console.log('\n==================================================');
  console.log('RUNNING REAL PROGRESS ANALYTICS TEST SUITE');
  console.log('==================================================\n');

  const userA = { _id: '66d0a1b2c3d4e5f6a7b00001', name: 'Progress User A', email: 'userA@example.com' };
  const userB = { _id: '66d0a1b2c3d4e5f6a7b00002', name: 'Progress User B', email: 'userB@example.com' };

  // TEST GROUP 1: Empty User State (User B has 0 records)
  console.log('[TEST GROUP 1] Empty User State (User B with 0 records)');
  {
    const reqB = { user: userB, query: { period: 'This Week' } };
    const resB = createMockRes();
    await getProgressOverview(reqB, resB);

    assert(resB.statusCode === 200, 'GET /api/progress/overview returns 200 OK for empty user');
    assert(resB.data.success === true, 'Response contains success: true');
    assert(resB.data.data.overallProgress === 0, 'overallProgress is 0 for empty user');
    assert(resB.data.data.topicsCompleted === 0, 'topicsCompleted is 0 for empty user');
    assert(resB.data.data.quizzesCompleted === 0, 'quizzesCompleted is 0 for empty user');
    assert(resB.data.data.avgQuizScore === 0, 'avgQuizScore is 0 for empty user');
    assert(resB.data.data.totalFlashcards === 0, 'totalFlashcards is 0 for empty user');
    assert(resB.data.data.masteredFlashcards === 0, 'masteredFlashcards is 0 for empty user');
    assert(resB.data.data.notesCreated === 0, 'notesCreated is 0 for empty user');
    assert(Array.isArray(resB.data.data.studyHoursChart) && resB.data.data.studyHoursChart.length === 7, 'studyHoursChart has 7 entries');
    assert(Array.isArray(resB.data.data.quizScoresTrend) && resB.data.data.quizScoresTrend.length === 0, 'quizScoresTrend is empty array');
  }

  // Populate data for User A
  console.log('\n--- Populating in-memory records for User A ---');
  
  // 2 Roadmaps for User A
  const rm1 = {
    _id: generateId(),
    user: userA._id,
    goal: 'Master Database Systems',
    subject: 'DBMS',
    progress: 80,
    topics: [
      { title: 'Intro to DBMS', status: 'Completed', estimatedMinutes: 60 },
      { title: 'SQL Queries', status: 'Completed', estimatedMinutes: 90 },
      { title: 'Normalization', status: 'Completed', estimatedMinutes: 120 },
      { title: 'Transactions', status: 'In Progress', estimatedMinutes: 90 },
    ],
    toSafeObject() { return { id: this._id, ...this }; }
  };
  mockRoadmaps.set(rm1._id, rm1);

  const rm2 = {
    _id: generateId(),
    user: userA._id,
    goal: 'Learn Operating Systems',
    subject: 'Operating Systems',
    progress: 40,
    topics: [
      { title: 'Processes & Threads', status: 'Completed', estimatedMinutes: 90 },
      { title: 'CPU Scheduling', status: 'In Progress', estimatedMinutes: 120 },
    ],
    toSafeObject() { return { id: this._id, ...this }; }
  };
  mockRoadmaps.set(rm2._id, rm2);

  // 1 Quiz & 2 QuizAttempts for User A
  const qA = {
    _id: generateId(),
    user: userA._id,
    title: 'DBMS Practice Quiz',
    subject: 'DBMS',
    topic: 'DBMS',
  };
  mockQuizzes.set(qA._id, qA);

  const att1 = {
    _id: generateId(),
    user: userA._id,
    quiz: qA._id,
    score: 16,
    totalPoints: 20,
    percentage: 80,
    timeTaken: 300,
    completedAt: new Date(),
  };
  mockQuizAttempts.set(att1._id, att1);

  const att2 = {
    _id: generateId(),
    user: userA._id,
    quiz: qA._id,
    score: 18,
    totalPoints: 20,
    percentage: 90,
    timeTaken: 240,
    completedAt: new Date(),
  };
  mockQuizAttempts.set(att2._id, att2);

  // 1 FlashcardSet for User A (10 cards: 6 known, 2 review, 2 unknown)
  const fcSetA = {
    _id: generateId(),
    user: userA._id,
    title: 'DBMS Key Concepts',
    subject: 'DBMS',
    topic: 'DBMS',
    totalCards: 10,
    masteredCards: 6,
    cards: [
      { status: 'known' }, { status: 'known' }, { status: 'known' },
      { status: 'known' }, { status: 'known' }, { status: 'known' },
      { status: 'review' }, { status: 'review' },
      { status: 'unknown' }, { status: 'unknown' },
    ]
  };
  mockFlashcardSets.set(fcSetA._id, fcSetA);

  // 2 Notes for User A
  const note1 = {
    _id: generateId(),
    user: userA._id,
    title: 'DBMS Normalization Notes',
    subject: 'DBMS',
    topic: 'DBMS',
    createdAt: new Date(),
  };
  mockNotes.set(note1._id, note1);

  const note2 = {
    _id: generateId(),
    user: userA._id,
    title: 'OS Process Notes',
    subject: 'Operating Systems',
    topic: 'Operating Systems',
    createdAt: new Date(),
  };
  mockNotes.set(note2._id, note2);

  // TEST GROUP 2: User A Calculated Progress Metrics
  console.log('\n[TEST GROUP 2] User A Calculated Progress Metrics');
  {
    const reqA = { user: userA, query: { period: 'This Week' } };
    const resA = createMockRes();
    await getProgressOverview(reqA, resA);

    assert(resA.statusCode === 200, 'GET /api/progress/overview returns 200 OK for User A');
    const d = resA.data.data;

    // overallProgress = (80 + 40) / 2 = 60
    assert(d.overallProgress === 60, `overallProgress calculated correctly: expected 60, got ${d.overallProgress}`);

    // topicsCompleted = 3 + 1 = 4
    assert(d.topicsCompleted === 4, `topicsCompleted calculated correctly: expected 4, got ${d.topicsCompleted}`);

    // quizzesCompleted = 2
    assert(d.quizzesCompleted === 2, `quizzesCompleted calculated correctly: expected 2, got ${d.quizzesCompleted}`);

    // avgQuizScore = (80 + 90) / 2 = 85
    assert(d.avgQuizScore === 85, `avgQuizScore calculated correctly: expected 85, got ${d.avgQuizScore}`);

    // totalFlashcards = 10
    assert(d.totalFlashcards === 10, `totalFlashcards calculated correctly: expected 10, got ${d.totalFlashcards}`);

    // masteredFlashcards = 6
    assert(d.masteredFlashcards === 6, `masteredFlashcards calculated correctly: expected 6, got ${d.masteredFlashcards}`);

    // flashcardsReviewed = 8 (6 known + 2 review)
    assert(d.flashcardsReviewed === 8, `flashcardsReviewed calculated correctly: expected 8, got ${d.flashcardsReviewed}`);

    // notesCreated = 2
    assert(d.notesCreated === 2, `notesCreated calculated correctly: expected 2, got ${d.notesCreated}`);

    // quizScoresTrend = [80, 90]
    assert(d.quizScoresTrend.length === 2 && d.quizScoresTrend[0] === 80 && d.quizScoresTrend[1] === 90, 'quizScoresTrend returns [80, 90]');
  }

  // TEST GROUP 3: Multi-User Data Isolation (User A vs User B)
  console.log('\n[TEST GROUP 3] Multi-User Data Isolation');
  {
    const reqB = { user: userB, query: { period: 'This Week' } };
    const resB = createMockRes();
    await getProgressOverview(reqB, resB);

    const d = resB.data.data;
    assert(d.overallProgress === 0, 'ISOLATION: User B overallProgress remains 0 (No leakage from User A)');
    assert(d.quizzesCompleted === 0, 'ISOLATION: User B quiz attempts count is 0 (No leakage from User A)');
    assert(d.notesCreated === 0, 'ISOLATION: User B notes count is 0 (No leakage from User A)');
    assert(d.masteredFlashcards === 0, 'ISOLATION: User B mastered cards count is 0 (No leakage from User A)');
  }

  // TEST GROUP 4: Detailed API Endpoints
  console.log('\n[TEST GROUP 4] Detailed Progress Endpoints (Quiz, Roadmap, Flashcards, Subjects)');
  {
    const reqA = { user: userA };
    const resQuiz = createMockRes();
    await getQuizPerformance(reqA, resQuiz);
    assert(resQuiz.statusCode === 200, 'GET /api/progress/quiz returns 200 OK');
    assert(resQuiz.data.data.totalAttempts === 2, 'Quiz performance totalAttempts is 2');
    assert(resQuiz.data.data.highestScore === 90, 'Quiz performance highestScore is 90');
    assert(resQuiz.data.data.lowestScore === 80, 'Quiz performance lowestScore is 80');

    const resRm = createMockRes();
    await getRoadmapProgress(reqA, resRm);
    assert(resRm.statusCode === 200, 'GET /api/progress/roadmap returns 200 OK');
    assert(resRm.data.data.total === 2, 'Roadmap progress total is 2');
    assert(resRm.data.data.inProgress === 2, 'Roadmap progress inProgress count is 2');

    const resFc = createMockRes();
    await getFlashcardProgress(reqA, resFc);
    assert(resFc.statusCode === 200, 'GET /api/progress/flashcards returns 200 OK');
    assert(resFc.data.data.totalCards === 10, 'Flashcard progress totalCards is 10');
    assert(resFc.data.data.masteredCards === 6, 'Flashcard progress masteredCards is 6');
    assert(resFc.data.data.masteryPercentage === 60, 'Flashcard progress masteryPercentage is 60');

    const resSub = createMockRes();
    await getSubjectPerformance(reqA, resSub);
    assert(resSub.statusCode === 200, 'GET /api/progress/subjects returns 200 OK');
    assert(Array.isArray(resSub.data.data) && resSub.data.data.length > 0, 'Subject performance returns array of subject scores');
  }

  // TEST GROUP 5: Auth Middleware Enforcement
  console.log('\n[TEST GROUP 5] Auth Middleware Enforcement');
  {
    const reqNoToken = { headers: {} };
    const resNoToken = createMockRes();
    let nextCalled = false;
    await protect(reqNoToken, resNoToken, () => { nextCalled = true; });
    assert(resNoToken.statusCode === 401, 'Missing token rejected with 401 Unauthorized');
    assert(!nextCalled, 'Next middleware is NOT called for missing token');

    const token = jwt.sign({ userId: userA._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const reqGoodToken = { headers: { authorization: `Bearer ${token}` } };
    const resGoodToken = createMockRes();
    nextCalled = false;

    const origFind = User.findById;
    User.findById = async (id) => (id === userA._id ? userA : null);

    await protect(reqGoodToken, resGoodToken, () => { nextCalled = true; });
    assert(nextCalled === true, 'Valid JWT calls next()');
    assert(reqGoodToken.user && reqGoodToken.user._id === userA._id, 'Valid JWT attaches user object to req.user');

    User.findById = origFind;
  }

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('==================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite();
