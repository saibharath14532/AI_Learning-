import assert from 'assert';
import jwt from 'jsonwebtoken';
import { protect } from './middleware/authMiddleware.js';
import { adminMiddleware } from './middleware/adminMiddleware.js';
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  getAnalytics,
  getAllRoadmaps,
  getAllQuizzes,
  getAllFlashcards,
  getAllNotes,
  getAllCertificates,
} from './controllers/adminController.js';
import User from './models/User.js';
import Roadmap from './models/Roadmap.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import FlashcardSet from './models/FlashcardSet.js';
import Note from './models/Note.js';
import Certificate from './models/Certificate.js';
import { updateProfile } from './controllers/userController.js';

let passedTests = 0;
let failedTests = 0;

function pass(msg) {
  console.log(`  ✓ PASS: ${msg}`);
  passedTests++;
}

function fail(msg, err) {
  console.error(`  ✗ FAIL: ${msg}`);
  if (err) console.error(`    Details: ${err.message}`);
  failedTests++;
}

function createMockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    },
  };
  return res;
}

function createMockUserDoc(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Student User',
    email: 'student@example.com',
    password: 'hashedpassword123',
    role: 'user',
    toObject() { return { ...this }; },
    toSafeObject() {
      const obj = { ...this };
      delete obj.password;
      obj.id = obj._id ? obj._id.toString() : '507f1f77bcf86cd799439011';
      obj.firstName = obj.name ? obj.name.split(' ')[0] : 'Student';
      obj.initials = obj.name ? obj.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'SU';
      return obj;
    },
    save: async function() { return this; },
    ...overrides,
  };
  return doc;
}

const normalUser = createMockUserDoc({ role: 'user' });
const adminUser = createMockUserDoc({ _id: '507f1f77bcf86cd799439022', name: 'Admin User', email: 'admin@example.com', role: 'admin' });

async function runAdminSuite() {
  console.log('\n==================================================');
  console.log('RUNNING ADMIN DASHBOARD REST API & SECURITY TESTS');
  console.log('==================================================\n');

  try {
    // ─── TEST GROUP 1: Authentication & Admin Middleware Protection ───────────
    console.log('[TEST GROUP 1] Middleware Security & Authorization Checks (401 / 403)');
    {
      // 1a. Unauthenticated request (No token)
      const req1 = { headers: {} };
      const res1 = createMockRes();
      let nextCalled1 = false;
      await protect(req1, res1, () => { nextCalled1 = true; });
      assert(res1.statusCode === 401, 'Unauthenticated request rejected with 401');
      assert(!nextCalled1, 'Next is not called for unauthenticated request');
      pass('Unauthenticated request rejected with 401 Unauthorized');

      // 1b. Authenticated as Normal User (role === "user") -> 403 Forbidden
      const req2 = { user: normalUser };
      const res2 = createMockRes();
      let nextCalled2 = false;
      await adminMiddleware(req2, res2, () => { nextCalled2 = true; });
      assert(res2.statusCode === 403, 'Normal user rejected by adminMiddleware with 403');
      assert(!nextCalled2, 'Next is not called for non-admin user');
      assert(res2.data.message.includes('Admin privileges required'), 'Error message states admin required');
      pass('Normal user (role = "user") rejected with 403 Forbidden');

      // 1c. Authenticated as Admin User (role === "admin") -> 200 Allowed
      const req3 = { user: adminUser };
      const res3 = createMockRes();
      let nextCalled3 = false;
      await adminMiddleware(req3, res3, () => { nextCalled3 = true; });
      assert(nextCalled3 === true, 'Admin user passes adminMiddleware');
      pass('Admin user (role = "admin") passes adminMiddleware successfully');
    }

    // ─── TEST GROUP 2: Mass Assignment Role Injection Protection ──────────────
    console.log('\n[TEST GROUP 2] Security: Mass Assignment Role Injection Protection');
    {
      // 2a. Profile Update API (PUT /api/users/profile) should ignore role: "admin"
      const targetUser = createMockUserDoc({
        _id: '507f1f77bcf86cd799439033',
        name: 'Attacker User',
        email: 'attacker@example.com',
        role: 'user',
      });

      User.findById = async () => targetUser;

      const req = {
        user: targetUser,
        body: {
          name: 'Updated Name',
          role: 'admin', // Attempted role escalation
        },
      };
      const res = createMockRes();
      await updateProfile(req, res);

      assert(res.statusCode === 200, 'Profile update returns 200 OK');
      assert(targetUser.role === 'user', 'SECURITY: User role remains "user" despite role payload');
      assert(res.data.user.role === 'user', 'SECURITY: Safe object response preserves "user" role');
      pass('SECURITY: PUT /api/users/profile ignores role escalation payloads');
    }

    // ─── TEST GROUP 3: GET /api/admin/dashboard Real DB Statistics ────────────
    console.log('\n[TEST GROUP 3] GET /api/admin/dashboard (DB Aggregations)');
    {
      User.countDocuments = async () => 12;
      Roadmap.countDocuments = async () => 8;
      Quiz.countDocuments = async () => 24;
      QuizAttempt.countDocuments = async () => 65;
      FlashcardSet.countDocuments = async () => 15;
      Note.countDocuments = async () => 30;
      Certificate.countDocuments = async () => 5;

      const req = { user: adminUser };
      const res = createMockRes();
      await getDashboardStats(req, res);

      assert(res.statusCode === 200, 'Dashboard stats returns 200 OK');
      assert(res.data.success === true, 'Response contains success: true');
      assert(res.data.stats.totalUsers === 12, 'totalUsers calculated from MongoDB');
      assert(res.data.stats.totalRoadmaps === 8, 'totalRoadmaps calculated from MongoDB');
      assert(res.data.stats.totalQuizzes === 24, 'totalQuizzes calculated from MongoDB');
      assert(res.data.stats.totalQuizAttempts === 65, 'totalQuizAttempts calculated from MongoDB');
      assert(res.data.stats.totalFlashcardSets === 15, 'totalFlashcardSets calculated from MongoDB');
      assert(res.data.stats.totalNotes === 30, 'totalNotes calculated from MongoDB');
      assert(res.data.stats.totalCertificates === 5, 'totalCertificates calculated from MongoDB');
      pass('GET /admin/dashboard returns real calculated MongoDB totals');
    }

    // ─── TEST GROUP 4: GET /api/admin/users (Search, Pagination & Projection) ─
    console.log('\n[TEST GROUP 4] GET /api/admin/users (Search, Pagination & Password Exclusion)');
    {
      const sampleUsers = [
        new User({ _id: 'u1', name: 'Arjun Sharma', email: 'arjun@example.com', role: 'user' }),
        new User({ _id: 'u2', name: 'Priya Singh', email: 'priya@example.com', role: 'user' }),
      ];

      User.countDocuments = async () => 2;
      User.find = () => ({
        select: () => ({
          sort: () => ({
            skip: () => ({
              limit: async () => sampleUsers,
            }),
          }),
        }),
      });

      const req = { user: adminUser, query: { page: '1', limit: '10', search: 'arjun' } };
      const res = createMockRes();
      await getUsers(req, res);

      assert(res.statusCode === 200, 'GET /admin/users returns 200 OK');
      assert(res.data.users.length === 2, 'Returns paginated user array');
      assert(res.data.page === 1, 'Returns current page number');
      assert(res.data.limit === 10, 'Returns limit');
      assert(res.data.total === 2, 'Returns total user count');
      assert(res.data.users[0].password === undefined, 'SECURITY: Password is projected out');
      pass('GET /admin/users handles search, pagination, and excludes passwords');
    }

    // ─── TEST GROUP 5: GET /api/admin/users/:id (Individual User Learning Summary)
    console.log('\n[TEST GROUP 5] GET /api/admin/users/:id (User Details & Activity Log)');
    {
      const targetUser = new User({
        _id: '507f1f77bcf86cd799439099',
        name: 'Detailed Student',
        email: 'student.details@example.com',
        role: 'user',
        statistics: { currentStreak: 5, longestStreak: 10 },
      });

      User.findById = () => ({
        select: async () => targetUser,
      });

      Roadmap.find = () => ({ sort: async () => [{ _id: 'r1', subject: 'React', progress: 100, updatedAt: new Date() }] });
      QuizAttempt.find = () => ({ sort: () => ({ populate: async () => [{ _id: 'qa1', percentage: 90, completedAt: new Date() }] }) });
      FlashcardSet.find = () => ({ sort: async () => [{ _id: 'f1', topic: 'JavaScript' }] });
      Note.find = () => ({ sort: async () => [{ _id: 'n1', topic: 'Async JS', createdAt: new Date() }] });
      Certificate.find = () => ({ sort: async () => [{ _id: 'c1', courseName: 'React Mastery', certificateId: 'CERT-001', issuedAt: new Date() }] });

      const req = { user: adminUser, params: { id: '507f1f77bcf86cd799439099' } };
      const res = createMockRes();
      await getUserDetails(req, res);

      assert(res.statusCode === 200, 'GET /admin/users/:id returns 200 OK');
      assert(res.data.user.email === 'student.details@example.com', 'Returns correct user profile');
      assert(res.data.statistics.roadmaps === 1, 'Calculates roadmap count');
      assert(res.data.statistics.completedRoadmaps === 1, 'Calculates completed roadmaps');
      assert(res.data.statistics.averageQuizScore === 90, 'Calculates average quiz score');
      assert(res.data.recentActivity.length > 0, 'Aggregates unified recent activity log');
      pass('GET /admin/users/:id returns complete learning statistics & activity feed');
    }

    // ─── TEST GROUP 6: GET /api/admin/analytics & Additional Admin Endpoints ──
    console.log('\n[TEST GROUP 6] Additional Sub-resource Endpoints (Analytics, Roadmaps, Quizzes)');
    {
      // 6a. Analytics
      User.countDocuments = async () => 20;
      QuizAttempt.countDocuments = async () => 50;
      Roadmap.countDocuments = async () => 10;
      Certificate.countDocuments = async () => 4;
      QuizAttempt.aggregate = async () => [{ avgScore: 82.5 }];
      QuizAttempt.distinct = async () => ['u1', 'u2'];

      const reqAnalytics = { user: adminUser };
      const resAnalytics = createMockRes();
      await getAnalytics(reqAnalytics, resAnalytics);

      assert(resAnalytics.statusCode === 200, 'GET /admin/analytics returns 200 OK');
      assert(resAnalytics.data.analytics.totalUsers === 20, 'Analytics totalUsers accurate');
      assert(resAnalytics.data.analytics.avgQuizScore === 83, 'Analytics avgQuizScore rounded');
      pass('GET /admin/analytics returns accurate aggregate statistics');

      // 6b. Roadmaps
      Roadmap.countDocuments = async () => 1;
      Roadmap.find = () => ({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: async () => [{ _id: 'r1', subject: 'DBMS', progress: 50 }],
            }),
          }),
        }),
      });

      const reqRoadmaps = { user: adminUser, query: {} };
      const resRoadmaps = createMockRes();
      await getAllRoadmaps(reqRoadmaps, resRoadmaps);
      assert(resRoadmaps.statusCode === 200, 'GET /admin/roadmaps returns 200 OK');
      pass('GET /admin/roadmaps returns paginated roadmaps list');

      // 6c. Quizzes (Sanitized answers)
      Quiz.countDocuments = async () => 1;
      Quiz.find = () => ({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: async () => [{
                toObject: () => ({
                  _id: 'q1', title: 'SQL Quiz', questions: [{}, {}], correctAnswer: 2
                })
              }],
            }),
          }),
        }),
      });

      const reqQuizzes = { user: adminUser, query: {} };
      const resQuizzes = createMockRes();
      await getAllQuizzes(reqQuizzes, resQuizzes);
      assert(resQuizzes.statusCode === 200, 'GET /admin/quizzes returns 200 OK');
      assert(resQuizzes.data.quizzes[0].correctAnswer === undefined, 'SECURITY: Answer key not exposed');
      pass('GET /admin/quizzes returns sanitized quizzes list');
    }

    console.log('\n==================================================');
    console.log(`ADMIN TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Admin Test Error:', err);
    process.exit(1);
  }
}

runAdminSuite();
