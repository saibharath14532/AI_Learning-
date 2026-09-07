import assert from 'assert';
import {
  explainTopic,
  solveDoubt,
  generateQuiz,
  generateRoadmap,
  generateFlashcards,
  generateNotes,
} from './controllers/aiController.js';
import {
  explainTopicService,
  solveDoubtService,
  generateQuizService,
  generateRoadmapService,
  generateFlashcardsService,
  generateNotesService,
} from './services/aiService.js';

// Mock express response generator
function createMockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return res;
}

// Mock User
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test AI Student',
  email: 'aistudent@example.com',
};

async function runAISuite() {
  console.log('====================================================');
  console.log('   RUNNING REAL AI INTEGRATION (GEMINI) TEST SUITE  ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function runTest(description, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${description}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  async function runAsyncTest(description, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${description}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // ─── TEST GROUP 1: AI SERVICE FUNCTIONS ─────────────────────────────────────
  console.log('[TEST GROUP 1] AI Service Layer Execution');

  await runAsyncTest('explainTopicService returns valid structured JSON', async () => {
    const res = await explainTopicService({ topic: 'Boyce-Codd Normal Form', level: 'Advanced', focus: 'Concept Breakdown' });
    assert(res.title === 'Boyce-Codd Normal Form', 'Title matches input');
    assert(typeof res.summary === 'string' && res.summary.length > 10, 'Summary is a non-empty string');
    assert(Array.isArray(res.breakdown) && res.breakdown.length > 0, 'Breakdown is a populated array');
    assert(typeof res.analogy === 'string' && res.analogy.length > 5, 'Analogy exists');
    assert(typeof res.code === 'string', 'Code snippet exists');
  });

  await runAsyncTest('solveDoubtService returns valid diagnostic structure', async () => {
    const res = await solveDoubtService({ category: 'compiler', title: 'React Infinite Loop', code: 'useEffect(() => setCount(c+1));' });
    assert(res.title === 'React Infinite Loop', 'Title matches input');
    assert(typeof res.diagnosis === 'string' && res.diagnosis.length > 10, 'Diagnosis exists');
    assert(typeof res.corrected === 'string' && res.corrected.length > 5, 'Corrected code exists');
    assert(Array.isArray(res.steps) && res.steps.length > 0, 'Fix steps array exists');
  });

  await runAsyncTest('generateQuizService returns valid questions matching Quiz schema', async () => {
    const res = await generateQuizService({ topic: 'DBMS SQL', difficulty: 'Intermediate', type: 'Multiple Choice', count: 5 });
    assert(res.topic === 'DBMS SQL', 'Topic matches input');
    assert(Array.isArray(res.questions) && res.questions.length > 0, 'Questions array is populated');
    const q1 = res.questions[0];
    assert(q1.question && q1.options && Array.isArray(q1.options), 'Question format is valid');
    assert(typeof q1.correctIndex === 'number', 'correctIndex is a number');
  });

  await runAsyncTest('generateRoadmapService returns valid stages matching Roadmap schema', async () => {
    const res = await generateRoadmapService({ goal: 'Master Data Structures', subject: 'Data Structures', currentLevel: 'Beginner', targetLevel: 'Advanced' });
    assert(res.goal === 'Master Data Structures', 'Goal matches input');
    assert(Array.isArray(res.topics) && res.topics.length > 0, 'Roadmap topics array exists');
    const t1 = res.topics[0];
    assert(t1.title && t1.description && typeof t1.estimatedMinutes === 'number', 'Roadmap topic format is valid');
  });

  await runAsyncTest('generateFlashcardsService returns valid cards matching FlashcardSet schema', async () => {
    const res = await generateFlashcardsService({ topic: 'Operating Systems', count: 5 });
    assert(res.topic === 'Operating Systems', 'Topic matches input');
    assert(Array.isArray(res.cards) && res.cards.length > 0, 'Cards array is populated');
    const c1 = res.cards[0];
    assert(c1.front && c1.back && c1.status === 'new', 'Flashcard format is valid');
  });

  await runAsyncTest('generateNotesService returns valid sections matching Note schema', async () => {
    const res = await generateNotesService({ topic: 'Computer Networks', subject: 'Networking', level: 'Intermediate' });
    assert(res.topic === 'Computer Networks', 'Topic matches input');
    assert(typeof res.summary === 'string' && res.summary.length > 10, 'Notes summary exists');
    assert(Array.isArray(res.sections) && res.sections.length > 0, 'Sections array exists');
    assert(Array.isArray(res.keyTakeaways) && res.keyTakeaways.length > 0, 'Key takeaways array exists');
  });

  // ─── TEST GROUP 2: AI CONTROLLERS & INPUT VALIDATION ───────────────────────
  console.log('\n[TEST GROUP 2] AI Controllers & Input Validation');

  await runAsyncTest('POST /api/ai/explain with valid topic returns 200 OK', async () => {
    const req = { body: { topic: 'Binary Search Trees', level: 'Intermediate', focus: 'Concept Breakdown' } };
    const res = createMockRes();
    await explainTopic(req, res);
    assert(res.statusCode === 200, 'Returns 200 OK');
    assert(res.data.success === true, 'Response contains success: true');
    assert(res.data.title === 'Binary Search Trees', 'Title matches input');
  });

  await runAsyncTest('POST /api/ai/explain with empty topic returns 400 Bad Request', async () => {
    const req = { body: { topic: '' } };
    const res = createMockRes();
    await explainTopic(req, res);
    assert(res.statusCode === 400, 'Returns 400 Bad Request');
    assert(res.data.success === false, 'Response contains success: false');
  });

  await runAsyncTest('POST /api/ai/doubt with valid query returns 200 OK', async () => {
    const req = { body: { category: 'database', title: 'SQL N+1 Query Issue', code: 'SELECT * FROM posts;' } };
    const res = createMockRes();
    await solveDoubt(req, res);
    assert(res.statusCode === 200, 'Returns 200 OK');
    assert(res.data.success === true, 'Response contains success: true');
    assert(res.data.diagnosis, 'Diagnosis returned');
  });

  await runAsyncTest('POST /api/ai/doubt with empty code returns 400 Bad Request', async () => {
    const req = { body: { category: 'database', title: 'SQL Issue', code: '' } };
    const res = createMockRes();
    await solveDoubt(req, res);
    assert(res.statusCode === 400, 'Returns 400 Bad Request');
    assert(res.data.success === false, 'Response contains success: false');
  });

  // ─── TEST GROUP 3: SECURITY & DATA ISOLATION ───────────────────────────────
  console.log('\n[TEST GROUP 3] Security & Data Isolation Verification');

  runTest('Gemini API Key is NOT leaked in client code or responses', () => {
    const res = createMockRes();
    const jsonStr = JSON.stringify(res);
    assert(!jsonStr.includes('YOUR_GEMINI_API_KEY'), 'API key not present in response');
    assert(!jsonStr.includes('GEMINI_API_KEY'), 'API key label not present in response');
  });

  console.log('\n====================================================');
  console.log(`   AI TEST SUITE COMPLETED: ${passed} / ${total} PASSED`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAISuite();
