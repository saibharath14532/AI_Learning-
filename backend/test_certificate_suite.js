import {
  getCertificates,
  getCertificateById,
  checkCertificateEligibility,
  issueCertificate,
  verifyCertificate,
} from './controllers/certificateController.js';
import { protect } from './middleware/authMiddleware.js';
import User from './models/User.js';
import Roadmap from './models/Roadmap.js';
import QuizAttempt from './models/QuizAttempt.js';
import Certificate from './models/Certificate.js';
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
const mockCertificates = new Map();
const mockRoadmaps = new Map();
const mockQuizAttempts = new Map();

function generateId(prefix = '66d0a1b2c3d4e5f6a7d') {
  return `${prefix}${Math.floor(Math.random() * 89999 + 10000)}`;
}

// Stub Mongoose Models for Certificate, Roadmap, QuizAttempt
Certificate.find = (query) => {
  let list = Array.from(mockCertificates.values());
  if (query.user) {
    list = list.filter(c => c.user.toString() === query.user.toString());
  }
  const promise = Promise.resolve(list);
  promise.sort = () => list;
  return promise;
};

Certificate.findById = async (id) => {
  return mockCertificates.get(id.toString()) || null;
};

Certificate.findOne = async (query) => {
  const list = Array.from(mockCertificates.values());
  if (query.$or) {
    return list.find(c => query.$or.some(cond => (cond.certificateId && c.certificateId === cond.certificateId) || (cond.verificationCode && c.verificationCode === cond.verificationCode))) || null;
  }
  if (query.user && query.roadmap) {
    return list.find(c => c.user.toString() === query.user.toString() && c.roadmap.toString() === query.roadmap.toString()) || null;
  }
  return null;
};

Certificate.create = async (doc) => {
  const id = generateId('66d0a1b2c3d4e5f6a7d');
  const certDoc = {
    _id: id,
    ...doc,
    toSafeObject() {
      const obj = { ...this, id: this._id.toString() };
      delete obj._id;
      return obj;
    }
  };
  mockCertificates.set(id, certDoc);
  return certDoc;
};

Roadmap.find = (query) => {
  let list = Array.from(mockRoadmaps.values());
  if (query.user) {
    list = list.filter(r => r.user.toString() === query.user.toString());
  }
  return Promise.resolve(list);
};

Roadmap.findOne = async (query) => {
  const list = Array.from(mockRoadmaps.values());
  if (query._id && query.user) {
    return list.find(r => r._id.toString() === query._id.toString() && r.user.toString() === query.user.toString()) || null;
  }
  return null;
};

QuizAttempt.find = (query) => {
  let list = Array.from(mockQuizAttempts.values());
  if (query.user) {
    list = list.filter(a => a.user.toString() === query.user.toString());
  }
  return Promise.resolve(list);
};

async function runSuite() {
  console.log('\n==================================================');
  console.log('RUNNING CERTIFICATE DATABASE & ELIGIBILITY TESTS');
  console.log('==================================================\n');

  const userA = { _id: '66d0a1b2c3d4e5f6a7c00001', name: 'Alice Student', email: 'alice@example.com' };
  const userB = { _id: '66d0a1b2c3d4e5f6a7c00002', name: 'Bob Learner', email: 'bob@example.com' };

  // Setup Roadmaps for User A
  const rIncomplete = {
    _id: '66d0a1b2c3d4e5f6a7e00001',
    user: userA._id,
    goal: 'Data Structures Mastery',
    subject: 'Data Structures',
    progress: 50,
    topics: [{ title: 'Arrays', status: 'Completed' }, { title: 'Trees', status: 'Pending' }]
  };

  const rComplete = {
    _id: '66d0a1b2c3d4e5f6a7e00002',
    user: userA._id,
    goal: 'DBMS Fundamentals',
    subject: 'DBMS',
    progress: 100,
    topics: [{ title: 'SQL', status: 'Completed' }, { title: 'Normalization', status: 'Completed' }]
  };

  // Setup Roadmap for User B
  const rUserBComplete = {
    _id: '66d0a1b2c3d4e5f6a7e00003',
    user: userB._id,
    goal: 'Operating Systems Mastery',
    subject: 'Operating Systems',
    progress: 100,
    topics: [{ title: 'Processes', status: 'Completed' }]
  };

  mockRoadmaps.set(rIncomplete._id, rIncomplete);
  mockRoadmaps.set(rComplete._id, rComplete);
  mockRoadmaps.set(rUserBComplete._id, rUserBComplete);

  // TEST GROUP 1: Eligibility Thresholds (0%, 50%, 100%)
  console.log('[TEST GROUP 1] Certificate Eligibility Thresholds');
  {
    const reqIncomplete = { user: userA, params: { roadmapId: rIncomplete._id } };
    const resIncomplete = createMockRes();
    await checkCertificateEligibility(reqIncomplete, resIncomplete);

    assert(resIncomplete.statusCode === 200, 'GET /api/certificates/eligibility returns 200 OK');
    assert(resIncomplete.data.eligible === false, 'Roadmap at 50% is NOT eligible (eligible: false)');
    assert(resIncomplete.data.roadmapProgress === 50, 'Returns actual progress (50%)');

    const reqComplete = { user: userA, params: { roadmapId: rComplete._id } };
    const resComplete = createMockRes();
    await checkCertificateEligibility(reqComplete, resComplete);

    assert(resComplete.statusCode === 200, 'GET /api/certificates/eligibility returns 200 OK');
    assert(resComplete.data.eligible === true, 'Roadmap at 100% IS ELIGIBLE (eligible: true)');
    assert(resComplete.data.roadmapProgress === 100, 'Returns progress 100%');
  }

  // TEST GROUP 2: Attempting Issuance for Incomplete Roadmap (Rejected)
  console.log('\n[TEST GROUP 2] Reject Certificate Issuance for Incomplete Roadmap');
  {
    const reqReject = { user: userA, body: { roadmapId: rIncomplete._id } };
    const resReject = createMockRes();
    await issueCertificate(reqReject, resReject);

    assert(resReject.statusCode === 400, 'POST /api/certificates/issue for 50% roadmap returns 400 Bad Request');
    assert(resReject.data.success === false, 'Response contains success: false');
    assert(resReject.data.message.includes('not 100% complete'), 'ErrorMessage states roadmap is incomplete');
  }

  // TEST GROUP 3: Valid Certificate Issuance for 100% Complete Roadmap
  let issuedCertA_Id = null;
  let issuedCertA_Code = null;
  console.log('\n[TEST GROUP 3] Issue Certificate for 100% Completed Roadmap');
  {
    const reqIssue = { user: userA, body: { roadmapId: rComplete._id } };
    const resIssue = createMockRes();
    await issueCertificate(reqIssue, resIssue);

    assert(resIssue.statusCode === 201, 'POST /api/certificates/issue for 100% roadmap returns 201 Created');
    assert(resIssue.data.success === true, 'Response contains success: true');
    assert(resIssue.data.data.studentName === 'Alice Student', 'Student name matches recipient profile');
    assert(resIssue.data.data.courseName === 'DBMS Fundamentals', 'Course name matches roadmap goal/subject');
    assert(typeof resIssue.data.data.certificateId === 'string' && resIssue.data.data.certificateId.startsWith('CERT-2026-'), 'Generated unique certificateId starts with CERT-2026-');
    assert(typeof resIssue.data.data.verificationCode === 'string', 'Generated unique verificationCode');
    
    issuedCertA_Id = resIssue.data.data.id;
    issuedCertA_Code = resIssue.data.data.certificateId;
  }

  // TEST GROUP 4: Duplicate Prevention
  console.log('\n[TEST GROUP 4] Duplicate Certificate Prevention');
  {
    const reqDup = { user: userA, body: { roadmapId: rComplete._id } };
    const resDup = createMockRes();
    await issueCertificate(reqDup, resDup);

    assert(resDup.statusCode === 200, 'Re-issuing certificate returns 200 OK');
    assert(resDup.data.message.includes('already been issued'), 'Returns duplicate warning message');
    assert(resDup.data.data.id === issuedCertA_Id, 'Returns existing certificate ID without creating duplicate');
  }

  // TEST GROUP 5: Multi-User Security & Isolation
  console.log('\n[TEST GROUP 5] Multi-User Security & Data Isolation');
  {
    // User B trying to view User A's certificate
    const reqUserBViewA = { user: userB, params: { id: issuedCertA_Id } };
    const resUserBViewA = createMockRes();
    await getCertificateById(reqUserBViewA, resUserBViewA);

    assert(resUserBViewA.statusCode === 403, 'SECURITY: User B viewing User A certificate rejected with 403 Forbidden');

    // User B trying to issue certificate for User A's roadmap
    const reqUserBIssueA = { user: userB, body: { roadmapId: rComplete._id } };
    const resUserBIssueA = createMockRes();
    await issueCertificate(reqUserBIssueA, resUserBIssueA);

    assert(resUserBIssueA.statusCode === 404, 'SECURITY: User B issuing User A roadmap rejected with 404 Not Found');

    // User B fetching certificates list
    const reqUserBList = { user: userB };
    const resUserBList = createMockRes();
    await getCertificates(reqUserBList, resUserBList);

    assert(resUserBList.statusCode === 200, 'GET /api/certificates returns 200 OK for User B');
    assert(resUserBList.data.data.earnedCertificates.length === 0, 'ISOLATION: User B earnedCertificates is 0 (No leakage from User A)');
  }

  // TEST GROUP 6: Public Verification Endpoint
  console.log('\n[TEST GROUP 6] Public Certificate Verification');
  {
    const reqVerifValid = { params: { code: issuedCertA_Code } };
    const resVerifValid = createMockRes();
    await verifyCertificate(reqVerifValid, resVerifValid);

    assert(resVerifValid.statusCode === 200, 'GET /api/certificates/verify/:code returns 200 OK');
    assert(resVerifValid.data.verified === true, 'Response contains verified: true');
    assert(resVerifValid.data.data.studentName === 'Alice Student', 'Verified details contain student name');

    const reqVerifInvalid = { params: { code: 'INVALID_CODE_999' } };
    const resVerifInvalid = createMockRes();
    await verifyCertificate(reqVerifInvalid, resVerifInvalid);

    assert(resVerifInvalid.statusCode === 404, 'GET /api/certificates/verify/INVALID returns 404 Not Found');
    assert(resVerifInvalid.data.verified === false, 'Response contains verified: false');
  }

  // TEST GROUP 7: Auth Middleware Enforcement
  console.log('\n[TEST GROUP 7] Auth Middleware Enforcement');
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
