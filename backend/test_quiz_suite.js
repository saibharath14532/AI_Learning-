import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizHistory,
  getQuizResults,
} from './controllers/quizController.js';
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

// Mock In-Memory DB
const mockQuizzes = new Map();
const mockAttempts = new Map();
const mockRoadmaps = new Map();

// Helper for valid 24-character hex ObjectIds
function generateObjectId(prefix = '66d0a1b2c3d4e5f6a7b0') {
  return `${prefix}${Math.floor(Math.random() * 8999 + 1000)}`;
}

// Mock Quiz Document Factory
function createMockQuizDoc(data) {
  const _id = data._id || generateObjectId('66d0a1b2c3d4e5f6a7b1');
  const doc = {
    _id,
    user: data.user,
    roadmap: data.roadmap || null,
    title: data.title,
    subject: data.subject,
    topic: data.topic || data.subject,
    difficulty: data.difficulty || 'Intermediate',
    type: data.type || 'Multiple Choice',
    description: data.description || '',
    questions: data.questions || [],
    totalQuestions: data.questions ? data.questions.length : 0,
    timeLimit: data.timeLimit || (data.questions ? data.questions.length * 90 : 900),
    status: data.status || 'active',
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
    toObject() {
      return { ...this };
    },
    toSafeObject() {
      const obj = { ...this };
      delete obj.toObject;
      delete obj.toSafeObject;
      delete obj.toTakeObject;
      delete obj.save;
      obj.id = obj._id.toString();
      return obj;
    },
    toTakeObject() {
      const obj = { ...this };
      obj.id = obj._id.toString();
      if (Array.isArray(obj.questions)) {
        obj.questions = obj.questions.map((q, idx) => ({
          id: q.id || `q_${idx + 1}`,
          question: q.question,
          options: q.options || [],
          points: q.points || 1,
        }));
      }
      delete obj.toObject;
      delete obj.toSafeObject;
      delete obj.toTakeObject;
      delete obj.save;
      return obj;
    },
    async save() {
      mockQuizzes.set(this._id.toString(), this);
      return this;
    }
  };
  mockQuizzes.set(_id.toString(), doc);
  return doc;
}

// Mock QuizAttempt Document Factory
function createMockAttemptDoc(data) {
  const _id = data._id || generateObjectId('66d0a1b2c3d4e5f6a7b2');
  const doc = {
    _id,
    user: data.user,
    quiz: data.quiz,
    roadmap: data.roadmap || null,
    answers: data.answers || [],
    score: data.score || 0,
    totalPoints: data.totalPoints || 0,
    percentage: data.percentage || 0,
    correctAnswers: data.correctAnswers || 0,
    incorrectAnswers: data.incorrectAnswers || 0,
    unanswered: data.unanswered || 0,
    timeTaken: data.timeTaken || 0,
    completedAt: data.completedAt || new Date(),
    createdAt: new Date(),
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
      mockAttempts.set(this._id.toString(), this);
      return this;
    }
  };
  mockAttempts.set(_id.toString(), doc);
  return doc;
}

// Stub Mongoose Models
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Roadmap from './models/Roadmap.js';

Quiz.create = async (payload) => createMockQuizDoc(payload);

Quiz.find = (query) => {
  let list = Array.from(mockQuizzes.values());
  if (query.user) {
    list = list.filter(q => q.user.toString() === query.user.toString());
  }
  return {
    sort() {
      return list;
    }
  };
};

Quiz.findById = async (id) => mockQuizzes.get(id.toString()) || null;
Quiz.findByIdAndDelete = async (id) => {
  const ex = mockQuizzes.get(id.toString());
  if (ex) mockQuizzes.delete(id.toString());
  return ex;
};

QuizAttempt.create = async (payload) => createMockAttemptDoc(payload);
QuizAttempt.find = (query) => {
  let list = Array.from(mockAttempts.values());
  if (query.user) {
    list = list.filter(a => a.user.toString() === query.user.toString());
  }
  if (query.quiz) {
    list = list.filter(a => a.quiz.toString() === query.quiz.toString());
  }
  return {
    populate(field, sel) {
      return {
        sort() {
          return list.map(att => {
            const copy = { ...att };
            if (field === 'quiz') {
              copy.quiz = mockQuizzes.get(att.quiz.toString()) || null;
            }
            return copy;
          });
        }
      };
    },
    sort() {
      return list;
    }
  };
};

QuizAttempt.deleteMany = async (query) => {
  if (query.quiz) {
    Array.from(mockAttempts.entries()).forEach(([id, att]) => {
      if (att.quiz.toString() === query.quiz.toString()) {
        mockAttempts.delete(id);
      }
    });
  }
};

Roadmap.findById = async (id) => mockRoadmaps.get(id.toString()) || null;

async function runSuite() {
  console.log('\n==================================================');
  console.log('RUNNING QUIZ API, SERVER SCORING & SECURITY TESTS');
  console.log('==================================================\n');

  const userA = { _id: '66d0a1b2c3d4e5f6a7b00001', name: 'User A', email: 'userA@example.com' };
  const userB = { _id: '66d0a1b2c3d4e5f6a7b00002', name: 'User B', email: 'userB@example.com' };

  let quizA_Id = null;
  let quizB_Id = null;

  // TEST GROUP 1: CREATE QUIZ (POST /api/quizzes)
  console.log('[TEST GROUP 1] POST /api/quizzes (Create Quiz & Ownership Assignment)');
  {
    const reqA = {
      user: userA,
      body: {
        title: 'DBMS Fundamentals Quiz',
        subject: 'Database Management Systems',
        topic: 'SQL',
        difficulty: 'Intermediate',
        type: 'Multiple Choice',
        questions: [
          {
            id: 'q1',
            question: 'What does SQL stand for?',
            options: [
              'Structured Query Language',
              'Simple Query Language',
              'System Query Language',
              'Sequential Query Language'
            ],
            correctAnswer: 'Structured Query Language',
            correctIndex: 0,
            explanation: 'SQL stands for Structured Query Language.',
            points: 1,
          },
          {
            id: 'q2',
            question: 'Which clause is used to filter records in SQL?',
            options: ['GROUP BY', 'WHERE', 'ORDER BY', 'HAVING'],
            correctAnswer: 'WHERE',
            correctIndex: 1,
            explanation: 'WHERE clause filters rows based on conditions.',
            points: 1,
          }
        ],
        // Malicious attempt to assign ownership to User B
        userId: userB._id,
        user: userB._id,
      }
    };

    const resA = createMockRes();
    await createQuiz(reqA, resA);

    assert(resA.statusCode === 201, 'User A create quiz returns 201 Created');
    assert(resA.data.success === true, 'Response contains success: true');
    assert(resA.data.quiz.title === 'DBMS Fundamentals Quiz', 'Quiz title stored correctly');
    assert(resA.data.quiz.questions.length === 2, 'Quiz questions stored');
    quizA_Id = resA.data.quiz.id;

    const savedA = mockQuizzes.get(quizA_Id);
    assert(savedA.user.toString() === userA._id, 'SECURITY: Quiz ownership strictly bound to req.user._id (User A)');

    // User B creates Quiz B
    const reqB = {
      user: userB,
      body: {
        title: 'Java Basics Quiz',
        subject: 'Java',
        topic: 'OOP',
        questions: [
          {
            id: 'qb1',
            question: 'Which keyword is used for inheritance in Java?',
            options: ['implements', 'extends', 'inherits', 'super'],
            correctAnswer: 'extends',
            correctIndex: 1,
          }
        ]
      }
    };
    const resB = createMockRes();
    await createQuiz(reqB, resB);
    assert(resB.statusCode === 201, 'User B create quiz returns 201 Created');
    quizB_Id = resB.data.quiz.id;
  }

  // TEST GROUP 2: ANSWER HIDING FOR TEST-TAKING (GET /api/quizzes/:id)
  console.log('\n[TEST GROUP 2] GET /api/quizzes/:id (Security: Answer Key Sanitization)');
  {
    // Fetch Quiz A for test taking
    const reqA_Take = { user: userA, params: { id: quizA_Id }, query: {} };
    const resA_Take = createMockRes();
    await getQuizById(reqA_Take, resA_Take);

    assert(resA_Take.statusCode === 200, 'User A GET quiz returns 200 OK');
    const takeQ1 = resA_Take.data.quiz.questions[0];
    assert(takeQ1.correctAnswer === undefined, 'SECURITY: correctAnswer is NOT exposed to client for taking');
    assert(takeQ1.correctIndex === undefined, 'SECURITY: correctIndex is NOT exposed to client for taking');
    assert(takeQ1.question === 'What does SQL stand for?', 'Question prompt is returned');
    assert(takeQ1.options.length === 4, 'Answer options are returned');

    // Fetch Quiz A with forReview=true (for owner review after completion)
    const reqA_Review = { user: userA, params: { id: quizA_Id }, query: { forReview: 'true' } };
    const resA_Review = createMockRes();
    await getQuizById(reqA_Review, resA_Review);

    assert(resA_Review.statusCode === 200, 'User A GET forReview=true returns 200 OK');
    assert(resA_Review.data.quiz.questions[0].correctAnswer === 'Structured Query Language', 'Owner review includes correctAnswer key');
  }

  // TEST GROUP 3: SERVER-SIDE QUIZ EVALUATION & SCORING (POST /api/quizzes/:id/submit)
  console.log('\n[TEST GROUP 3] POST /api/quizzes/:id/submit (Server-Side Evaluation & Scoring)');
  {
    // User A submits answers (1 correct, 1 incorrect)
    const reqSubmit = {
      user: userA,
      params: { id: quizA_Id },
      body: {
        answers: [
          { questionId: 'q1', selectedAnswer: '0' }, // Correct index 0
          { questionId: 'q2', selectedAnswer: '0' }, // Incorrect index 0 (correct is 1)
        ],
        timeTaken: 120, // 2 minutes
      }
    };
    const resSubmit = createMockRes();
    await submitQuiz(reqSubmit, resSubmit);

    assert(resSubmit.statusCode === 200, 'Quiz submission returns 200 OK');
    assert(resSubmit.data.success === true, 'Response contains success: true');
    assert(resSubmit.data.result.score === 1, 'Server calculated exactly 1 correct answer');
    assert(resSubmit.data.result.total === 2, 'Total questions count is 2');
    assert(resSubmit.data.result.percentage === 50, 'Percentage calculated correctly as 50%');
    assert(resSubmit.data.result.correctAnswers === 1, 'correctAnswers count is 1');
    assert(resSubmit.data.result.incorrectAnswers === 1, 'incorrectAnswers count is 1');
    assert(resSubmit.data.result.unanswered === 0, 'unanswered count is 0');
    assert(resSubmit.data.result.timeTaken === '02:00', 'timeTaken formatted as mm:ss');

    // Verify QuizAttempt record saved in DB
    const attempts = Array.from(mockAttempts.values());
    assert(attempts.length === 1, 'QuizAttempt document created in MongoDB');
    assert(attempts[0].user.toString() === userA._id, 'Attempt bound to User A');
    assert(attempts[0].score === 1, 'Attempt score saved as 1');
  }

  // TEST GROUP 4: USER DATA ISOLATION & FORBIDDEN ACCESS (403 Forbidden)
  console.log('\n[TEST GROUP 4] Multi-User Data Isolation & Forbidden Access (403)');
  {
    // 4a. User A lists quizzes
    const reqA_List = { user: userA, query: {} };
    const resA_List = createMockRes();
    await getQuizzes(reqA_List, resA_List);
    assert(resA_List.data.count === 1, 'User A receives only 1 quiz');
    assert(resA_List.data.quizzes[0].id === quizA_Id, 'User A sees only Quiz A');

    // 4b. User B attempts to view User A's Quiz A -> 403
    const reqB_Access = { user: userB, params: { id: quizA_Id }, query: {} };
    const resB_Access = createMockRes();
    await getQuizById(reqB_Access, resB_Access);
    assert(resB_Access.statusCode === 403, 'SECURITY: User B viewing User A\'s quiz rejected with 403 Forbidden');

    // 4c. User B attempts to submit User A's Quiz A -> 403
    const reqB_Submit = {
      user: userB,
      params: { id: quizA_Id },
      body: { answers: [{ questionId: 'q1', selectedAnswer: '0' }] }
    };
    const resB_Submit = createMockRes();
    await submitQuiz(reqB_Submit, resB_Submit);
    assert(resB_Submit.statusCode === 403, 'SECURITY: User B submitting User A\'s quiz rejected with 403 Forbidden');

    // 4d. User B attempts to delete User A's Quiz A -> 403
    const reqB_Delete = { user: userB, params: { id: quizA_Id } };
    const resB_Delete = createMockRes();
    await deleteQuiz(reqB_Delete, resB_Delete);
    assert(resB_Delete.statusCode === 403, 'SECURITY: User B deleting User A\'s quiz rejected with 403 Forbidden');
    assert(mockQuizzes.has(quizA_Id), 'Quiz A remains intact in DB');
  }

  // TEST GROUP 5: QUIZ ATTEMPT HISTORY (GET /api/quizzes/history)
  console.log('\n[TEST GROUP 5] GET /api/quizzes/history (Attempt History Isolation)');
  {
    // User A fetches attempt history
    const reqA_Hist = { user: userA };
    const resA_Hist = createMockRes();
    await getQuizHistory(reqA_Hist, resA_Hist);

    assert(resA_Hist.statusCode === 200, 'User A history returns 200 OK');
    assert(resA_Hist.data.count === 1, 'User A has 1 history record');
    assert(resA_Hist.data.history[0].title === 'DBMS Fundamentals Quiz', 'History populated with quiz title');

    // User B fetches attempt history
    const reqB_Hist = { user: userB };
    const resB_Hist = createMockRes();
    await getQuizHistory(reqB_Hist, resB_Hist);
    assert(resB_Hist.data.count === 0, 'User B has 0 history records (ISOLATION)');
  }

  // TEST GROUP 6: INPUT VALIDATION & NOT FOUND CHECKS (400 / 404)
  console.log('\n[TEST GROUP 6] Input Validation & Error Handling');
  {
    // Missing title & subject
    const reqEmpty = { user: userA, body: { questions: [{ question: 'Sample?' }] } };
    const resEmpty = createMockRes();
    await createQuiz(reqEmpty, resEmpty);
    assert(resEmpty.statusCode === 400, 'Missing title/subject returns 400 Bad Request');

    // Missing questions
    const reqNoQ = { user: userA, body: { title: 'Test', subject: 'Test', questions: [] } };
    const resNoQ = createMockRes();
    await createQuiz(reqNoQ, resNoQ);
    assert(resNoQ.statusCode === 400, 'Empty questions array returns 400 Bad Request');

    // Non-existent quiz ID
    const req404 = { user: userA, params: { id: '66d0a1b2c3d4e5f6a7b99999' }, query: {} };
    const res404 = createMockRes();
    await getQuizById(req404, res404);
    assert(res404.statusCode === 404, 'Non-existent quiz ID returns 404 Not Found');
  }

  // TEST GROUP 7: AUTHENTICATION MIDDLEWARE ENFORCEMENT
  console.log('\n[TEST GROUP 7] Auth Middleware Enforcement');
  {
    // No token
    const reqNoToken = { headers: {} };
    const resNoToken = createMockRes();
    let nextCalled = false;
    await protect(reqNoToken, resNoToken, () => { nextCalled = true; });
    assert(resNoToken.statusCode === 401, 'Missing JWT rejected with 401 Unauthorized');
    assert(!nextCalled, 'Next middleware is NOT called for missing token');

    // Valid JWT
    const token = jwt.sign({ userId: userA._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const reqGoodToken = { headers: { authorization: `Bearer ${token}` } };
    const resGoodToken = createMockRes();
    nextCalled = false;

    const origFind = User.findById;
    User.findById = async (id) => (id === userA._id ? userA : null);

    await protect(reqGoodToken, resGoodToken, () => { nextCalled = true; });
    assert(nextCalled === true, 'Valid JWT calls next()');
    assert(reqGoodToken.user && reqGoodToken.user._id === userA._id, 'Valid JWT attaches user to req.user');

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
