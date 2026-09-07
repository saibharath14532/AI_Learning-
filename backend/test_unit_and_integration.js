import { getProfile, updateProfile, changePassword, getStats, getDashboard } from './controllers/userController.js';
import { protect } from './middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

// Mock User Model Helper
function createMockUserDoc(overrides = {}) {
  const doc = {
    _id: '66d0a1b2c3d4e5f6a7b8c9d0',
    name: 'Arjun Sharma',
    email: 'arjun@example.com',
    password: '$2a$10$hashedPasswordSample1234567890',
    phone: '+1 (555) 019-2834',
    institution: 'MIT College of Engineering',
    course: 'Master of Computer Applications (MCA)',
    year: 'Year 2',
    level: 'Intermediate',
    learningGoal: 'Interview Preparation',
    preferredStudyTime: 'Evening',
    dailyGoal: '1 hour',
    learningStyle: 'Mixed',
    bio: 'Student bio',
    avatar: 'data:image/png;base64,sample',
    notificationsSettings: {
      dailyReminder: true,
      quizReminder: true,
      streakReminder: true,
      newRecommendations: true,
      certificateAchievement: true,
    },
    statistics: {
      currentStreak: 7,
      longestStreak: 14,
      topicsCompleted: 24,
      quizzesCompleted: 5,
      averageScore: 85,
      studyHours: 15,
      certificates: 2,
    },
    createdAt: new Date('2026-08-01T00:00:00Z'),
    updatedAt: new Date('2026-08-15T00:00:00Z'),
    ...overrides,
    toObject() {
      return { ...this };
    },
    toSafeObject() {
      const obj = { ...this };
      delete obj.password;
      delete obj.toObject;
      delete obj.toSafeObject;
      delete obj.comparePassword;
      delete obj.save;
      obj.id = obj._id ? obj._id.toString() : 'mock-id';
      if (obj.name) {
        obj.firstName = obj.name.split(' ')[0];
        obj.initials = obj.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
      }
      return obj;
    },
    async comparePassword(candidate) {
      if (candidate === 'currentSecret123') return true;
      return false;
    },
    async save() {
      return this;
    }
  };
  return doc;
}

async function runSuite() {
  console.log('\n==================================================');
  console.log('RUNNING USER PROFILE API & CONTROLLER TEST SUITE');
  console.log('==================================================\n');

  // Test Group 1: Safe Object Transformation & Security
  console.log('[TEST GROUP 1] Safe Object & Password Sanitization');
  const mockUser = createMockUserDoc();
  const safeObj = mockUser.toSafeObject();
  assert(safeObj.password === undefined, 'Password is removed from safe user object');
  assert(safeObj.id === mockUser._id, 'MongoDB _id mapped to id field');
  assert(safeObj.firstName === 'Arjun', 'firstName derived correctly from full name');
  assert(safeObj.initials === 'AS', 'initials derived correctly from full name');
  assert(safeObj.statistics.currentStreak === 7, 'MongoDB statistics are preserved in safe user object');

  // Test Group 2: GET /api/users/profile
  console.log('\n[TEST GROUP 2] GET /api/users/profile Controller');
  {
    const req = { user: mockUser };
    const res = createMockRes();
    await getProfile(req, res);
    assert(res.statusCode === 200, 'GET /profile returns 200 OK');
    assert(res.data.success === true, 'GET /profile response contains success: true');
    assert(res.data.user.email === 'arjun@example.com', 'GET /profile returns user email');
    assert(res.data.user.password === undefined, 'GET /profile NEVER returns password');
    assert(res.data.user.level === 'Intermediate', 'GET /profile returns correct level');
  }

  // Test Group 3: PUT /api/users/profile (Valid Update)
  console.log('\n[TEST GROUP 3] PUT /api/users/profile (Valid Update)');
  {
    // Mock User.findById
    const userDoc = createMockUserDoc();
    const originalFindById = (await import('./models/User.js')).default.findById;
    (await import('./models/User.js')).default.findById = async () => userDoc;

    const req = {
      user: userDoc,
      body: {
        name: 'Arjun Updated',
        phone: '+1 (555) 999-0000',
        institution: 'Stanford University',
        course: 'Advanced Computer Science',
        year: 'Year 3',
        level: 'Advanced',
        learningGoal: 'Skill Development',
        preferredStudyTime: 'Morning',
        dailyGoal: '2 hours',
        learningStyle: 'Practice-based',
        // Attack vectors / disallowed fields
        userId: 'attacker-target-id',
        _id: 'fake-id',
        email: 'hacker@evil.com',
        password: 'newUncheckedPassword',
        statistics: { currentStreak: 9999 }
      }
    };
    const res = createMockRes();
    await updateProfile(req, res);

    assert(res.statusCode === 200, 'PUT /profile returns 200 OK on valid payload');
    assert(res.data.success === true, 'PUT /profile returns success: true');
    assert(res.data.user.name === 'Arjun Updated', 'Name is updated in safe user');
    assert(res.data.user.institution === 'Stanford University', 'Institution is updated in safe user');
    assert(res.data.user.course === 'Advanced Computer Science', 'Course is updated in safe user');
    assert(res.data.user.level === 'Advanced', 'Level is updated in safe user');
    assert(res.data.user.dailyGoal === '2 hours', 'Daily goal is updated in safe user');
    assert(res.data.user.email === 'arjun@example.com', 'SECURITY: Email is NOT updated via PUT /profile');
    assert(userDoc.email === 'arjun@example.com', 'SECURITY: MongoDB email field remains unmodified');
    assert(userDoc.statistics.currentStreak === 7, 'SECURITY: Statistics cannot be altered via PUT /profile');

    // Restore findById
    (await import('./models/User.js')).default.findById = originalFindById;
  }

  // Test Group 4: Validation Errors in PUT /api/users/profile
  console.log('\n[TEST GROUP 4] Validation Checks in PUT /api/users/profile');
  {
    const userDoc = createMockUserDoc();
    (await import('./models/User.js')).default.findById = async () => userDoc;

    // 4a. Empty name
    {
      const req = { user: userDoc, body: { name: '   ' } };
      const res = createMockRes();
      await updateProfile(req, res);
      assert(res.statusCode === 400 && res.data.message.includes('Name cannot be empty'), 'Empty name rejected with 400');
    }

    // 4b. Invalid level
    {
      const req = { user: userDoc, body: { level: 'SuperExpert' } };
      const res = createMockRes();
      await updateProfile(req, res);
      assert(res.statusCode === 400 && res.data.message.includes('Invalid learning level'), 'Invalid level rejected with 400');
    }

    // 4c. Invalid study time
    {
      const req = { user: userDoc, body: { preferredStudyTime: 'Midnight3AM' } };
      const res = createMockRes();
      await updateProfile(req, res);
      assert(res.statusCode === 400 && res.data.message.includes('Invalid preferred study time'), 'Invalid study time rejected with 400');
    }

    // 4d. Invalid daily goal
    {
      const req = { user: userDoc, body: { dailyGoal: '100 hours' } };
      const res = createMockRes();
      await updateProfile(req, res);
      assert(res.statusCode === 400 && res.data.message.includes('Invalid daily study goal'), 'Invalid daily goal rejected with 400');
    }

    // 4e. Invalid learning style
    {
      const req = { user: userDoc, body: { learningStyle: 'Telepathy' } };
      const res = createMockRes();
      await updateProfile(req, res);
      assert(res.statusCode === 400 && res.data.message.includes('Invalid learning style'), 'Invalid learning style rejected with 400');
    }
  }

  // Test Group 5: Change Password Controller
  console.log('\n[TEST GROUP 5] Change Password Controller (PUT /api/users/password)');
  {
    const userDoc = createMockUserDoc();
    (await import('./models/User.js')).default.findById = async () => userDoc;

    // 5a. Missing fields
    {
      const req = { user: userDoc, body: { oldPassword: '' } };
      const res = createMockRes();
      await changePassword(req, res);
      assert(res.statusCode === 400, 'Missing password fields rejected with 400');
    }

    // 5b. Incorrect old password
    {
      const req = { user: userDoc, body: { oldPassword: 'wrongPassword', newPassword: 'newValidPassword123' } };
      const res = createMockRes();
      await changePassword(req, res);
      assert(res.statusCode === 400 && res.data.message === 'Incorrect current password', 'Incorrect current password rejected with 400');
    }

    // 5c. Correct old password
    {
      const req = { user: userDoc, body: { oldPassword: 'currentSecret123', newPassword: 'newValidPassword123' } };
      const res = createMockRes();
      await changePassword(req, res);
      assert(res.statusCode === 200 && res.data.success === true, 'Correct password change returns 200 OK and updates password');
      assert(userDoc.password === 'newValidPassword123', 'Password updated on user document');
    }
  }

  // Test Group 6: Authentication Middleware (protect)
  console.log('\n[TEST GROUP 6] Authentication Middleware (protect)');
  {
    // 6a. No token
    {
      const req = { headers: {} };
      const res = createMockRes();
      let nextCalled = false;
      await protect(req, res, () => { nextCalled = true; });
      assert(res.statusCode === 401 && res.data.message.includes('no token provided'), 'Missing token rejected with 401');
      assert(!nextCalled, 'Next middleware is NOT called when token is missing');
    }

    // 6b. Invalid token
    {
      const req = { headers: { authorization: 'Bearer invalid.token.value' } };
      const res = createMockRes();
      let nextCalled = false;
      await protect(req, res, () => { nextCalled = true; });
      assert(res.statusCode === 401 && res.data.message.includes('Invalid token'), 'Malformed token rejected with 401');
      assert(!nextCalled, 'Next middleware is NOT called for invalid token');
    }

    // 6c. Valid token
    {
      const userDoc = createMockUserDoc();
      (await import('./models/User.js')).default.findById = async () => userDoc;
      const validToken = jwt.sign({ userId: userDoc._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const req = { headers: { authorization: `Bearer ${validToken}` } };
      const res = createMockRes();
      let nextCalled = false;
      await protect(req, res, () => { nextCalled = true; });
      assert(nextCalled === true, 'Valid JWT calls next()');
      assert(req.user && req.user._id === userDoc._id, 'Valid JWT attaches user to req.user');
    }
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
