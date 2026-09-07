import {
  createFlashcardSet,
  getFlashcardSets,
  getFlashcardSetById,
  updateFlashcardSet,
  deleteFlashcardSet,
  updateCardProgress,
} from './controllers/flashcardController.js';
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
const mockFlashcardSets = new Map();

function generateObjectId(prefix = '66d0a1b2c3d4e5f6a7b0') {
  return `${prefix}${Math.floor(Math.random() * 8999 + 1000)}`;
}

// Mock FlashcardSet Document Factory
function createMockFlashcardSetDoc(data) {
  const _id = data._id || generateObjectId('66d0a1b2c3d4e5f6a7b3');
  const cards = (data.cards || []).map((c, idx) => ({
    id: c.id || `card_${idx + 1}`,
    question: c.question || c.front || '',
    front: c.front || c.question || '',
    answer: c.answer || c.back || '',
    back: c.back || c.answer || '',
    explanation: c.explanation || '',
    difficulty: c.difficulty || 'Intermediate',
    order: c.order || (idx + 1),
    status: c.status || (c.known ? 'known' : 'unknown'),
    known: c.status === 'known' || Boolean(c.known),
  }));

  const totalCards = cards.length;
  const masteredCards = cards.filter(c => c.status === 'known' || c.known).length;
  const progress = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  const status = progress === 100 ? 'completed' : 'active';

  const doc = {
    _id,
    user: data.user,
    roadmap: data.roadmap || null,
    title: data.title || data.topic,
    subject: data.subject || data.topic,
    topic: data.topic,
    difficulty: data.difficulty || 'Intermediate',
    description: data.description || '',
    cards,
    totalCards,
    masteredCards,
    progress,
    status,
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
      if (Array.isArray(this.cards)) {
        this.totalCards = this.cards.length;
        this.masteredCards = this.cards.filter(c => c.status === 'known' || c.known).length;
        this.progress = this.totalCards > 0 ? Math.round((this.masteredCards / this.totalCards) * 100) : 0;
        this.status = this.progress === 100 ? 'completed' : 'active';
      }
      mockFlashcardSets.set(this._id.toString(), this);
      return this;
    }
  };

  mockFlashcardSets.set(_id.toString(), doc);
  return doc;
}

// Stub Mongoose Models
import FlashcardSet from './models/FlashcardSet.js';
import Roadmap from './models/Roadmap.js';

FlashcardSet.create = async (payload) => createMockFlashcardSetDoc(payload);
FlashcardSet.find = (query) => {
  let list = Array.from(mockFlashcardSets.values());
  if (query.user) {
    list = list.filter(s => s.user.toString() === query.user.toString());
  }
  return {
    sort() {
      return list;
    }
  };
};

FlashcardSet.findById = async (id) => mockFlashcardSets.get(id.toString()) || null;
FlashcardSet.findByIdAndDelete = async (id) => {
  const ex = mockFlashcardSets.get(id.toString());
  if (ex) mockFlashcardSets.delete(id.toString());
  return ex;
};

Roadmap.findById = async () => null;

async function runSuite() {
  console.log('\n==================================================');
  console.log('RUNNING FLASHCARDS API & SERVER PROGRESS TESTS');
  console.log('==================================================\n');

  const userA = { _id: '66d0a1b2c3d4e5f6a7b00001', name: 'User A', email: 'userA@example.com' };
  const userB = { _id: '66d0a1b2c3d4e5f6a7b00002', name: 'User B', email: 'userB@example.com' };

  let setA_Id = null;

  // TEST GROUP 1: CREATE FLASHCARD SET (POST /api/flashcards)
  console.log('[TEST GROUP 1] POST /api/flashcards (Create Set & Ownership Assignment)');
  {
    const reqA = {
      user: userA,
      body: {
        title: 'React Hooks Revision',
        subject: 'React',
        topic: 'React Hooks',
        difficulty: 'Intermediate',
        description: 'Key React Hooks flashcards',
        cards: [
          {
            id: 'card_1',
            question: 'What does useState do?',
            answer: 'Declares state variables in functional components.',
            difficulty: 'Easy',
            status: 'unknown',
          },
          {
            id: 'card_2',
            question: 'What is useEffect used for?',
            answer: 'Handles side effects like data fetching and subscriptions.',
            difficulty: 'Intermediate',
            status: 'unknown',
          }
        ],
        // Malicious attempt to assign ownership to User B
        userId: userB._id,
        user: userB._id,
      }
    };

    const resA = createMockRes();
    await createFlashcardSet(reqA, resA);

    assert(resA.statusCode === 201, 'User A create flashcard set returns 201 Created');
    assert(resA.data.success === true, 'Response contains success: true');
    assert(resA.data.flashcardSet.topic === 'React Hooks', 'Topic stored correctly');
    assert(resA.data.flashcardSet.cards.length === 2, '2 cards stored');
    assert(resA.data.flashcardSet.totalCards === 2, 'totalCards is 2');
    assert(resA.data.flashcardSet.masteredCards === 0, 'masteredCards initially 0');
    assert(resA.data.flashcardSet.progress === 0, 'progress initially 0%');
    setA_Id = resA.data.flashcardSet.id;

    const savedA = mockFlashcardSets.get(setA_Id);
    assert(savedA.user.toString() === userA._id, 'SECURITY: Ownership assigned strictly to req.user._id (User A)');

    // User B creates Set B
    const reqB = {
      user: userB,
      body: {
        topic: 'SQL Joins',
        cards: [
          { question: 'What is INNER JOIN?', answer: 'Returns records that have matching values in both tables.' }
        ]
      }
    };
    const resB = createMockRes();
    await createFlashcardSet(reqB, resB);
    assert(resB.statusCode === 201, 'User B create flashcard set returns 201 Created');
  }

  // TEST GROUP 2: GET FLASHCARD SETS & MULTI-USER ISOLATION (GET /api/flashcards)
  console.log('\n[TEST GROUP 2] GET /api/flashcards (Data Isolation Between Users)');
  {
    const reqA = { user: userA, query: {} };
    const resA = createMockRes();
    await getFlashcardSets(reqA, resA);

    assert(resA.statusCode === 200, 'User A GET /api/flashcards returns 200 OK');
    assert(resA.data.count === 1, 'User A receives exactly 1 flashcard set');
    assert(resA.data.flashcardSets[0].id === setA_Id, 'User A receives only Set A');

    const reqB = { user: userB, query: {} };
    const resB = createMockRes();
    await getFlashcardSets(reqB, resB);
    assert(resB.data.count === 1, 'User B receives exactly 1 flashcard set');
    assert(resB.data.flashcardSets[0].id !== setA_Id, 'ISOLATION: User B CANNOT see User A\'s flashcard set');
  }

  // TEST GROUP 3: CARD PROGRESS UPDATE & SERVER RECALCULATION (PUT /api/flashcards/:id/progress)
  console.log('\n[TEST GROUP 3] PUT /api/flashcards/:id/progress (Server Progress Recalculation)');
  {
    // Update card_1 status to 'known' (Mastered)
    const reqProg = {
      user: userA,
      params: { id: setA_Id },
      body: { cardId: 'card_1', status: 'known' }
    };
    const resProg = createMockRes();
    await updateCardProgress(reqProg, resProg);

    assert(resProg.statusCode === 200, 'Update card progress returns 200 OK');
    assert(resProg.data.flashcardSet.masteredCards === 1, 'Server recalculated masteredCards to 1');
    assert(resProg.data.flashcardSet.progress === 50, 'Server recalculated progress to 50%');
    assert(resProg.data.flashcardSet.cards[0].status === 'known', 'Card 1 status updated to known');

    // Update card_2 status to 'known' -> 100% complete
    const reqProg2 = {
      user: userA,
      params: { id: setA_Id },
      body: { cardId: 'card_2', status: 'known' }
    };
    const resProg2 = createMockRes();
    await updateCardProgress(reqProg2, resProg2);

    assert(resProg2.statusCode === 200, 'Update second card returns 200 OK');
    assert(resProg2.data.flashcardSet.masteredCards === 2, 'Server recalculated masteredCards to 2');
    assert(resProg2.data.flashcardSet.progress === 100, 'Server recalculated progress to 100%');
    assert(resProg2.data.flashcardSet.status === 'completed', 'Server auto-updated set status to completed');
  }

  // TEST GROUP 4: FORBIDDEN ACCESS & CROSS-USER SECURITY (403 Forbidden)
  console.log('\n[TEST GROUP 4] Cross-User Security & Forbidden Access (403)');
  {
    // User B attempts to view User A's set -> 403
    const reqB_View = { user: userB, params: { id: setA_Id } };
    const resB_View = createMockRes();
    await getFlashcardSetById(reqB_View, resB_View);
    assert(resB_View.statusCode === 403, 'SECURITY: User B viewing User A\'s set rejected with 403 Forbidden');

    // User B attempts to update card progress on User A's set -> 403
    const reqB_Prog = { user: userB, params: { id: setA_Id }, body: { cardId: 'card_1', status: 'unknown' } };
    const resB_Prog = createMockRes();
    await updateCardProgress(reqB_Prog, resB_Prog);
    assert(resB_Prog.statusCode === 403, 'SECURITY: User B updating card progress on User A\'s set rejected with 403 Forbidden');

    // User B attempts to delete User A's set -> 403
    const reqB_Del = { user: userB, params: { id: setA_Id } };
    const resB_Del = createMockRes();
    await deleteFlashcardSet(reqB_Del, resB_Del);
    assert(resB_Del.statusCode === 403, 'SECURITY: User B deleting User A\'s set rejected with 403 Forbidden');
    assert(mockFlashcardSets.has(setA_Id), 'Set A remains in DB');
  }

  // TEST GROUP 5: DELETE FLASHCARD SET
  console.log('\n[TEST GROUP 5] DELETE /api/flashcards/:id (Delete Set)');
  {
    const reqA_Del = { user: userA, params: { id: setA_Id } };
    const resA_Del = createMockRes();
    await deleteFlashcardSet(reqA_Del, resA_Del);
    assert(resA_Del.statusCode === 200, 'User A deleting own set returns 200 OK');
    assert(!mockFlashcardSets.has(setA_Id), 'Set A is removed from DB');
  }

  // TEST GROUP 6: INPUT VALIDATION (400 Bad Request)
  console.log('\n[TEST GROUP 6] Input Validation Checks');
  {
    // Missing topic
    const reqNoTopic = { user: userA, body: { cards: [{ question: 'Q?', answer: 'A' }] } };
    const resNoTopic = createMockRes();
    await createFlashcardSet(reqNoTopic, resNoTopic);
    assert(resNoTopic.statusCode === 400, 'Missing topic rejected with 400 Bad Request');

    // Empty cards
    const reqEmptyCards = { user: userA, body: { topic: 'React', cards: [] } };
    const resEmptyCards = createMockRes();
    await createFlashcardSet(reqEmptyCards, resEmptyCards);
    assert(resEmptyCards.statusCode === 400, 'Empty cards array rejected with 400 Bad Request');

    // Empty answer
    const reqBadCard = { user: userA, body: { topic: 'React', cards: [{ question: 'Q?', answer: '' }] } };
    const resBadCard = createMockRes();
    await createFlashcardSet(reqBadCard, resBadCard);
    assert(resBadCard.statusCode === 400, 'Card with empty answer rejected with 400 Bad Request');
  }

  // TEST GROUP 7: AUTHENTICATION ENFORCEMENT
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
