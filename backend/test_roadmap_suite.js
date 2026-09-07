import {
  createRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateRoadmap,
  deleteRoadmap,
} from './controllers/roadmapController.js';
import { protect } from './middleware/authMiddleware.js';
import User from './models/User.js';
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

// Mock Database Storage
const mockDB = new Map();

// Mock Mongoose Document for Roadmap
function createMockRoadmapDoc(data) {
  const _id = data._id || `66d0a1b2c3d4e5f6a7b0${Math.floor(Math.random() * 8999 + 1000)}`;
  const doc = {
    _id,
    user: data.user,
    title: data.title || data.subject,
    goal: data.goal || data.subject,
    subject: data.subject,
    currentLevel: data.currentLevel || 'Beginner',
    targetLevel: data.targetLevel || 'Advanced',
    duration: data.duration || '1 Month',
    dailyStudyTime: data.dailyStudyTime || '1 hour/day',
    progress: data.progress !== undefined ? data.progress : 0,
    status: data.status || 'in-progress',
    topics: data.topics || [],
    modules: data.modules || [],
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
    toObject() {
      return { ...this };
    },
    toSafeObject() {
      const obj = { ...this };
      delete obj.toObject;
      delete obj.toSafeObject;
      delete obj.save;
      obj.id = obj._id.toString();
      return obj;
    },
    async save() {
      mockDB.set(this._id.toString(), this);
      return this;
    }
  };
  mockDB.set(_id.toString(), doc);
  return doc;
}

// Stub Roadmap Model methods
import Roadmap from './models/Roadmap.js';

Roadmap.create = async (payload) => {
  return createMockRoadmapDoc(payload);
};

Roadmap.find = (query) => {
  const results = Array.from(mockDB.values()).filter((doc) => {
    if (query.user) return doc.user.toString() === query.user.toString();
    return true;
  });

  return {
    sort() {
      return results;
    }
  };
};

Roadmap.findById = async (id) => {
  return mockDB.get(id.toString()) || null;
};

Roadmap.findByIdAndDelete = async (id) => {
  const existing = mockDB.get(id.toString());
  if (existing) {
    mockDB.delete(id.toString());
    return existing;
  }
  return null;
};

async function runSuite() {
  console.log('\n==================================================');
  console.log('RUNNING ROADMAP REST API & MULTI-USER ISOLATION TESTS');
  console.log('==================================================\n');

  const userA = { _id: '66d0a1b2c3d4e5f6a7b00001', name: 'User A', email: 'userA@example.com' };
  const userB = { _id: '66d0a1b2c3d4e5f6a7b00002', name: 'User B', email: 'userB@example.com' };

  // Test Group 1: CREATE ROADMAP (POST /api/roadmaps)
  console.log('[TEST GROUP 1] POST /api/roadmaps (Create Roadmap & Ownership Assignment)');
  let roadmapA_Id = null;
  let roadmapB_Id = null;

  {
    // 1a. User A creates Roadmap A
    const reqA = {
      user: userA,
      body: {
        title: 'User A DBMS Roadmap',
        goal: 'Master Database Systems',
        subject: 'DBMS',
        currentLevel: 'Beginner',
        targetLevel: 'Advanced',
        duration: '1 Month',
        dailyStudyTime: '1 hour/day',
        topics: [
          { id: 't1', title: 'ER Diagrams', status: 'In Progress' },
          { id: 't2', title: 'Normalization 3NF', status: 'Upcoming' }
        ],
        // Malicious body attempt to claim another user ID
        userId: userB._id,
        user: userB._id,
      }
    };
    const resA = createMockRes();
    await createRoadmap(reqA, resA);

    assert(resA.statusCode === 201, 'User A create roadmap returns 201 Created');
    assert(resA.data.success === true, 'Response contains success: true');
    assert(resA.data.roadmap.subject === 'DBMS', 'Subject is stored correctly');
    assert(resA.data.roadmap.id !== undefined, 'Roadmap ID is present');
    roadmapA_Id = resA.data.roadmap.id;

    // Check ownership in DB
    const savedA = mockDB.get(roadmapA_Id);
    assert(savedA.user.toString() === userA._id, 'SECURITY: Ownership assigned strictly to req.user._id (User A), ignoring body.userId');

    // 1b. User B creates Roadmap B
    const reqB = {
      user: userB,
      body: {
        title: 'User B Java Roadmap',
        goal: 'Master Java Spring Boot',
        subject: 'Java Core',
        currentLevel: 'Intermediate',
        targetLevel: 'Advanced',
        duration: '2 Weeks',
        dailyStudyTime: '2 hours/day',
        topics: [
          { id: 'tb1', title: 'Java Multithreading', status: 'In Progress' }
        ]
      }
    };
    const resB = createMockRes();
    await createRoadmap(reqB, resB);
    assert(resB.statusCode === 201, 'User B create roadmap returns 201 Created');
    roadmapB_Id = resB.data.roadmap.id;
  }

  // Test Group 2: GET USER ROADMAPS & DATA ISOLATION (GET /api/roadmaps)
  console.log('\n[TEST GROUP 2] GET /api/roadmaps (Data Isolation Between Users)');
  {
    // User A fetches roadmaps
    const reqA = { user: userA };
    const resA = createMockRes();
    await getRoadmaps(reqA, resA);

    assert(resA.statusCode === 200, 'User A GET /api/roadmaps returns 200 OK');
    assert(resA.data.count === 1, 'User A receives exactly 1 roadmap');
    assert(resA.data.roadmaps[0].id === roadmapA_Id, 'User A receives only Roadmap A');
    assert(!resA.data.roadmaps.some((r) => r.id === roadmapB_Id), 'ISOLATION: User A CANNOT see User B\'s roadmap');

    // User B fetches roadmaps
    const reqB = { user: userB };
    const resB = createMockRes();
    await getRoadmaps(reqB, resB);

    assert(resB.statusCode === 200, 'User B GET /api/roadmaps returns 200 OK');
    assert(resB.data.count === 1, 'User B receives exactly 1 roadmap');
    assert(resB.data.roadmaps[0].id === roadmapB_Id, 'User B receives only Roadmap B');
    assert(!resB.data.roadmaps.some((r) => r.id === roadmapA_Id), 'ISOLATION: User B CANNOT see User A\'s roadmap');
  }

  // Test Group 3: SINGLE ROADMAP ACCESS & FORBIDDEN CHECKS (GET /api/roadmaps/:id)
  console.log('\n[TEST GROUP 3] GET /api/roadmaps/:id (Cross-User Access Control)');
  {
    // 3a. User A accesses own Roadmap A -> 200
    const reqA = { user: userA, params: { id: roadmapA_Id } };
    const resA = createMockRes();
    await getRoadmapById(reqA, resA);
    assert(resA.statusCode === 200 && resA.data.roadmap.id === roadmapA_Id, 'User A successfully accesses own Roadmap A');

    // 3b. User B attempts to access User A's Roadmap A -> 403 Forbidden
    const reqB_Attack = { user: userB, params: { id: roadmapA_Id } };
    const resB_Attack = createMockRes();
    await getRoadmapById(reqB_Attack, resB_Attack);
    assert(resB_Attack.statusCode === 403, 'SECURITY: User B accessing User A\'s roadmap is rejected with 403 Forbidden');
    assert(resB_Attack.data.message.includes('Access denied'), 'Descriptive 403 error returned without leaking content');

    // 3c. Non-existent ID -> 404
    const req404 = { user: userA, params: { id: '66d0a1b2c3d4e5f6a7b99999' } };
    const res404 = createMockRes();
    await getRoadmapById(req404, res404);
    assert(res404.statusCode === 404, 'Non-existent roadmap ID returns 404 Not Found');
  }

  // Test Group 4: UPDATE ROADMAP & CROSS-USER TAMPERING (PUT /api/roadmaps/:id)
  console.log('\n[TEST GROUP 4] PUT /api/roadmaps/:id (Update & Ownership Protection)');
  {
    // 4a. User A updates progress and topics of own Roadmap A -> 200
    const reqA_Update = {
      user: userA,
      params: { id: roadmapA_Id },
      body: {
        progress: 50,
        status: 'in-progress',
        topics: [
          { id: 't1', title: 'ER Diagrams', status: 'Completed' },
          { id: 't2', title: 'Normalization 3NF', status: 'In Progress' }
        ]
      }
    };
    const resA_Update = createMockRes();
    await updateRoadmap(reqA_Update, resA_Update);
    assert(resA_Update.statusCode === 200, 'User A updating own roadmap returns 200 OK');
    assert(resA_Update.data.roadmap.progress === 50, 'Progress updated to 50%');
    assert(resA_Update.data.roadmap.topics[0].status === 'Completed', 'Topic status updated');

    // 4b. User B attempts to update User A's Roadmap A -> 403 Forbidden
    const reqB_Tamper = {
      user: userB,
      params: { id: roadmapA_Id },
      body: { progress: 100, user: userB._id }
    };
    const resB_Tamper = createMockRes();
    await updateRoadmap(reqB_Tamper, resB_Tamper);
    assert(resB_Tamper.statusCode === 403, 'SECURITY: User B updating User A\'s roadmap is rejected with 403 Forbidden');
    
    // Verify Roadmap A progress remains 50 in DB
    const savedA = mockDB.get(roadmapA_Id);
    assert(savedA.progress === 50, 'Roadmap A progress remains untouched in DB after unauthorized update attempt');
  }

  // Test Group 5: DELETE ROADMAP (DELETE /api/roadmaps/:id)
  console.log('\n[TEST GROUP 5] DELETE /api/roadmaps/:id (Deletion & Security)');
  {
    // 5a. User B attempts to delete User A's Roadmap A -> 403 Forbidden
    const reqB_Delete = { user: userB, params: { id: roadmapA_Id } };
    const resB_Delete = createMockRes();
    await deleteRoadmap(reqB_Delete, resB_Delete);
    assert(resB_Delete.statusCode === 403, 'SECURITY: User B deleting User A\'s roadmap is rejected with 403 Forbidden');
    assert(mockDB.has(roadmapA_Id), 'Roadmap A remains in DB after unauthorized delete attempt');

    // 5b. User A deletes own Roadmap A -> 200
    const reqA_Delete = { user: userA, params: { id: roadmapA_Id } };
    const resA_Delete = createMockRes();
    await deleteRoadmap(reqA_Delete, resA_Delete);
    assert(resA_Delete.statusCode === 200, 'User A deleting own roadmap returns 200 OK');
    assert(!mockDB.has(roadmapA_Id), 'Roadmap A is removed from DB');
  }

  // Test Group 6: VALIDATION ERROR CHECKS (400 Bad Request)
  console.log('\n[TEST GROUP 6] Input Validation Checks (400 Bad Request)');
  {
    // 6a. Missing subject & goal
    const reqEmpty = { user: userA, body: { currentLevel: 'Beginner' } };
    const resEmpty = createMockRes();
    await createRoadmap(reqEmpty, resEmpty);
    assert(resEmpty.statusCode === 400 && resEmpty.data.message.includes('required'), 'Missing subject/goal returns 400 Bad Request');

    // 6b. Invalid progress value (> 100)
    const reqProgressHigh = { user: userA, body: { subject: 'DBMS', progress: 150 } };
    const resProgressHigh = createMockRes();
    await createRoadmap(reqProgressHigh, resProgressHigh);
    assert(resProgressHigh.statusCode === 400 && resProgressHigh.data.message.includes('between 0 and 100'), 'Progress > 100 returns 400 Bad Request');

    // 6c. Invalid progress value (< 0)
    const reqProgressLow = { user: userA, body: { subject: 'DBMS', progress: -10 } };
    const resProgressLow = createMockRes();
    await createRoadmap(reqProgressLow, resProgressLow);
    assert(resProgressLow.statusCode === 400 && resProgressLow.data.message.includes('between 0 and 100'), 'Progress < 0 returns 400 Bad Request');

    // 6d. Invalid status string
    const reqStatusBad = { user: userA, body: { subject: 'DBMS', status: 'super-done' } };
    const resStatusBad = createMockRes();
    await createRoadmap(reqStatusBad, resStatusBad);
    assert(resStatusBad.statusCode === 400 && resStatusBad.data.message.includes('Status must be one of'), 'Invalid status string returns 400 Bad Request');
  }

  // Test Group 7: AUTHENTICATION MIDDLEWARE FOR ROADMAP ROUTES
  console.log('\n[TEST GROUP 7] Auth Middleware Enforcement for Roadmap API');
  {
    // 7a. Missing token
    const reqNoToken = { headers: {} };
    const resNoToken = createMockRes();
    let nextCalled = false;
    await protect(reqNoToken, resNoToken, () => { nextCalled = true; });
    assert(resNoToken.statusCode === 401, 'Request without JWT is rejected with 401 Unauthorized');
    assert(!nextCalled, 'Next middleware is NOT called for missing token');

    // 7b. Invalid token
    const reqBadToken = { headers: { authorization: 'Bearer bad.token.string' } };
    const resBadToken = createMockRes();
    nextCalled = false;
    await protect(reqBadToken, resBadToken, () => { nextCalled = true; });
    assert(resBadToken.statusCode === 401, 'Request with invalid JWT is rejected with 401 Unauthorized');
    assert(!nextCalled, 'Next middleware is NOT called for invalid token');

    // 7c. Valid JWT
    const validToken = jwt.sign({ userId: userA._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const reqGoodToken = { headers: { authorization: `Bearer ${validToken}` } };
    const resGoodToken = createMockRes();
    nextCalled = false;

    // Mock User findById for protect
    const origFindById = User.findById;
    User.findById = async (id) => (id === userA._id ? userA : null);

    await protect(reqGoodToken, resGoodToken, () => { nextCalled = true; });
    assert(nextCalled === true, 'Valid JWT calls next()');
    assert(reqGoodToken.user && reqGoodToken.user._id === userA._id, 'Valid JWT attaches authenticated user to req.user');

    User.findById = origFindById;
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
