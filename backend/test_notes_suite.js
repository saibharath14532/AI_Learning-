import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  toggleFavorite,
} from './controllers/noteController.js';
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
const mockNotes = new Map();

function generateObjectId(prefix = '66d0a1b2c3d4e5f6a7b0') {
  return `${prefix}${Math.floor(Math.random() * 8999 + 1000)}`;
}

// Mock Note Document Factory
function createMockNoteDoc(data) {
  const _id = data._id || generateObjectId('66d0a1b2c3d4e5f6a7b4');

  const doc = {
    _id,
    user: data.user,
    roadmap: data.roadmap || null,
    title: data.title || data.topic,
    subject: data.subject || data.topic,
    topic: data.topic,
    type: data.type || 'Detailed Notes',
    difficulty: data.difficulty || 'Intermediate',
    length: data.length || 'Medium',
    learningGoal: data.learningGoal || '',
    overview: data.overview || '',
    sections: data.sections || [],
    keyTakeaways: data.keyTakeaways || [],
    importantTerms: data.importantTerms || [],
    quickRevision: data.quickRevision || '',
    content: data.content || '',
    summary: data.summary || '',
    tags: data.tags || [],
    sourceType: data.sourceType || 'manual',
    isFavorite: Boolean(data.isFavorite),
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
      obj.savedAt = obj.updatedAt || obj.createdAt;
      return obj;
    },
    async save() {
      this.updatedAt = new Date();
      mockNotes.set(this._id.toString(), this);
      return this;
    }
  };

  mockNotes.set(_id.toString(), doc);
  return doc;
}

// Stub Mongoose Models
import Note from './models/Note.js';
import Roadmap from './models/Roadmap.js';

Note.create = async (payload) => createMockNoteDoc(payload);
Note.find = (query) => {
  let list = Array.from(mockNotes.values());

  if (query.user) {
    list = list.filter(n => n.user.toString() === query.user.toString());
  }

  if (query.isFavorite !== undefined) {
    list = list.filter(n => n.isFavorite === query.isFavorite);
  }

  if (query.$or) {
    list = list.filter(n => {
      return query.$or.some(condition => {
        const field = Object.keys(condition)[0];
        const regex = condition[field];
        const val = n[field];
        if (!val) return false;
        return regex.test(String(val));
      });
    });
  }

  return {
    sort() {
      return list;
    }
  };
};

Note.findById = async (id) => mockNotes.get(id.toString()) || null;
Note.findByIdAndDelete = async (id) => {
  const ex = mockNotes.get(id.toString());
  if (ex) mockNotes.delete(id.toString());
  return ex;
};

Roadmap.findById = async () => null;

async function runSuite() {
  console.log('\n==================================================');
  console.log('RUNNING NOTES API, SEARCH & SECURITY TESTS');
  console.log('==================================================\n');

  const userA = { _id: '66d0a1b2c3d4e5f6a7b00001', name: 'User A', email: 'userA@example.com' };
  const userB = { _id: '66d0a1b2c3d4e5f6a7b00002', name: 'User B', email: 'userB@example.com' };

  let noteA_Id = null;

  // TEST GROUP 1: CREATE NOTE (POST /api/notes)
  console.log('[TEST GROUP 1] POST /api/notes (Create Note & Ownership Assignment)');
  {
    const reqA = {
      user: userA,
      body: {
        title: 'DBMS Normalization Notes',
        subject: 'Database Management Systems',
        topic: 'Normalization',
        type: 'Detailed Notes',
        difficulty: 'Intermediate',
        overview: 'Comprehensive guide to 1NF, 2NF, 3NF and BCNF.',
        sections: [
          {
            heading: '1NF - First Normal Form',
            explanation: 'Eliminates duplicate columns and atomic attributes.',
            importantPoints: ['All fields must contain atomic values.'],
          }
        ],
        keyTakeaways: ['Normalization reduces data redundancy.'],
        tags: ['DBMS', 'Database', 'Normalization'],
        // Malicious attempt to assign ownership to User B
        userId: userB._id,
        user: userB._id,
      }
    };

    const resA = createMockRes();
    await createNote(reqA, resA);

    assert(resA.statusCode === 201, 'User A create note returns 201 Created');
    assert(resA.data.success === true, 'Response contains success: true');
    assert(resA.data.note.title === 'DBMS Normalization Notes', 'Title stored correctly');
    assert(resA.data.note.sections.length === 1, '1 section stored');
    noteA_Id = resA.data.note.id;

    const savedA = mockNotes.get(noteA_Id);
    assert(savedA.user.toString() === userA._id, 'SECURITY: Ownership bound strictly to req.user._id (User A)');

    // User B creates Note B
    const reqB = {
      user: userB,
      body: {
        title: 'Java Multithreading Guide',
        subject: 'Java',
        topic: 'Multithreading',
        overview: 'Overview of ExecutorService and synchronized keywords.'
      }
    };
    const resB = createMockRes();
    await createNote(reqB, resB);
    assert(resB.statusCode === 201, 'User B create note returns 201 Created');
  }

  // TEST GROUP 2: GET NOTES & MULTI-USER ISOLATION (GET /api/notes)
  console.log('\n[TEST GROUP 2] GET /api/notes (Data Isolation & Search Filter)');
  {
    // User A fetches notes
    const reqA = { user: userA, query: {} };
    const resA = createMockRes();
    await getNotes(reqA, resA);

    assert(resA.statusCode === 200, 'User A GET /api/notes returns 200 OK');
    assert(resA.data.count === 1, 'User A receives exactly 1 note');
    assert(resA.data.notes[0].id === noteA_Id, 'User A receives only Note A');

    // User B fetches notes
    const reqB = { user: userB, query: {} };
    const resB = createMockRes();
    await getNotes(reqB, resB);
    assert(resB.data.count === 1, 'User B receives exactly 1 note');
    assert(resB.data.notes[0].id !== noteA_Id, 'ISOLATION: User B CANNOT see User A\'s note');

    // Search filter test
    const reqSearch = { user: userA, query: { search: 'Normalization' } };
    const resSearch = createMockRes();
    await getNotes(reqSearch, resSearch);
    assert(resSearch.data.count === 1, 'Search query "Normalization" finds Note A');

    const reqSearchMiss = { user: userA, query: { search: 'Multithreading' } };
    const resSearchMiss = createMockRes();
    await getNotes(reqSearchMiss, resSearchMiss);
    assert(resSearchMiss.data.count === 0, 'Search for User B topic returns 0 results for User A');
  }

  // TEST GROUP 3: TOGGLE FAVORITE (PUT /api/notes/:id/favorite)
  console.log('\n[TEST GROUP 3] PUT /api/notes/:id/favorite (Toggle Favorite)');
  {
    const reqFav = { user: userA, params: { id: noteA_Id } };
    const resFav = createMockRes();
    await toggleFavorite(reqFav, resFav);

    assert(resFav.statusCode === 200, 'Toggle favorite returns 200 OK');
    assert(resFav.data.note.isFavorite === true, 'isFavorite toggled to true');

    const savedA = mockNotes.get(noteA_Id);
    assert(savedA.isFavorite === true, 'isFavorite persisted in DB');
  }

  // TEST GROUP 4: FORBIDDEN ACCESS & CROSS-USER SECURITY (403 Forbidden)
  console.log('\n[TEST GROUP 4] Cross-User Security & Forbidden Access (403)');
  {
    // User B attempts to view User A's note -> 403
    const reqB_View = { user: userB, params: { id: noteA_Id } };
    const resB_View = createMockRes();
    await getNoteById(reqB_View, resB_View);
    assert(resB_View.statusCode === 403, 'SECURITY: User B viewing User A\'s note rejected with 403 Forbidden');

    // User B attempts to update User A's note -> 403
    const reqB_Upd = { user: userB, params: { id: noteA_Id }, body: { title: 'Hacked Title' } };
    const resB_Upd = createMockRes();
    await updateNote(reqB_Upd, resB_Upd);
    assert(resB_Upd.statusCode === 403, 'SECURITY: User B updating User A\'s note rejected with 403 Forbidden');

    // User B attempts to toggle favorite on User A's note -> 403
    const reqB_Fav = { user: userB, params: { id: noteA_Id } };
    const resB_Fav = createMockRes();
    await toggleFavorite(reqB_Fav, resB_Fav);
    assert(resB_Fav.statusCode === 403, 'SECURITY: User B toggling favorite on User A\'s note rejected with 403 Forbidden');

    // User B attempts to delete User A's note -> 403
    const reqB_Del = { user: userB, params: { id: noteA_Id } };
    const resB_Del = createMockRes();
    await deleteNote(reqB_Del, resB_Del);
    assert(resB_Del.statusCode === 403, 'SECURITY: User B deleting User A\'s note rejected with 403 Forbidden');
    assert(mockNotes.has(noteA_Id), 'Note A remains intact in DB');
  }

  // TEST GROUP 5: DELETE NOTE
  console.log('\n[TEST GROUP 5] DELETE /api/notes/:id (Delete Note)');
  {
    const reqA_Del = { user: userA, params: { id: noteA_Id } };
    const resA_Del = createMockRes();
    await deleteNote(reqA_Del, resA_Del);
    assert(resA_Del.statusCode === 200, 'User A deleting own note returns 200 OK');
    assert(!mockNotes.has(noteA_Id), 'Note A is removed from DB');
  }

  // TEST GROUP 6: INPUT VALIDATION (400 Bad Request)
  console.log('\n[TEST GROUP 6] Input Validation Checks');
  {
    const reqNoTopic = { user: userA, body: { overview: 'No title or topic' } };
    const resNoTopic = createMockRes();
    await createNote(reqNoTopic, resNoTopic);
    assert(resNoTopic.statusCode === 400, 'Missing title/topic rejected with 400 Bad Request');
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
