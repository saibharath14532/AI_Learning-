import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

// Load env configuration
dotenv.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_123456';
process.env.JWT_EXPIRES_IN = '1h';

// Mock DB Storage
const mockUsers = [];

// Override Mongoose methods to prevent database calls during test
User.findOne = async function (query) {
  if (!query || !query.email) return null;
  const email = query.email.toLowerCase();
  return mockUsers.find((u) => u.email === email) || null;
};

User.findById = async function (id) {
  if (!id) return null;
  const idStr = id.toString();
  return mockUsers.find((u) => u._id.toString() === idStr) || null;
};

User.create = async function (data) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  const userInstance = new User({
    ...data,
    password: hashedPassword,
  });
  
  userInstance._id = new mongoose.Types.ObjectId();
  mockUsers.push(userInstance);
  return userInstance;
};

User.prototype.save = async function () {
  const idStr = this._id.toString();
  const index = mockUsers.findIndex((u) => u._id.toString() === idStr);
  if (index !== -1) {
    mockUsers[index] = this;
  } else {
    mockUsers.push(this);
  }
  return this;
};

// Mock Response Helper
class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.data = null;
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  json(data) {
    this.data = data;
    return this;
  }
}

// Global Test Runner
const runTests = async () => {
  console.log('==================================================');
  console.log('RUNNING AUTHENTICATION BACKEND TEST SUITE (MOCK DB)');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ ${message}`);
      failed++;
    }
  };

  // --- Test Cases ---

  // 1. Register a valid user
  try {
    const req = {
      body: {
        name: 'Arjun Sharma',
        email: 'arjun@example.com',
        password: 'Password123'
      }
    };
    const res = new MockResponse();

    await register(req, res);

    assert(res.statusCode === 201, 'Register valid user status is 201');
    assert(res.data.success === true, 'Register valid user success flag is true');
    assert(res.data.token !== undefined, 'Register valid user returns token');
    assert(res.data.user.name === 'Arjun Sharma', 'Register valid user returns correct name');
    assert(res.data.user.email === 'arjun@example.com', 'Register valid user returns correct email');
    assert(res.data.user.password === undefined, 'Register valid user does not return password');
  } catch (err) {
    console.error('Test 1 failed with error:', err);
    failed++;
  }

  // 2. Register duplicate email
  try {
    const req = {
      body: {
        name: 'Duplicate User',
        email: 'arjun@example.com',
        password: 'Password999'
      }
    };
    const res = new MockResponse();

    await register(req, res);

    assert(res.statusCode === 400, 'Register duplicate email status is 400');
    assert(res.data.success === false, 'Register duplicate email success flag is false');
    assert(res.data.message.includes('exists'), 'Register duplicate email error message');
  } catch (err) {
    console.error('Test 2 failed with error:', err);
    failed++;
  }

  // 3. Register missing fields
  try {
    const req = { body: { name: 'Arjun Sharma', email: '' } };
    const res = new MockResponse();

    await register(req, res);

    assert(res.statusCode === 400, 'Register missing fields status is 400');
    assert(res.data.success === false, 'Register missing fields success flag is false');
  } catch (err) {
    console.error('Test 3 failed with error:', err);
    failed++;
  }

  // 4. Register invalid email
  try {
    const req = {
      body: {
        name: 'Invalid Email User',
        email: 'invalid-email',
        password: 'Password123'
      }
    };
    const res = new MockResponse();

    await register(req, res);

    assert(res.statusCode === 400, 'Register invalid email status is 400');
    assert(res.data.success === false, 'Register invalid email success flag is false');
  } catch (err) {
    console.error('Test 4 failed with error:', err);
    failed++;
  }

  // 5. Login valid credentials
  let validToken = '';
  try {
    const req = {
      body: {
        email: 'arjun@example.com',
        password: 'Password123'
      }
    };
    const res = new MockResponse();

    await login(req, res);

    assert(res.statusCode === 200, 'Login valid credentials status is 200');
    assert(res.data.success === true, 'Login valid credentials success flag is true');
    assert(res.data.token !== undefined, 'Login valid credentials returns token');
    validToken = res.data.token;
  } catch (err) {
    console.error('Test 5 failed with error:', err);
    failed++;
  }

  // 6. Login wrong password
  try {
    const req = {
      body: {
        email: 'arjun@example.com',
        password: 'wrongpassword'
      }
    };
    const res = new MockResponse();

    await login(req, res);

    assert(res.statusCode === 401, 'Login wrong password status is 401');
    assert(res.data.success === false, 'Login wrong password success is false');
  } catch (err) {
    console.error('Test 6 failed with error:', err);
    failed++;
  }

  // 7. Login unknown email
  try {
    const req = {
      body: {
        email: 'unknown@example.com',
        password: 'Password123'
      }
    };
    const res = new MockResponse();

    await login(req, res);

    assert(res.statusCode === 401, 'Login unknown email status is 401');
    assert(res.data.success === false, 'Login unknown email success is false');
  } catch (err) {
    console.error('Test 7 failed with error:', err);
    failed++;
  }

  // 8. /api/auth/me with valid token
  try {
    const req = {
      headers: {
        authorization: `Bearer ${validToken}`
      }
    };
    const res = new MockResponse();
    let nextCalled = false;

    // Run protect middleware
    await protect(req, res, () => {
      nextCalled = true;
    });

    assert(nextCalled === true, 'protect middleware calls next() with valid token');
    assert(req.user !== undefined, 'protect middleware attaches user object to req');

    // Run getCurrentUser controller
    const meRes = new MockResponse();
    await getCurrentUser(req, meRes);

    assert(meRes.statusCode === 200, '/me with valid token returns status 200');
    assert(meRes.data.success === true, '/me with valid token success is true');
    assert(meRes.data.user.email === 'arjun@example.com', '/me returns correct user');
  } catch (err) {
    console.error('Test 8 failed with error:', err);
    failed++;
  }

  // 9. /api/auth/me without token
  try {
    const req = { headers: {} };
    const res = new MockResponse();

    await protect(req, res, () => {});

    assert(res.statusCode === 401, '/me without token returns status 401');
    assert(res.data.success === false, '/me without token success is false');
  } catch (err) {
    console.error('Test 9 failed with error:', err);
    failed++;
  }

  // 10. /api/auth/me with invalid token
  try {
    const req = {
      headers: {
        authorization: 'Bearer invalidtoken123'
      }
    };
    const res = new MockResponse();

    await protect(req, res, () => {});

    assert(res.statusCode === 401, '/me with invalid token returns status 401');
    assert(res.data.success === false, '/me with invalid token success is false');
  } catch (err) {
    console.error('Test 10 failed with error:', err);
    failed++;
  }

  // 11. /api/auth/me with expired token
  try {
    const expiredToken = jwt.sign({ userId: 'someuserid' }, process.env.JWT_SECRET, {
      expiresIn: '-10s' // Expired 10 seconds ago
    });
    const req = {
      headers: {
        authorization: `Bearer ${expiredToken}`
      }
    };
    const res = new MockResponse();

    await protect(req, res, () => {});

    assert(res.statusCode === 401, '/me with expired token returns status 401');
    assert(res.data.success === false, '/me with expired token success is false');
    assert(res.data.message.includes('expired'), 'Error message mentions expired session');
  } catch (err) {
    console.error('Test 11 failed with error:', err);
    failed++;
  }

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests();
