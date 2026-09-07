import {
  getStudyStreak,
  getStudyCalendar,
  getWeeklyActivity,
} from './controllers/streakController.js';
import { protect } from './middleware/authMiddleware.js';
import User from './models/User.js';
import QuizAttempt from './models/QuizAttempt.js';
import FlashcardSet from './models/FlashcardSet.js';
import Roadmap from './models/Roadmap.js';
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
const mockQuizAttempts = new Map();
const mockFlashcardSets = new Map();
const mockRoadmaps = new Map();
const mockNotes = new Map();

function generateId(prefix = '66d0a1b2c3d4e5f6a7c') {
  return `${prefix}${Math.floor(Math.random() * 89999 + 10000)}`;
}

// Helper to get Date object shifted by N days relative to today
function getDateDaysAgo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

// Stub Mongoose Models with chainable Promises
QuizAttempt.find = (query) => {
  let list = Array.from(mockQuizAttempts.values());
  if (query.user) {
    list = list.filter(a => a.user.toString() === query.user.toString());
  }
  const populateFn = () => list;
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

Roadmap.find = (query) => {
  let list = Array.from(mockRoadmaps.values());
  if (query.user) {
    list = list.filter(r => r.user.toString() === query.user.toString());
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
  console.log('RUNNING STUDY STREAK REST API & EDGE CASE TESTS');
  console.log('==================================================\n');

  const userA = { _id: '66d0a1b2c3d4e5f6a7c00001', name: 'Streak User A', email: 'streakA@example.com' };
  const userB = { _id: '66d0a1b2c3d4e5f6a7c00002', name: 'Streak User B', email: 'streakB@example.com' };

  // TEST GROUP 1: Empty User State (0 Records)
  console.log('[TEST GROUP 1] Empty User State (0 Activity Records)');
  {
    const reqB = { user: userB };
    const resB = createMockRes();
    await getStudyStreak(reqB, resB);

    assert(resB.statusCode === 200, 'GET /api/streak returns 200 OK for empty user');
    assert(resB.data.success === true, 'Response contains success: true');
    assert(resB.data.data.currentStreak === 0, 'currentStreak is 0 for empty user');
    assert(resB.data.data.longestStreak === 0, 'longestStreak is 0 for empty user');
    assert(resB.data.data.totalStudyDays === 0, 'totalStudyDays is 0 for empty user');
    assert(resB.data.data.studiedToday === false, 'studiedToday is false for empty user');
    assert(Array.isArray(resB.data.data.weeklyActivity) && resB.data.data.weeklyActivity.length === 7, 'weeklyActivity has 7 days');
    assert(Array.isArray(resB.data.data.monthlyCalendar) && resB.data.data.monthlyCalendar.length >= 28, 'monthlyCalendar contains month days');
  }

  // TEST GROUP 2: Single Activity Today
  console.log('\n[TEST GROUP 2] Single Activity Today');
  {
    const attToday = {
      _id: generateId(),
      user: userA._id,
      completedAt: getDateDaysAgo(0),
      percentage: 85,
    };
    mockQuizAttempts.set(attToday._id, attToday);

    const reqA = { user: userA };
    const resA = createMockRes();
    await getStudyStreak(reqA, resA);

    assert(resA.statusCode === 200, 'GET /api/streak returns 200 OK for single activity today');
    assert(resA.data.data.currentStreak === 1, 'currentStreak is 1 for single activity today');
    assert(resA.data.data.longestStreak === 1, 'longestStreak is 1 for single activity today');
    assert(resA.data.data.totalStudyDays === 1, 'totalStudyDays is 1');
    assert(resA.data.data.studiedToday === true, 'studiedToday is true');
  }

  // TEST GROUP 3: Deduplication of Multiple Activities on Same Day
  console.log('\n[TEST GROUP 3] Deduplication of Multiple Activities on Same Day');
  {
    const att2 = { _id: generateId(), user: userA._id, completedAt: getDateDaysAgo(0), percentage: 90 };
    const noteToday = { _id: generateId(), user: userA._id, createdAt: getDateDaysAgo(0), title: 'Notes Today' };
    const fcToday = { _id: generateId(), user: userA._id, updatedAt: getDateDaysAgo(0), title: 'Deck Today' };
    
    mockQuizAttempts.set(att2._id, att2);
    mockNotes.set(noteToday._id, noteToday);
    mockFlashcardSets.set(fcToday._id, fcToday);

    const reqA = { user: userA };
    const resA = createMockRes();
    await getStudyStreak(reqA, resA);

    assert(resA.data.data.totalStudyDays === 1, 'DEDUPLICATION: 4 activities on same day count as 1 totalStudyDay');
    assert(resA.data.data.currentStreak === 1, 'currentStreak remains 1');
  }

  // TEST GROUP 4: Consecutive Days (3-Day Streak: 2 days ago, 1 day ago, today)
  console.log('\n[TEST GROUP 4] Consecutive 3-Day Streak');
  {
    const attYesterday = { _id: generateId(), user: userA._id, completedAt: getDateDaysAgo(1), percentage: 80 };
    const att2DaysAgo = { _id: generateId(), user: userA._id, completedAt: getDateDaysAgo(2), percentage: 75 };
    
    mockQuizAttempts.set(attYesterday._id, attYesterday);
    mockQuizAttempts.set(att2DaysAgo._id, att2DaysAgo);

    const reqA = { user: userA };
    const resA = createMockRes();
    await getStudyStreak(reqA, resA);

    assert(resA.data.data.currentStreak === 3, 'currentStreak calculated as 3 for 3 consecutive days');
    assert(resA.data.data.longestStreak === 3, 'longestStreak updated to 3');
    assert(resA.data.data.totalStudyDays === 3, 'totalStudyDays is 3');
    assert(resA.data.data.studiedToday === true, 'studiedToday is true');
  }

  // TEST GROUP 5: Gap in Study Days (Historical Gap)
  console.log('\n[TEST GROUP 5] Gap in Study Days');
  {
    // Add activity 5 days ago (leaving a gap at 3 & 4 days ago)
    const att5DaysAgo = { _id: generateId(), user: userA._id, completedAt: getDateDaysAgo(5), percentage: 88 };
    mockQuizAttempts.set(att5DaysAgo._id, att5DaysAgo);

    const reqA = { user: userA };
    const resA = createMockRes();
    await getStudyStreak(reqA, resA);

    assert(resA.data.data.currentStreak === 3, 'currentStreak remains 3 (stops at 2 days ago due to gap at 3 days ago)');
    assert(resA.data.data.longestStreak === 3, 'longestStreak is 3');
    assert(resA.data.data.totalStudyDays === 4, 'totalStudyDays includes historical day (4 total days)');
  }

  // TEST GROUP 6: Multi-User Data Isolation (User A vs User B)
  console.log('\n[TEST GROUP 6] Multi-User Data Isolation');
  {
    const reqB = { user: userB };
    const resB = createMockRes();
    await getStudyStreak(reqB, resB);

    assert(resB.data.data.currentStreak === 0, 'ISOLATION: User B currentStreak remains 0 (No leakage from User A)');
    assert(resB.data.data.totalStudyDays === 0, 'ISOLATION: User B totalStudyDays remains 0');
    assert(resB.data.data.studiedToday === false, 'ISOLATION: User B studiedToday remains false');
  }

  // TEST GROUP 7: Detailed Endpoints (Calendar & Weekly)
  console.log('\n[TEST GROUP 7] Detailed Endpoints (GET /calendar, GET /weekly)');
  {
    const reqA = { user: userA };
    
    const resCal = createMockRes();
    await getStudyCalendar(reqA, resCal);
    assert(resCal.statusCode === 200, 'GET /api/streak/calendar returns 200 OK');
    assert(Array.isArray(resCal.data.data), 'Calendar endpoint returns data array');

    const resWk = createMockRes();
    await getWeeklyActivity(reqA, resWk);
    assert(resWk.statusCode === 200, 'GET /api/streak/weekly returns 200 OK');
    assert(Array.isArray(resWk.data.data) && resWk.data.data.length === 7, 'Weekly endpoint returns 7 days');
  }

  // TEST GROUP 8: Auth Middleware Enforcement
  console.log('\n[TEST GROUP 8] Auth Middleware Enforcement');
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
