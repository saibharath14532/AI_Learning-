// ─── Mock Data ─────────────────────────────────────────────────────────────
// All realistic mock data for the AI-Powered Learning Platform.
// Replace these with real API calls when backend is ready.

// ─── Student / User ──────────────────────────────────────────────────────────
export const mockUser = {
  id: 'user_001',
  name: 'Arjun Sharma',
  firstName: 'Arjun',
  email: 'arjun.sharma@example.com',
  avatar: null, // will use initials
  initials: 'AS',
  level: 'Intermediate',
  joinedDate: '2024-08-01',
  bio: 'MCA student passionate about AI and software development.',
  college: 'MIT College of Engineering',
  semester: '5th Semester',
  notifications: 3,
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export const mockStats = {
  learningProgress: 72,
  currentStreak: 7,
  quizAverage: 84,
  topicsCompleted: 24,
  totalStudyHours: 48.5,
  weeklyGoalMinutes: 60,
  todayStudiedMinutes: 45,
  monthStudyDays: 19,
  longestStreak: 14,
};

// ─── Weekly Analytics ────────────────────────────────────────────────────────
export const mockWeeklyData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  studyHours: [1.5, 2.0, 0.5, 2.5, 1.0, 0.5, 0.5],
  totalWeek: 8.5,
};

// ─── Recent Activity ─────────────────────────────────────────────────────────
export const mockRecentActivity = [
  {
    id: 'act_1',
    type: 'quiz',
    icon: 'brain',
    title: 'Completed Quiz',
    description: 'Data Structures — Binary Trees',
    score: '8/10',
    time: '2 hours ago',
    color: 'indigo',
  },
  {
    id: 'act_2',
    type: 'notes',
    icon: 'file-text',
    title: 'Generated Notes',
    description: 'Operating Systems — Process Scheduling',
    time: '5 hours ago',
    color: 'violet',
  },
  {
    id: 'act_3',
    type: 'topic',
    icon: 'book-open',
    title: 'Studied Topic',
    description: 'Dynamic Programming — Concepts & Patterns',
    time: 'Yesterday, 9:30 PM',
    color: 'blue',
  },
  {
    id: 'act_4',
    type: 'flashcards',
    icon: 'layers',
    title: 'Created Flashcards',
    description: 'OOP Concepts — 20 cards',
    time: 'Yesterday, 6:00 PM',
    color: 'purple',
  },
  {
    id: 'act_5',
    type: 'roadmap',
    icon: 'map',
    title: 'Completed Roadmap Phase',
    description: 'Full Stack Dev — Month 1: HTML/CSS',
    time: '2 days ago',
    color: 'green',
  },
];

// ─── Recommended Topics ──────────────────────────────────────────────────────
export const mockRecommendedTopics = [
  {
    id: 'topic_1',
    title: 'Binary Trees',
    difficulty: 'Intermediate',
    estimatedTime: '45 min',
    reason: 'You scored 60% on related quiz',
    category: 'Data Structures',
    color: 'indigo',
    progress: 0,
  },
  {
    id: 'topic_2',
    title: 'Dynamic Programming',
    difficulty: 'Advanced',
    estimatedTime: '90 min',
    reason: 'Next topic in your DSA roadmap',
    category: 'Algorithms',
    color: 'violet',
    progress: 0,
  },
  {
    id: 'topic_3',
    title: 'Graph Algorithms',
    difficulty: 'Advanced',
    estimatedTime: '60 min',
    reason: 'Frequently asked in interviews',
    category: 'Algorithms',
    color: 'blue',
    progress: 0,
  },
];

// ─── Quiz Questions ───────────────────────────────────────────────────────────
export const mockQuizQuestions = [
  {
    id: 'q1',
    question: 'What is polymorphism in Object-Oriented Programming?',
    options: [
      'The ability of an object to take many forms',
      'A method to define multiple classes',
      'A way to inherit from multiple classes',
      'A technique for memory management',
    ],
    correctIndex: 0,
    explanation: 'Polymorphism allows objects of different classes to be treated as objects of a common base class, enabling a single interface to represent different underlying forms (data types).',
    topic: 'OOP',
  },
  {
    id: 'q2',
    question: 'Which data structure uses LIFO (Last In First Out) ordering?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
    correctIndex: 1,
    explanation: 'A Stack follows Last In First Out (LIFO) principle — the last element added is the first one to be removed, like a stack of plates.',
    topic: 'Data Structures',
  },
  {
    id: 'q3',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'],
    correctIndex: 2,
    explanation: 'Binary search has O(log n) time complexity because it halves the search space with each comparison.',
    topic: 'Algorithms',
  },
  {
    id: 'q4',
    question: 'In a binary tree, what is the maximum number of nodes at level k?',
    options: ['2^k', '2^(k-1)', 'k²', '2k'],
    correctIndex: 0,
    explanation: 'At level k of a binary tree (root at level 0), the maximum number of nodes is 2^k.',
    topic: 'Data Structures',
  },
  {
    id: 'q5',
    question: 'Which sorting algorithm has the best average case complexity?',
    options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
    correctIndex: 2,
    explanation: 'Merge Sort has O(n log n) average and worst case complexity, making it one of the most efficient general-purpose sorting algorithms.',
    topic: 'Algorithms',
  },
  {
    id: 'q6',
    question: 'What does SOLID stand for in software design?',
    options: [
      'Single, Open, Liskov, Interface, Dependency',
      'Simple, Object, Logic, Interface, Design',
      'System, Object, Linked, Interface, Dependency',
      'Single, Ordered, Linked, Integrated, Dependency',
    ],
    correctIndex: 0,
    explanation: 'SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion principles.',
    topic: 'Software Design',
  },
  {
    id: 'q7',
    question: 'Which HTTP method is idempotent?',
    options: ['POST', 'GET', 'PATCH', 'Both GET and PUT'],
    correctIndex: 3,
    explanation: 'Both GET and PUT are idempotent — making the same request multiple times produces the same result. POST is not idempotent.',
    topic: 'Web Concepts',
  },
  {
    id: 'q8',
    question: 'What is a closure in JavaScript?',
    options: [
      'A function that closes the browser',
      'A function with access to its outer scope variables',
      'A method for closing database connections',
      'A way to end a loop',
    ],
    correctIndex: 1,
    explanation: 'A closure is a function that retains access to variables from its outer lexical scope even after the outer function has finished executing.',
    topic: 'JavaScript',
  },
  {
    id: 'q9',
    question: 'What is the purpose of the "this" keyword in JavaScript?',
    options: [
      'References the global object always',
      'References the current HTML element',
      'References the execution context object',
      'References the previous function called',
    ],
    correctIndex: 2,
    explanation: '"this" refers to the current execution context — its value depends on how a function is called (method, constructor, arrow function, etc.).',
    topic: 'JavaScript',
  },
  {
    id: 'q10',
    question: 'Which design pattern defines a one-to-many dependency between objects?',
    options: ['Factory', 'Singleton', 'Observer', 'Decorator'],
    correctIndex: 2,
    explanation: 'The Observer pattern defines a one-to-many dependency — when one object (subject) changes state, all its dependents (observers) are notified automatically.',
    topic: 'Design Patterns',
  },
];

// Helper to generate a customizable mock quiz based on topic, difficulty, type, and count.
export function generateMockQuiz(topic, difficulty, type, count, _goal = 'Practice') {
  const targetTopic = topic ? topic.trim() : 'General';
  const targetDifficulty = difficulty || 'Intermediate';
  const targetType = type || 'Multiple Choice';
  const targetCount = parseInt(count, 10) || 10;

  const normalizedTopic = targetTopic.toLowerCase();
  let matchingQuestions = mockQuizQuestions.filter(q => 
    q.topic.toLowerCase().includes(normalizedTopic) ||
    normalizedTopic.includes(q.topic.toLowerCase())
  );

  const questionsList = [];
  
  matchingQuestions.forEach(q => {
    if (questionsList.length < targetCount) {
      if (targetType === 'True / False') {
        questionsList.push({
          id: `${q.id}_tf`,
          question: `Is it true that: ${q.question} (Correct answer: ${q.options[q.correctIndex]})`,
          options: ['True', 'False'],
          correctIndex: 0,
          explanation: q.explanation,
          topic: q.topic
        });
      } else if (targetType === 'Fill in the Blanks') {
        questionsList.push({
          id: `${q.id}_fib`,
          question: `Fill in the blank: The correct answer to '${q.question}' is ________.`,
          options: [],
          correctAnswer: q.options[q.correctIndex],
          explanation: q.explanation,
          topic: q.topic
        });
      } else {
        questionsList.push({
          id: q.id,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          topic: q.topic
        });
      }
    }
  });

  const fallbackTemplates = [
    {
      q: "Which of the following represents a core principle of {topic}?",
      options: ["The separation of concerns to maximize modularity and maintainability.", "Using global variables to share state across components.", "Executing all operations synchronously to avoid callback complexity.", "Bypassing compilation checks to speed up local deployment."],
      correctIndex: 0,
      explanation: "{topic} prioritizes modular separation of concerns, which enhances codebase readability and testing efficiency.",
      correctAnswer: "Separation of concerns"
    },
    {
      q: "In the context of {topic}, why is performance optimization critical?",
      options: ["To minimize latency and optimize resource/memory overhead.", "To ensure that code is always written in a single line.", "To force the browser to cache all assets locally.", "To prevent the user from refreshing their session."],
      correctIndex: 0,
      explanation: "Optimizing {topic} helps maintain a low memory footprint and prevents UI stuttering under heavy load.",
      correctAnswer: "Resource efficiency"
    },
    {
      q: "What is a major pitfall when designing or implementing {topic}?",
      options: ["Coupling business logic directly with interface elements, creating spaghetti dependencies.", "Using standard libraries instead of writing custom low-level functions.", "Leaving too many comments in the source code.", "Using semantic HTML elements instead of generic containers."],
      correctIndex: 0,
      explanation: "Tight coupling is a common anti-pattern in {topic} architecture that increases maintenance difficulty.",
      correctAnswer: "Tight coupling"
    },
    {
      q: "Under {difficulty} complexity of {topic}, how is state synchronization typically managed?",
      options: ["By leveraging unidirectional data flows and immutable records.", "By polling the central database every 50 milliseconds.", "By storing state variables in global window properties.", "By resetting the execution environment after every user action."],
      correctIndex: 0,
      explanation: "Immutable updates and clear state cycles prevent dirty reads and race conditions in {topic}.",
      correctAnswer: "Immutable state"
    },
    {
      q: "Which of the following is considered a best practice for {topic}?",
      options: ["Writing small, pure functions that do one thing and are easy to test.", "Packing all logic into a single monolithic script file.", "Disabling static type checking to increase coding speed.", "Writing code without unit tests to save development cycles."],
      correctIndex: 0,
      explanation: "Pure, single-responsibility functions are the cornerstone of stable software design in {topic}.",
      correctAnswer: "Pure functions"
    },
    {
      q: "What is the primary trade-off when adopting {topic} in an enterprise system?",
      options: ["Increased initial architectural planning vs. long-term code scalability and ease of updates.", "Higher hardware cost vs. slower build times.", "Forced usage of outdated compiler features.", "Lower security guarantees vs. slightly faster deployment speed."],
      correctIndex: 0,
      explanation: "While {topic} requires thorough upfront design, it greatly reduces regression rates as the project grows.",
      correctAnswer: "Design overhead vs scalability"
    },
    {
      q: "How does {topic} handle error recovery in standard production systems?",
      options: ["Using declarative error boundaries or catch blocks to handle exceptions gracefully without crashing.", "Automatically restarting the client machine.", "Ignoring errors and proceeding with stale data.", "Sending all raw stack traces directly to the end user in a browser dialog."],
      correctIndex: 0,
      explanation: "Graceful error isolation ensures high availability and keeps the user interface interactive.",
      correctAnswer: "Error boundaries"
    },
    {
      q: "What role does metadata play in the lifecycle of {topic}?",
      options: ["It provides configuration parameters that dictate runtime compiler behavior.", "It speeds up network data transfers by a factor of 10.", "It completely replaces standard variable declarations.", "It stores compiled binary objects inside browser memory."],
      correctIndex: 0,
      explanation: "Metadata describes the structural qualities of {topic}, allowing dynamic loading and execution configurations.",
      correctAnswer: "Configuration metadata"
    },
    {
      q: "Which of the following tools or methodologies is commonly used to inspect {topic} execution?",
      options: ["Static analysis linters, browser devtools, and dedicated profile visualizers.", "Standard text editors without compiler feedback.", "Relying purely on user bug reports.", "Writing code to paper and doing manual dry runs only."],
      correctIndex: 0,
      explanation: "Visual profilers and static analysis checks are key for diagnosing performance bottlenecks in {topic}.",
      correctAnswer: "Devtools and linters"
    },
    {
      q: "How does {topic} adapt to mobile viewports in a responsive design layout?",
      options: ["By using fluid grid structures, media queries, and responsive size scaling.", "By serving a completely separate website with limited features.", "By scaling down the entire desktop viewport using CSS zoom.", "By forcing the mobile device to render in landscape mode only."],
      correctIndex: 0,
      explanation: "Responsive layouts dynamically reposition elements using CSS grid, flexbox, and relative sizes to fit various screen sizes.",
      correctAnswer: "Fluid layout"
    }
  ];

  let templateIndex = 0;
  while (questionsList.length < targetCount) {
    const template = fallbackTemplates[templateIndex % fallbackTemplates.length];
    const questionId = `dynamic_q_${questionsList.length + 1}`;
    
    const questionText = template.q
      .replace(/{topic}/g, targetTopic)
      .replace(/{difficulty}/g, targetDifficulty);
    
    const explanationText = template.explanation
      .replace(/{topic}/g, targetTopic)
      .replace(/{difficulty}/g, targetDifficulty);

    const correctAnswerText = template.correctAnswer
      .replace(/{topic}/g, targetTopic)
      .replace(/{difficulty}/g, targetDifficulty);

    if (targetType === 'True / False') {
      const isTrue = questionsList.length % 2 === 0;
      questionsList.push({
        id: questionId,
        question: isTrue 
          ? `In ${targetTopic}, is it true that: ${correctAnswerText} is standard?`
          : `In ${targetTopic}, is it true that code should be packed into a single monolithic script file?`,
        options: ['True', 'False'],
        correctIndex: isTrue ? 0 : 1,
        explanation: isTrue ? explanationText : `Monolithic organization is an anti-pattern in ${targetTopic} that increases maintenance overhead.`,
        topic: targetTopic
      });
    } else if (targetType === 'Fill in the Blanks') {
      questionsList.push({
        id: questionId,
        question: `Fill in the blank: A core best practice in ${targetTopic} is writing ________ functions that are easy to test. (hint: pure)`,
        options: [],
        correctAnswer: "pure",
        explanation: explanationText,
        topic: targetTopic
      });
    } else {
      const correctIdx = (questionsList.length) % 4;
      const shuffledOptions = [...template.options];
      if (correctIdx !== 0) {
        const temp = shuffledOptions[0];
        shuffledOptions[0] = shuffledOptions[correctIdx];
        shuffledOptions[correctIdx] = temp;
      }
      
      questionsList.push({
        id: questionId,
        question: questionText,
        options: shuffledOptions.map(opt => opt.replace(/{topic}/g, targetTopic).replace(/{difficulty}/g, targetDifficulty)),
        correctIndex: correctIdx,
        explanation: explanationText,
        topic: targetTopic
      });
    }
    
    templateIndex++;
  }

  return {
    title: `${targetTopic} Quiz`,
    topic: targetTopic,
    difficulty: targetDifficulty,
    type: targetType,
    questions: questionsList
  };
}

// ─── Quiz Result ──────────────────────────────────────────────────────────────
export const mockQuizResult = {
  score: 8,
  total: 10,
  percentage: 80,
  timeTaken: '12:34',
  strongTopics: ['OOP', 'Data Structures', 'Algorithms'],
  weakTopics: ['Polymorphism', 'Design Patterns'],
  performanceByTopic: [
    { topic: 'OOP', correct: 2, total: 2 },
    { topic: 'Data Structures', correct: 2, total: 2 },
    { topic: 'Algorithms', correct: 2, total: 2 },
    { topic: 'JavaScript', correct: 1, total: 2 },
    { topic: 'Design Patterns', correct: 1, total: 2 },
  ],
};

// ─── Roadmap ──────────────────────────────────────────────────────────────────
export const mockRoadmap = {
  title: 'Full Stack Web Developer',
  totalMonths: 6,
  targetDate: '6 months',
  currentLevel: 'Beginner',
  hoursPerWeek: 10,
  phases: [
    {
      id: 'phase_1',
      month: 1,
      title: 'Foundations',
      topics: ['HTML5', 'CSS3', 'Flexbox & Grid', 'Responsive Design'],
      estimatedHours: 40,
      completedHours: 40,
      status: 'completed',
      description: 'Build a strong foundation in web structure and styling.',
    },
    {
      id: 'phase_2',
      month: 2,
      title: 'JavaScript Core',
      topics: ['ES6+', 'DOM Manipulation', 'Fetch API', 'Promises & Async'],
      estimatedHours: 45,
      completedHours: 32,
      status: 'in-progress',
      description: 'Master JavaScript fundamentals and browser APIs.',
    },
    {
      id: 'phase_3',
      month: 3,
      title: 'React.js',
      topics: ['Components', 'Hooks', 'State Management', 'React Router'],
      estimatedHours: 50,
      completedHours: 0,
      status: 'locked',
      description: 'Learn the most popular frontend framework.',
    },
    {
      id: 'phase_4',
      month: 4,
      title: 'Node.js & Express',
      topics: ['REST APIs', 'Middleware', 'Authentication', 'JWT'],
      estimatedHours: 45,
      completedHours: 0,
      status: 'locked',
      description: 'Build scalable server-side applications.',
    },
    {
      id: 'phase_5',
      month: 5,
      title: 'Databases',
      topics: ['MongoDB', 'Mongoose', 'SQL Basics', 'Database Design'],
      estimatedHours: 35,
      completedHours: 0,
      status: 'locked',
      description: 'Work with both SQL and NoSQL databases.',
    },
    {
      id: 'phase_6',
      month: 6,
      title: 'Projects & Deployment',
      topics: ['Full Stack Projects', 'Git & GitHub', 'Docker Basics', 'Cloud Deploy'],
      estimatedHours: 60,
      completedHours: 0,
      status: 'locked',
      description: 'Build real projects and deploy to production.',
    },
  ],
};

// ─── Flashcards ───────────────────────────────────────────────────────────────
export const mockFlashcards = [
  {
    id: 'fc_1',
    front: 'What is polymorphism?',
    back: 'The ability of an object to take many forms. A single interface can represent different underlying data types.',
    topic: 'OOP',
    status: 'unknown', // 'known' | 'review' | 'unknown'
  },
  {
    id: 'fc_2',
    front: 'What is encapsulation?',
    back: 'Bundling data (variables) and methods (functions) that operate on the data into a single unit (class), and restricting access to the internals.',
    topic: 'OOP',
    status: 'known',
  },
  {
    id: 'fc_3',
    front: 'What is inheritance?',
    back: 'A mechanism where a new class (child) derives properties and behaviors from an existing class (parent), enabling code reuse.',
    topic: 'OOP',
    status: 'review',
  },
  {
    id: 'fc_4',
    front: 'What is abstraction?',
    back: 'Hiding complex implementation details and showing only the essential features. Achieved via abstract classes and interfaces.',
    topic: 'OOP',
    status: 'unknown',
  },
  {
    id: 'fc_5',
    front: 'What is a stack?',
    back: 'A linear data structure following LIFO (Last In First Out). Operations: push (add), pop (remove), peek (view top).',
    topic: 'Data Structures',
    status: 'known',
  },
  {
    id: 'fc_6',
    front: 'What is a queue?',
    back: 'A linear data structure following FIFO (First In First Out). Operations: enqueue (add to rear), dequeue (remove from front).',
    topic: 'Data Structures',
    status: 'unknown',
  },
  {
    id: 'fc_7',
    front: 'What is a hash table?',
    back: 'A data structure mapping keys to values using a hash function. Average O(1) time complexity for search, insert, delete.',
    topic: 'Data Structures',
    status: 'review',
  },
  {
    id: 'fc_8',
    front: 'What is Big O notation?',
    back: 'Mathematical notation describing the upper bound (worst case) of an algorithm\'s time or space complexity as input size grows.',
    topic: 'Algorithms',
    status: 'known',
  },
  {
    id: 'fc_9',
    front: 'What is recursion?',
    back: 'A technique where a function calls itself with a simpler version of the problem until a base case is reached.',
    topic: 'Algorithms',
    status: 'known',
  },
  {
    id: 'fc_10',
    front: 'What is dynamic programming?',
    back: 'An optimization technique that solves complex problems by breaking them into overlapping subproblems and storing results (memoization/tabulation).',
    topic: 'Algorithms',
    status: 'unknown',
  },
];

// ─── Generated Notes ──────────────────────────────────────────────────────────
export const mockNotes = {
  topic: 'Data Structures — Binary Trees',
  type: 'Exam Revision',
  generatedAt: new Date().toLocaleDateString(),
  summary: 'A binary tree is a hierarchical data structure where each node has at most two children (left and right). It forms the foundation for many advanced data structures.',
  keyConcepts: [
    'Node structure: value, left pointer, right pointer',
    'Types: Full Binary Tree, Complete Binary Tree, BST, AVL Tree',
    'Height of tree: number of edges on longest root-to-leaf path',
    'Depth of node: number of edges from root to that node',
  ],
  importantPoints: [
    'Binary Search Tree property: left < node < right',
    'Inorder traversal of BST gives sorted sequence',
    'AVL Tree: self-balancing BST, |height difference| ≤ 1',
    'Maximum nodes at height h: 2^(h+1) - 1',
    'Minimum height for n nodes: ⌊log₂n⌋',
  ],
  examples: [
    {
      title: 'BST Insertion',
      code: 'insert(root, 5) → compare with root → go left/right → insert at null position',
    },
    {
      title: 'Inorder Traversal',
      code: 'inorder(node): inorder(left), visit(node), inorder(right)',
    },
  ],
  quickRevision: [
    'BST Search: O(log n) average, O(n) worst',
    'AVL ensures O(log n) always with rotations',
    'Heap is a complete binary tree (used in priority queues)',
    'DFS traversals: Preorder, Inorder, Postorder',
    'BFS traversal: Level-order using Queue',
  ],
};

// ─── Certificates ─────────────────────────────────────────────────────────────
export const mockCertificates = [
  {
    id: 'cert_001',
    studentName: 'Arjun Sharma',
    courseName: 'Data Structures & Algorithms',
    completionDate: 'August 2026',
    issueDate: '2026-08-15',
    certificateId: 'CERT-2026-00124',
    grade: 'Excellence',
    percentage: 91,
    topicsCompleted: 25,
    studyHours: 32,
    status: 'Completed',
    verified: true,
    requirements: {
      roadmap: 100,
      topics: '25 / 25',
      quiz: 91,
      finalAssessment: 92
    }
  },
  {
    id: 'cert_002',
    studentName: 'Arjun Sharma',
    courseName: 'Database Management Systems',
    completionDate: 'August 2026',
    issueDate: '2026-08-20',
    certificateId: 'CERT-2026-00235',
    grade: 'Excellence',
    percentage: 88,
    topicsCompleted: 20,
    studyHours: 26,
    status: 'Completed',
    verified: true,
    requirements: {
      roadmap: 100,
      topics: '20 / 20',
      quiz: 88,
      finalAssessment: 89
    }
  },
  {
    id: 'cert_003',
    studentName: 'Arjun Sharma',
    courseName: 'Operating Systems',
    completionDate: 'August 2026',
    issueDate: '2026-08-25',
    certificateId: 'CERT-2026-00346',
    grade: 'Merit',
    percentage: 82,
    topicsCompleted: 18,
    studyHours: 22,
    status: 'Completed',
    verified: true,
    requirements: {
      roadmap: 100,
      topics: '18 / 18',
      quiz: 82,
      finalAssessment: 85
    }
  },
  {
    id: 'cert_004',
    studentName: 'Arjun Sharma',
    courseName: 'Machine Learning Foundations',
    status: 'In Progress',
    progress: 72,
    topicsCompleted: 18,
    totalTopics: 25,
    percentage: 82,
    estimatedCompletion: '5 days',
    requirements: {
      roadmap: 72,
      topics: '18 / 25',
      quiz: 82,
      finalAssessment: null
    }
  },
  {
    id: 'cert_005',
    studentName: 'Arjun Sharma',
    courseName: 'Advanced Data Analytics',
    status: 'Locked',
    requirement: 'Complete Data Analytics Roadmap',
    requirements: {
      roadmap: 0,
      topics: '0 / 30',
      quiz: 0,
      finalAssessment: null
    }
  }
];

// ─── Progress Analytics ───────────────────────────────────────────────────────
export const legacyMockProgressData = {
  monthlyStudyHours: [12, 18, 15, 22, 19, 25, 20, 30],
  monthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  quizScores: [72, 68, 80, 75, 84, 88, 82, 90],
  topicDistribution: [
    { topic: 'Data Structures', percentage: 30 },
    { topic: 'Algorithms', percentage: 25 },
    { topic: 'OOP', percentage: 20 },
    { topic: 'Web Dev', percentage: 15 },
    { topic: 'Other', percentage: 10 },
  ],
  strongTopics: ['OOP Concepts', 'Sorting Algorithms', 'HTML/CSS', 'JavaScript Basics'],
  weakTopics: ['Dynamic Programming', 'Graph Algorithms', 'System Design'],
  totalTopicsCompleted: 24,
  totalQuizzesTaken: 18,
  averageScore: 84,
  totalStudyHours: 48.5,
};

// ─── Streak Data ──────────────────────────────────────────────────────────────
export const mockStreakData = {
  currentStreak: 7,
  longestStreak: 14,
  thisMonth: 19,
  totalDays: 47,
  weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  weekCompleted: [true, true, true, true, true, true, true],
  calendarDays: Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    studied: [1,2,3,4,5,7,8,9,10,12,13,14,15,16,18,19,20,22,23,24,25,26,28,29,30,31].includes(i + 1),
    isToday: i + 1 === 13,
  })),
  achievements: [
    { id: 'a1', emoji: '🔥', title: '7 Day Warrior', description: 'Study 7 days in a row', earned: true, date: 'Aug 13, 2025' },
    { id: 'a2', emoji: '🏆', title: '30 Day Learner', description: 'Study for 30 total days', earned: true, date: 'Jul 30, 2025' },
    { id: 'a3', emoji: '⭐', title: 'Quiz Master', description: 'Score 90%+ on 5 quizzes', earned: true, date: 'Aug 05, 2025' },
    { id: 'a4', emoji: '📚', title: 'Knowledge Seeker', description: 'Complete 20 topics', earned: true, date: 'Jul 20, 2025' },
    { id: 'a5', emoji: '💎', title: '30 Day Streak', description: 'Study 30 consecutive days', earned: false, date: null },
    { id: 'a6', emoji: '🚀', title: 'Speed Learner', description: 'Complete 50 topics', earned: false, date: null },
  ],
};

// ─── AI Topic Explanations (Mock AI Responses) ────────────────────────────────
export const mockExplanations = {
  'Binary Search Tree': {
    topic: 'Binary Search Tree',
    simple: 'A Binary Search Tree (BST) is like a sorted filing cabinet. Each drawer (node) can hold one item. The left drawer always contains smaller items, and the right drawer always contains larger items. This makes finding, adding, or removing items very fast — you never have to search the entire cabinet!',
    intermediate: 'A BST is a hierarchical data structure where each node contains a key and two children (left and right). The BST property ensures: for any node N, all keys in the left subtree < N.key, and all keys in the right subtree > N.key. This property enables O(log n) search in balanced trees.',
    advanced: 'BSTs provide average O(log n) time complexity for search, insertion, and deletion. However, in the worst case (sorted input), a BST degenerates to O(n) — a linked list. Self-balancing variants (AVL, Red-Black Trees) guarantee O(log n) worst case by maintaining balance invariants through rotations.',
    example: {
      title: 'BST with values [5, 3, 7, 2, 4, 6, 8]',
      code: `     5
    / \\
   3   7
  / \\ / \\
 2  4 6  8

Search(4): 5→3→4 ✓ (3 comparisons)`,
    },
    realWorldApplications: [
      'Database indexing (B-Trees are BST variants)',
      'File systems for directory lookups',
      'Auto-complete and spell checkers',
      'Priority queues in operating systems',
    ],
    keyTakeaways: [
      'BST property: left < parent < right at every node',
      'Inorder traversal gives sorted sequence',
      'Average O(log n), worst O(n) if unbalanced',
      'Use AVL or Red-Black Tree for guaranteed O(log n)',
    ],
    relatedTopics: ['AVL Trees', 'Red-Black Trees', 'Heap', 'Graph Traversal', 'Hash Tables'],
  },
};

// ─── Mock Chat Messages ───────────────────────────────────────────────────────
export const mockChatMessages = [
  {
    id: 'msg_1',
    role: 'ai',
    content: 'Hello! I\'m your AI Doubt Solver. Ask me any question about your studies and I\'ll explain it clearly. What would you like to understand today?',
    timestamp: '10:00 AM',
  },
  {
    id: 'msg_2',
    role: 'user',
    content: 'Explain polymorphism with a real-world example.',
    timestamp: '10:01 AM',
  },
  {
    id: 'msg_3',
    role: 'ai',
    content: `**Polymorphism** means "many forms" — a single interface behaving differently based on the object using it.

**Real-World Example 🐾**

Think of a "speak" command given to different animals:
- A **Dog** hears "speak" → barks 🐶
- A **Cat** hears "speak" → meows 🐱
- A **Duck** hears "speak" → quacks 🦆

Same command "speak", different behavior!

**In Code:**
\`\`\`python
class Animal:
    def speak(self): pass

class Dog(Animal):
    def speak(self): return "Woof!"

class Cat(Animal):
    def speak(self): return "Meow!"

animals = [Dog(), Cat()]
for a in animals:
    print(a.speak())  # Each responds differently!
\`\`\`

**Types of Polymorphism:**
1. **Compile-time** — Method Overloading
2. **Runtime** — Method Overriding (example above)

Does this help? Want me to explain overloading vs overriding?`,
    timestamp: '10:01 AM',
  },
];

// ─── Suggested Doubts ─────────────────────────────────────────────────────────
export const mockSuggestedQuestions = [
  'Explain this simply',
  'Give me a code example',
  'Show step-by-step',
  'What are real-world uses?',
  'Compare with similar concepts',
  'What are common mistakes?',
];

// ─── Features List ────────────────────────────────────────────────────────────
export const mockFeatures = [
  { icon: 'brain', title: 'AI Topic Explainer', description: 'Get instant, personalized explanations at your learning level.', color: 'indigo' },
  { icon: 'message-circle', title: 'AI Doubt Solver', description: 'Chat with AI to clear any concept instantly.', color: 'violet' },
  { icon: 'zap', title: 'Smart Quiz Generator', description: 'Generate custom quizzes on any topic with AI.', color: 'blue' },
  { icon: 'map', title: 'Personalized Roadmaps', description: 'AI-crafted learning paths tailored to your goals.', color: 'purple' },
  { icon: 'layers', title: 'AI Flashcards', description: 'Create and study smart flashcards automatically.', color: 'indigo' },
  { icon: 'file-text', title: 'PDF Notes', description: 'Generate comprehensive notes and download as PDF.', color: 'blue' },
  { icon: 'bar-chart-2', title: 'Progress Analytics', description: 'Deep insights into your learning journey.', color: 'violet' },
  { icon: 'flame', title: 'Study Streaks', description: 'Build habits with streak tracking and achievements.', color: 'orange' },
  { icon: 'award', title: 'Certificates', description: 'Earn verifiable certificates on course completion.', color: 'gold' },
];

// Helper to generate a dynamic personalized mock roadmap
export function generateMockRoadmap(goal, subject, currentLevel, targetLevel, dailyStudyTime, duration) {
  const targetSubject = subject ? subject.trim() : 'General Studies';
  const targetGoal = goal ? goal.trim() : `Master ${targetSubject}`;
  
  const normSubject = targetSubject.toLowerCase();
  
  let dayRanges = [];
  if (duration === '1 Week') {
    dayRanges = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  } else if (duration === '2 Weeks') {
    dayRanges = ['Day 1-2', 'Day 3-4', 'Day 5-6', 'Day 7-8', 'Day 9-10', 'Day 11-12', 'Day 13-14'];
  } else if (duration === '3 Months') {
    dayRanges = ['Week 1-2', 'Week 3-4', 'Week 5-6', 'Week 7-8', 'Week 9-10', 'Week 11-12'];
  } else {
    dayRanges = ['Day 1-3', 'Day 4-6', 'Day 7-10', 'Day 11-15', 'Day 16-20', 'Day 21-25', 'Day 26-30'];
  }
  
  const totalSteps = dayRanges.length;
  let topicsList = [];
  
  if (normSubject.includes('data structure') || normSubject.includes('dsa') || normSubject.includes('algorithm')) {
    const dsaTopics = [
      {
        title: 'Arrays & Big O Complexity',
        description: 'Understand contiguous memory allocation, array operations, and standard Big O time/space complexity notation.',
        objectives: ['Analyze worst-case time complexity of array lookups', 'Implement dynamic resizing arrays from scratch', 'Describe memory layouts of multi-dimensional arrays'],
        difficulty: 'Beginner',
        estimatedMinutes: 90
      },
      {
        title: 'Linked Lists (Singly & Doubly)',
        description: 'Learn node-based pointers, linear traversals, head/tail insertion, deletion, and search algorithms.',
        objectives: ['Compare memory locality in arrays vs linked lists', 'Implement singly and doubly linked list pointer adjustments', 'Write Floyd cycle detection or list reversing functions'],
        difficulty: 'Beginner',
        estimatedMinutes: 90
      },
      {
        title: 'Stacks & Queues',
        description: 'Master Last In First Out (LIFO) and First In First Out (FIFO) abstractions, stack frames, and buffers.',
        objectives: ['Write parenthesis bracket validator using stacks', 'Implement circular queues using arrays', 'Describe recursion stacks and application call states'],
        difficulty: 'Beginner',
        estimatedMinutes: 120
      },
      {
        title: 'Binary Trees & Tree Traversals',
        description: 'Explore hierarchical non-linear data structures, binary search trees (BST), and DFS/BFS traversals.',
        objectives: ['Explain binary tree search invariants', 'Write recursive and iterative Inorder, Preorder, and Postorder traversals', 'Compare Depth First Search vs Breadth First Search patterns'],
        difficulty: 'Intermediate',
        estimatedMinutes: 120
      },
      {
        title: 'Graphs & Graph Algorithms',
        description: 'Understand adjacency lists, adjacency matrices, BFS/DFS traversal sequences, and shortest path models.',
        objectives: ['Represent directed and undirected graphs', 'Write standard BFS and DFS traversal loops', 'Explain high-level logic of Dijkstra or cycle checking algorithms'],
        difficulty: 'Intermediate',
        estimatedMinutes: 150
      },
      {
        title: 'Sorting & Searching Algorithms',
        description: 'Review common sorting patterns (Bubble, Selection, Insertion) vs divide-and-conquer (Merge, Quick Sort).',
        objectives: ['Analyze worst-case complexity of Quick Sort vs Merge Sort', 'Implement binary search on sorted intervals', 'Describe in-place vs stable sorting properties'],
        difficulty: 'Intermediate',
        estimatedMinutes: 120
      },
      {
        title: 'Hash Tables & Collisions',
        description: 'Explore hash functions, bucket indexing, key-value mappings, and collision resolution techniques.',
        objectives: ['Describe collision resolving using chaining vs open addressing', 'Explain average vs worst-case lookup complexities in HashMaps', 'Design a basic hash function index mapping'],
        difficulty: 'Advanced',
        estimatedMinutes: 90
      },
      {
        title: 'Advanced Heap & AVL Trees',
        description: 'Explore self-balancing binary search trees and priority queues managed through min/max heaps.',
        objectives: ['Perform left/right AVL rotations on height imbalance', 'Explain bubble-up and heapify-down mechanisms in heaps', 'Implement Priority Queue APIs using arrays'],
        difficulty: 'Advanced',
        estimatedMinutes: 120
      }
    ];
    topicsList = dsaTopics.slice(0, totalSteps);
  } else if (normSubject.includes('java')) {
    const javaTopics = [
      {
        title: 'Java Basics & OOP Pillars',
        description: 'Learn Java syntax, JVM architecture, primitive types, class definitions, and encapsulation pillars.',
        objectives: ['Define Inheritance, Encapsulation, Polymorphism, Abstraction', 'Explain differences between JDK, JRE, and JVM', 'Write classes with getters, setters, and customized constructors'],
        difficulty: 'Beginner',
        estimatedMinutes: 90
      },
      {
        title: 'Interfaces & Abstract Classes',
        description: 'Master contract-driven software design, interface syntax, abstract layers, and method overriding.',
        objectives: ['Compare Abstract Classes vs Java Interfaces', 'Implement multiple inheritance through interfaces', 'Explain default and static interface methods'],
        difficulty: 'Beginner',
        estimatedMinutes: 90
      },
      {
        title: 'Java Collections Framework',
        description: 'Learn list structures, sets, queues, map collections, iterable interfaces, and standard iteration APIs.',
        objectives: ['Compare ArrayList vs LinkedList performance profiles', 'Use HashSets and TreeSet hashing configurations', 'Write custom comparators for custom class sorting'],
        difficulty: 'Intermediate',
        estimatedMinutes: 120
      },
      {
        title: 'Java Exception Handling & File I/O',
        description: 'Explore try-catch-finally blocks, checked vs unchecked exceptions, custom exception classes, and stream I/O.',
        objectives: ['Write robust try-with-resources statement structures', 'Differentiate unchecked RuntimeException from checked Exceptions', 'Implement file readers and writers using BufferedReader'],
        difficulty: 'Intermediate',
        estimatedMinutes: 100
      },
      {
        title: 'Multithreading & Concurrency',
        description: 'Understand Thread objects, Runnable implementations, synchronized statements, thread pools, and locks.',
        objectives: ['Start threads using Thread extensions and Runnables', 'Resolve deadlock conditions in synchronized blocks', 'Use ExecutorServices to schedule concurrent pool runs'],
        difficulty: 'Advanced',
        estimatedMinutes: 150
      },
      {
        title: 'Generics & Lambda Streams',
        description: 'Leverage static generic types, functional interfaces, Lambda streams, filter, map, and collect APIs.',
        objectives: ['Write generic list utilities with bounds constraints', 'Use stream aggregates to filter and collect lists', 'Describe functional interfaces like Predicate and Consumer'],
        difficulty: 'Advanced',
        estimatedMinutes: 120
      },
      {
        title: 'Spring Framework & REST APIs',
        description: 'Build backend REST endpoints using Spring Boot dependency injection, annotations, and controllers.',
        objectives: ['Configure Spring Boot controllers with REST actions', 'Configure database connections using Spring Data JPA', 'Write integration tests using MockMvc mocks'],
        difficulty: 'Advanced',
        estimatedMinutes: 180
      }
    ];
    topicsList = javaTopics.slice(0, totalSteps);
  } else if (normSubject.includes('machine learning') || normSubject.includes('ml') || normSubject.includes('python')) {
    const mlTopics = [
      {
        title: 'Python for Data Analysis',
        description: 'Master basic Python syntax, data structures, and scientific calculation libraries like NumPy and Pandas.',
        objectives: ['Perform array slicing and vector operations in NumPy', 'Filter and aggregate structured DataFrames in Pandas', 'Create visualization plots using Matplotlib and Seaborn'],
        difficulty: 'Beginner',
        estimatedMinutes: 90
      },
      {
        title: 'Mathematics Foundations for ML',
        description: 'Review core concepts in linear algebra (matrices, vectors), calculus (gradients), and probability theory.',
        objectives: ['Perform matrix multiplication and eigenvalue calculations', 'Calculate partial derivatives and gradient descents', 'Explain probability density and Bayes Theorem principles'],
        difficulty: 'Beginner',
        estimatedMinutes: 120
      },
      {
        title: 'Supervised Learning Regression',
        description: 'Explore linear models, ordinary least squares, gradient descent optimizations, and performance metrics.',
        objectives: ['Implement Linear Regression models from scratch', 'Analyze mean squared error (MSE) and R-squared metrics', 'Apply regularization metrics like Ridge and Lasso'],
        difficulty: 'Intermediate',
        estimatedMinutes: 120
      },
      {
        title: 'Supervised Learning Classification',
        description: 'Understand classification bounds using Logistic Regression, Support Vector Machines (SVM), and Decision Trees.',
        objectives: ['Implement Logistic Regression models with sigmoid scales', 'Draw decision trees and measure Gini impurity levels', 'Explain SVM margin maximization and kernel tricks'],
        difficulty: 'Intermediate',
        estimatedMinutes: 150
      },
      {
        title: 'Unsupervised Clustering & PCA',
        description: 'Explore group patterns without labels using K-Means and dimension reduction via Principal Component Analysis (PCA).',
        objectives: ['Write standard K-Means clustering loops', 'Select optimal clusters using elbow methods', 'Execute PCA to compress features while retaining variance'],
        difficulty: 'Intermediate',
        estimatedMinutes: 120
      },
      {
        title: 'Neural Networks & Deep Learning',
        description: 'Explore artificial neural networks, forward pass structures, backward propagation, and activation functions.',
        objectives: ['Write basic neural network layers using PyTorch/TensorFlow', 'Explain sigmoid, ReLU, and Softmax activation properties', 'Describe backpropagation using chain derivatives'],
        difficulty: 'Advanced',
        estimatedMinutes: 180
      },
      {
        title: 'Model Evaluation & Hyperparameters',
        description: 'Perform cross-validation, grid search tuning, and compute confusion matrices, precision, and recall.',
        objectives: ['Conduct K-fold cross validations on subsets', 'Differentiate bias vs variance anomalies', 'Interpret precision-recall curves and F1 scores'],
        difficulty: 'Advanced',
        estimatedMinutes: 120
      }
    ];
    topicsList = mlTopics.slice(0, totalSteps);
  } else {
    for (let i = 0; i < totalSteps; i++) {
      const isBeginner = i < totalSteps / 3;
      const isIntermediate = i >= totalSteps / 3 && i < (2 * totalSteps) / 3;
      topicsList.push({
        title: `${targetSubject} Phase ${i + 1}`,
        description: `Master core components and applications of ${targetSubject} during this structured section.`,
        objectives: [
          `Describe the fundamental principles of ${targetSubject} Phase ${i + 1}`,
          `Implement standard constructs and functions related to this phase`,
          `Analyze performance characteristics and design trade-offs`
        ],
        difficulty: isBeginner ? 'Beginner' : isIntermediate ? 'Intermediate' : 'Advanced',
        estimatedMinutes: 90 + (i * 15)
      });
    }
  }

  while (topicsList.length < totalSteps) {
    const idx = topicsList.length;
    topicsList.push({
      title: `${targetSubject} Advanced Case Study ${idx + 1}`,
      description: `Synthesize advanced knowledge of ${targetSubject} in real-world scenarios.`,
      objectives: [`Build complex integrations`, `Perform debugging and regression checks`],
      difficulty: 'Advanced',
      estimatedMinutes: 120
    });
  }

  const topics = topicsList.map((t, idx) => ({
    id: `roadmap_topic_${idx + 1}`,
    title: t.title,
    description: t.description,
    dayRange: dayRanges[idx],
    difficulty: t.difficulty,
    estimatedMinutes: t.estimatedMinutes,
    objectives: t.objectives,
    status: idx === 0 ? 'In Progress' : 'Upcoming'
  }));

  return {
    id: `roadmap_${Date.now()}`,
    goal: targetGoal,
    subject: targetSubject,
    currentLevel,
    targetLevel,
    duration,
    dailyStudyTime,
    progress: 0,
    topics
  };
}

// Helper to generate a dynamic personalized flashcards deck
export function generateMockFlashcards(topic, count, difficulty) {
  const targetTopic = topic ? topic.trim() : 'General Concepts';
  const targetCount = parseInt(count, 10) || 10;
  const targetDifficulty = difficulty || 'Intermediate';

  const normTopic = targetTopic.toLowerCase();
  let matches = mockFlashcards.filter(c => 
    c.topic.toLowerCase().includes(normTopic) || 
    normTopic.includes(c.topic.toLowerCase())
  );

  const cardsList = matches.map(c => ({
    id: c.id,
    front: c.front,
    back: c.back,
    topic: c.topic,
    status: 'unknown'
  }));

  const fallbackTemplates = [
    {
      front: "What is the primary definition of {topic}?",
      back: "{topic} represents a core architectural pattern/concept used to abstract operational details and organize software systems."
    },
    {
      front: "Name a key advantage of adopting {topic} in modern development.",
      back: "It improves horizontal scalability, decreases runtime resource overhead, and enforces clean modular boundaries."
    },
    {
      front: "What is a common pitfall or challenge associated with {topic}?",
      back: "Increased initial design complexity and potential performance bottlenecks if resource constraints are ignored."
    },
    {
      front: "At a {difficulty} level, how is the correctness of {topic} verified?",
      back: "By analyzing runtime logs, executing unit tests, running static code checkers, and using profiling tools."
    },
    {
      front: "Under what scenario should you avoid implementing {topic}?",
      back: "When designing lightweight, short-lived scripts where abstract design layers add unnecessary engineering overhead."
    },
    {
      front: "Describe how data mutation or state is managed in {topic}.",
      back: "By enforcing immutable data patterns, unidirectional state flow, or atomic transactional boundaries."
    },
    {
      front: "What is a main trade-off when choosing {topic} over simple alternatives?",
      back: "Upfront design complexity vs. long-term code maintainability, testability, and scalability."
    },
    {
      front: "How does {topic} contribute to system robustness in production?",
      back: "By isolating errors through declarative boundaries and preventing cascading runtime exceptions."
    }
  ];

  let templateIndex = 0;
  while (cardsList.length < targetCount) {
    const template = fallbackTemplates[templateIndex % fallbackTemplates.length];
    const cardId = `dynamic_fc_${cardsList.length + 1}`;

    const frontText = template.front
      .replace(/{topic}/g, targetTopic)
      .replace(/{difficulty}/g, targetDifficulty);
    
    const backText = template.back
      .replace(/{topic}/g, targetTopic)
      .replace(/{difficulty}/g, targetDifficulty);

    cardsList.push({
      id: cardId,
      front: frontText,
      back: backText,
      topic: targetTopic,
      status: 'unknown'
    });

    templateIndex++;
  }

  // Shuffle the final list slightly
  return cardsList.slice(0, targetCount).sort(() => Math.random() - 0.5);
}

// Helper to generate dynamic mock notes
export function generateMockNotes(topic, type, difficulty, length, learningGoal) {
  const normTopic = (topic || '').trim();
  const targetTopic = normTopic || 'General Study';
  const targetType = type || 'Detailed Notes';
  const targetDifficulty = difficulty || 'Intermediate';
  const targetLength = length || 'Medium';

  const lowerTopic = targetTopic.toLowerCase();

  // 1. DBMS PRE-COOKED NOTES
  if (lowerTopic.includes('dbms') || lowerTopic.includes('database')) {
    return {
      id: `notes_dbms_${Date.now()}`,
      title: `${targetTopic} Study Notes`,
      topic: targetTopic,
      type: targetType,
      difficulty: targetDifficulty,
      length: targetLength,
      learningGoal: learningGoal || 'Master database concepts',
      overview: "A comprehensive guide to understanding Database Management Systems, structure schemas, key constraints, normalizations, SQL query sets, and ACID transactions.",
      sections: [
        {
          heading: "1. Introduction to DBMS",
          explanation: "A Database Management System (DBMS) is software designed to define, store, retrieve, and manage data safely. It acts as a middle layer between physical storage and application programs, enforcing consistency, security, and integrity rules.",
          importantPoints: [
            "DBMS ensures data independence by separating physical storage schemas from logical client applications.",
            "It controls concurrency access, stopping write conflicts when multiple users query the database."
          ],
          examples: [
            "Relational DBMS models include PostgreSQL, MySQL, and SQLite.",
            "NoSQL database models include MongoDB (document-based) and Redis (key-value cache)."
          ],
          keyTerms: [
            { term: "DBMS", definition: "Database Management System - software managing data assets." },
            { term: "Data Independence", definition: "The ability to modify database schemas without breaking application software." }
          ]
        },
        {
          heading: "2. Relational Database Models",
          explanation: "Relational models organize data into tables (relations) containing rows (tuples) and columns (attributes). Every relation obeys mathematical set theory, representing links through values.",
          importantPoints: [
            "Attributes define data fields, and records contain specific object instances.",
            "Schemas define the blueprints of tables, constraints, types, and indices."
          ],
          examples: [
            "An 'Employees' table containing columns (EmpID, Name, JobTitle, DeptID) representing the company schema."
          ],
          keyTerms: [
            { term: "Relation", definition: "A table containing data columns and rows." },
            { term: "Tuple", definition: "A single record or row in a relational database table." }
          ]
        },
        {
          heading: "3. Keys in Relational Tables",
          explanation: "Keys are fields or sets of fields used to uniquely distinguish rows in a table and build relational links across database schemas.",
          importantPoints: [
            "Primary Key: A unique, non-null column that distinguishes every single record in a table.",
            "Foreign Key: A field that references the primary key of another table, establishing relational mappings."
          ],
          examples: [
            "In an 'Orders' table, OrderID is the Primary Key. CustomerID is a Foreign Key pointing to the Customers table."
          ],
          keyTerms: [
            { term: "Primary Key", definition: "A unique identifier column for table records." },
            { term: "Foreign Key", definition: "A link column establishing referential mappings to outside tables." }
          ]
        },
        {
          heading: "4. Normalization and Normal Forms",
          explanation: "Normalization is the systematic process of organizing tables to eliminate data redundancy and prevent operational anomalies (insertion, deletion, and update anomalies).",
          importantPoints: [
            "1NF (First Normal Form): Single atomic values in cells, no repeating groups.",
            "2NF: Meet 1NF, and eliminate partial dependencies on composite keys.",
            "3NF: Meet 2NF, and eliminate transitive dependencies on non-prime attributes.",
            "BCNF (Boyce-Codd Normal Form): A stronger 3NF version where every determinant is a super key."
          ],
          examples: [
            "Decomposing a massive student-class-date spreadsheet into distinct, clean 'Students', 'Classes', and 'Registrations' tables."
          ],
          keyTerms: [
            { term: "Redundancy", definition: "Unnecessary duplicate storage of identical values." },
            { term: "Anomaly", definition: "Inconsistent states occurring when modifying poorly structured tables." }
          ]
        },
        {
          heading: "5. Structured Query Language (SQL)",
          explanation: "SQL is the standard language used to interact with relational databases. Commands are split into Data Definition Language (DDL) and Data Manipulation Language (DML).",
          importantPoints: [
            "DDL statement queries CREATE, ALTER, and DROP define tables and schemas.",
            "DML statement queries SELECT, INSERT, UPDATE, and DELETE retrieve or modify rows."
          ],
          examples: [
            "SELECT Name FROM Students WHERE GPA >= 3.8 ORDER BY Name ASC;"
          ],
          keyTerms: [
            { term: "DDL", definition: "Data Definition Language - defines structure configuration." },
            { term: "DML", definition: "Data Manipulation Language - queries and mutates rows." }
          ]
        },
        {
          heading: "6. Transactions and ACID Properties",
          explanation: "A database transaction is a collection of operations executed as a single unit of work. Transactions must adhere to ACID properties to guarantee data safety.",
          importantPoints: [
            "Atomicity: Transactions succeed completely or fail completely (all-or-nothing).",
            "Consistency: Transactions take database states from one valid configuration to another.",
            "Isolation: Concurrent transaction runs yield the same database state as running them sequentially.",
            "Durability: Committed updates remain written, even through power losses or crashes."
          ],
          examples: [
            "Transferring money debits Account A and credits Account B. If B's credit fails, A's debit is rolled back."
          ],
          keyTerms: [
            { term: "Commit", definition: "Permanently saving transactional queries." },
            { term: "Rollback", definition: "Reverting queries to restore pre-transaction state." }
          ]
        }
      ],
      keyTakeaways: [
        "DBMS software provides secure, concurrent interface structures for data.",
        "Normalization split steps (1NF, 2NF, 3NF) reduce redundancy and anomalies.",
        "Primary Keys enforce uniqueness; Foreign Keys establish relational linkages.",
        "SQL queries manipulate structure (DDL) and execute row mutations (DML).",
        "ACID rules ensure transactional integrity and crash recovery."
      ],
      importantTerms: ["Primary Key", "Foreign Key", "Normalization", "Transaction", "SQL", "ACID"],
      quickRevision: "DBMS manages database assets securely. Relational systems utilize table columns linked by Primary & Foreign Keys. Normalization steps (1NF, 2NF, 3NF, BCNF) partition columns to remove data redundancies. SQL handles definitions (DDL) and queries (DML). Transactions guarantee integrity by satisfying ACID (Atomicity, Consistency, Isolation, Durability) attributes."
    };
  }

  // 2. DATA STRUCTURES PRE-COOKED NOTES
  if (lowerTopic.includes('data structure') || lowerTopic.includes('dsa') || lowerTopic.includes('algorithm')) {
    return {
      id: `notes_dsa_${Date.now()}`,
      title: `${targetTopic} Study Notes`,
      topic: targetTopic,
      type: targetType,
      difficulty: targetDifficulty,
      length: targetLength,
      learningGoal: learningGoal || 'Understand linear and non-linear data structures',
      overview: "A structured study guide outlining linear data layouts (Arrays, Linked Lists, Stacks, Queues) and non-linear hierarchical layouts (Trees, Graphs, Hash Tables) along with Big O notations.",
      sections: [
        {
          heading: "1. Arrays & Big O Complexity",
          explanation: "An array is a linear structure holding items in contiguous memory blocks. Access is O(1) via indices, but dynamic resize requires copying O(N) items.",
          importantPoints: [
            "Fixed sizes limit contiguous allocations in memory heaps.",
            "Access is constant time, while element insertion or deletion takes O(N) shift operations."
          ],
          examples: [
            "Declaring an integer array: int arr[5] = {10, 20, 30, 40, 50};"
          ],
          keyTerms: [
            { term: "Contiguous Memory", definition: "Adjoining bytes allocated sequentially in memory cards." },
            { term: "Big O", definition: "Mathematical notation defining worst-case complexity." }
          ]
        },
        {
          heading: "2. Linked Lists",
          explanation: "Linked lists consist of nodes containing data and pointers referencing adjacent nodes. They permit dynamic allocation without contiguous restrictions.",
          importantPoints: [
            "Singly Linked Lists reference forward nodes; Doubly lists reference both forward and backward nodes.",
            "Insertion at the head is O(1), but search takes linear time O(N) as indexing is unavailable."
          ],
          examples: [
            "Reversing a singly linked list pointers sequentially."
          ],
          keyTerms: [
            { term: "Node", definition: "An object storing a data item and pointer references." },
            { term: "Pointer", definition: "A variable storing the memory address of another object." }
          ]
        },
        {
          heading: "3. Stacks & Queues",
          explanation: "Stacks and queues are constrained linear collections restricting operations to boundaries.",
          importantPoints: [
            "Stack follows LIFO (Last In First Out) using push (add) and pop (remove) at the top.",
            "Queue follows FIFO (First In First Out) enqueuing at the rear and dequeuing at the front."
          ],
          examples: [
            "Use recursion call stacks or browser history logs (Stacks). Print spooler queues (Queues)."
          ],
          keyTerms: [
            { term: "LIFO", definition: "Last In First Out - Stack item retrieve sequence." },
            { term: "FIFO", definition: "First In First Out - Queue item retrieve sequence." }
          ]
        },
        {
          heading: "4. Trees (Binary Search Trees)",
          explanation: "A tree is a non-linear hierarchical structure containing connected parent-child nodes. A Binary Search Tree (BST) enforces keys on the left to be smaller, and right keys to be larger.",
          importantPoints: [
            "BST search, insert, and delete take average O(log N) time, but can degrade to O(N) if unbalanced.",
            "Common traversals: Inorder (returns sorted keys), Preorder, and Postorder."
          ],
          examples: [
            "Performing Left-Root-Right recursion steps to traverse a BST in sorted order."
          ],
          keyTerms: [
            { term: "BST", definition: "Binary Search Tree - sorted parent-child node layout." },
            { term: "Traversal", definition: "Visiting every node in a tree systematically." }
          ]
        }
      ],
      keyTakeaways: [
        "Arrays allocate contiguous memory blocks, granting O(1) index access.",
        "Linked lists store dynamic nodes containing link pointers.",
        "Stacks utilize LIFO structures; Queues utilize FIFO structures.",
        "Binary Search Trees organize parent-child nodes for logarithmic searches."
      ],
      importantTerms: ["Contiguous Memory", "Singly Linked List", "LIFO", "FIFO", "BST"],
      quickRevision: "Data structures organize data in memory. Arrays use contiguous indices, enabling constant access. Linked lists chain nodes via pointers, avoiding fixed size limits. Stacks utilize LIFO top boundaries. Queues utilize FIFO front/rear boundaries. BST structures order keys to execute search paths in O(log N) average time."
    };
  }

  // 3. OPERATING SYSTEMS PRE-COOKED NOTES
  if (lowerTopic.includes('operating') || lowerTopic.includes('os ') || lowerTopic.includes('kernel')) {
    return {
      id: `notes_os_${Date.now()}`,
      title: `${targetTopic} Study Notes`,
      topic: targetTopic,
      type: targetType,
      difficulty: targetDifficulty,
      length: targetLength,
      learningGoal: learningGoal || 'Master core OS design and memory management',
      overview: "A core reference sheet covering operating systems architectures, process/thread management, CPU scheduler algorithms, virtual memory paging, and process synchronization.",
      sections: [
        {
          heading: "1. Processes & Threads",
          explanation: "A process is a program in execution containing its own address space, heap, stack, and file descriptors. A thread is the smallest unit of CPU scheduling executing inside a process space, sharing memory code segments.",
          importantPoints: [
            "Processes undergo context switches saving states in Process Control Blocks (PCBs).",
            "Threads share address heaps, making communication cheaper but susceptible to race conditions."
          ],
          examples: [
            "Web browsers open processes for tabs, running multiple threads to load images concurrently."
          ],
          keyTerms: [
            { term: "PCB", definition: "Process Control Block - Kernel data storing process execution states." },
            { term: "Context Switch", definition: "CPU changing execution from one process to another." }
          ]
        },
        {
          heading: "2. CPU Scheduling Algorithms",
          explanation: "CPU Schedulers select processes from the ready queue to allocate CPU cycles, aiming to maximize throughput, minimize waiting, and balance response times.",
          importantPoints: [
            "Non-preemptive algorithms (First-Come First-Served) run tasks to completion.",
            "Preemptive algorithms (Round Robin, Shortest Remaining Time First) interrupt active processes using time quanta."
          ],
          examples: [
            "Round Robin scheduling cycles execution slices every 10 milliseconds."
          ],
          keyTerms: [
            { term: "Throughput", definition: "Number of completed processes per unit time." },
            { term: "Preemption", definition: "Temporarily suspending a running process to run another." }
          ]
        },
        {
          heading: "3. Memory Management (Paging & Virtual Memory)",
          explanation: "Virtual Memory maps logical addresses to physical RAM using page tables. Paging splits logical memory into fixed-size pages, and physical RAM into frames, avoiding fragmentation.",
          importantPoints: [
            "Page faults occur when requested data is not loaded in physical RAM, forcing disk swaps.",
            "Translation Lookaside Buffers (TLB) cache address mappings to accelerate translations."
          ],
          examples: [
            "Virtual memory paging allows a system with 8GB RAM to execute programs requiring 12GB space."
          ],
          keyTerms: [
            { term: "TLB", definition: "Translation Lookaside Buffer - High-speed CPU page tables cache." },
            { term: "Page Fault", definition: "Interrupt triggered when requested memory pages are unmapped in RAM." }
          ]
        }
      ],
      keyTakeaways: [
        "Processes have dedicated memory states; threads share address heaps.",
        "CPU Schedulers allocate cycles to balance response times and throughput.",
        "Virtual memory pages map logical addresses to physical RAM frames.",
        "TLB caches and page tables prevent redundant address translation steps."
      ],
      importantTerms: ["Context Switch", "Preemption", "Paging", "Page Fault", "TLB"],
      quickRevision: "Operating Systems manage hardware. Processes run in isolated segments, while threads share process heaps. CPU Schedulers allocate runtime slots using preemptive algorithms (Round Robin). Memory management maps virtual page blocks to physical RAM frames, handling page faults through disk swaps. TLB registers accelerate address mappings."
    };
  }

  // 4. DYNAMIC FALLBACK NOTES FOR CUSTOM TOPICS
  return {
    id: `notes_custom_${Date.now()}`,
    title: `${targetTopic} Study Notes`,
    topic: targetTopic,
    type: targetType,
    difficulty: targetDifficulty,
    length: targetLength,
    learningGoal: learningGoal || `Review and master ${targetTopic}`,
    overview: `An AI-structured study outline focusing on ${targetTopic} core principles, structural implementations, and common use cases at an ${targetDifficulty} level.`,
    sections: [
      {
        heading: `1. Foundations of ${targetTopic}`,
        explanation: `Understanding the baseline concepts of ${targetTopic} is crucial for analyzing its architectural limits and operational benefits. This section explores fundamental definitions.`,
        importantPoints: [
          `Establishes the primary vocabulary and schema models of ${targetTopic}.`,
          `Outlines performance gains and resource constraints when adopting this pattern.`
        ],
        examples: [
          `Typical implementation structures utilizing ${targetTopic} elements.`
        ],
        keyTerms: [
          { term: `${targetTopic} Core`, definition: "The essential system component representing this topic." }
        ]
      },
      {
        heading: "2. Key Operations & Architecture",
        explanation: `The operational guidelines of ${targetTopic} dictate how data, workflows, or states are mutated across systems.`,
        importantPoints: [
          "Enforces encapsulation, separation of concerns, and clean interface configurations.",
          "Minimizes structural redundancies, maximizing operational scalability."
        ],
        examples: [
          `A case study illustrating how ${targetTopic} handles high-throughput scenarios.`
        ],
        keyTerms: [
          { term: "Architecture", definition: "The high-level layout structuring software component links." }
        ]
      },
      {
        heading: "3. Best Practices & Testing",
        explanation: `Implementing ${targetTopic} requires adherence to standard guidelines to avoid latency spikes, memory leaks, or race conditions.`,
        importantPoints: [
          "Perform regular unit tests and profile memory allocations during execution.",
          "Keep interfaces simple and modular, avoiding tightly coupled dependencies."
        ],
        examples: [
          `Standard diagnostic profiling checking for bottlenecks in ${targetTopic} execution.`
        ],
        keyTerms: [
          { term: "Best Practices", definition: "Guidelines ensuring stable, maintainable deployments." }
        ]
      }
    ],
    keyTakeaways: [
      `Familiarity with ${targetTopic} foundations simplifies complex system design.`,
      "Enforcing modular interfaces prevents cascading logic errors.",
      `Profiling ${targetTopic} execution helps maintain low memory footprint.`
    ],
    importantTerms: [`${targetTopic} Core`, "Architecture", "Best Practices", "Efficiency"],
    quickRevision: `A summary on ${targetTopic}. Key study milestones involve defining the primary structure, organizing clean interfaces, and running diagnostics to verify efficiency.`
  };
}

// Mock progress data for date scopes filtering
export const mockProgressData = {
  "This Week": {
    overallProgress: 78,
    topicsCompleted: 8,
    quizzesCompleted: 5,
    avgQuizScore: 86,
    studyHours: 6.7,
    flashcardsReviewed: 42,
    notesCreated: 6,
    tutorSessions: 11,
    studyTimeImprovement: '+18%',
    quizScoreImprovement: '+7%',
    topicsCompletedImprovement: '+3',
    studyHoursChart: [35, 45, 20, 60, 25, 15, 0],
    quizScoresTrend: [72, 78, 81, 88, 92],
    topicPerformance: [
      { name: 'Data Structures', score: 92, rating: 'Strong' },
      { name: 'DBMS', score: 86, rating: 'Strong' },
      { name: 'Operating Systems', score: 78, rating: 'Average' },
      { name: 'Computer Networks', score: 72, rating: 'Average' },
      { name: 'Java', score: 88, rating: 'Strong' },
    ],
    strongAreas: [
      { name: 'Arrays', score: 92 },
      { name: 'SQL', score: 92 },
      { name: 'Database Normalization', score: 88 },
      { name: 'Linked Lists', score: 90 },
    ],
    weakAreas: [
      { name: 'Binary Trees', score: 58, action: 'Review Binary Tree Traversal' },
      { name: 'Computer Networks', score: 64, action: 'Explain OSI Reference Layers' },
      { name: 'Operating Systems', score: 67, action: 'Study Process Scheduling' },
    ],
    weeklySummary: {
      studyTime: '6h 42m',
      topicsCompleted: 8,
      quizzes: 5,
      flashcards: 42,
      notesCreated: 6,
      tutorSessions: 11
    },
    insights: [
      "Your quiz performance has improved by 12% over the last two weeks.",
      "You perform best when studying in the evening.",
      "Binary Trees is currently your weakest topic.",
      "You're consistently completing your weekly learning goals."
    ]
  },
  "This Month": {
    overallProgress: 72,
    topicsCompleted: 18,
    quizzesCompleted: 12,
    avgQuizScore: 82,
    studyHours: 24.5,
    flashcardsReviewed: 110,
    notesCreated: 14,
    tutorSessions: 28,
    studyTimeImprovement: '+12%',
    quizScoreImprovement: '+4%',
    topicsCompletedImprovement: '+5',
    studyHoursChart: [150, 180, 210, 120, 90, 60, 40],
    quizScoresTrend: [68, 70, 75, 78, 80, 84, 86, 88],
    topicPerformance: [
      { name: 'Data Structures', score: 85, rating: 'Strong' },
      { name: 'DBMS', score: 82, rating: 'Strong' },
      { name: 'Operating Systems', score: 74, rating: 'Average' },
      { name: 'Computer Networks', score: 65, rating: 'Average' },
      { name: 'Java', score: 84, rating: 'Strong' },
    ],
    strongAreas: [
      { name: 'Arrays', score: 88 },
      { name: 'SQL', score: 86 },
      { name: 'Database Normalization', score: 84 },
    ],
    weakAreas: [
      { name: 'Binary Trees', score: 55, action: 'Review Tree Traversals' },
      { name: 'Computer Networks', score: 61, action: 'Study IP Subnetting' },
      { name: 'Operating Systems', score: 65, action: 'Practice Semaphore Codes' },
    ],
    weeklySummary: {
      studyTime: '24h 30m',
      topicsCompleted: 18,
      quizzes: 12,
      flashcards: 110,
      notesCreated: 14,
      tutorSessions: 28
    },
    insights: [
      "Spacing lessons daily improved retention by 8% this month.",
      "Your accuracy in MCQ databases increased to 86%.",
      "Operating Systems processes remains a recommended revision focus.",
      "You have maintained your streak goal checklist 4 times this month."
    ]
  },
  "All Time": {
    overallProgress: 68,
    topicsCompleted: 32,
    quizzesCompleted: 24,
    avgQuizScore: 80,
    studyHours: 58.2,
    flashcardsReviewed: 230,
    notesCreated: 22,
    tutorSessions: 45,
    studyTimeImprovement: '+24%',
    quizScoreImprovement: '+9%',
    topicsCompletedImprovement: '+8',
    studyHoursChart: [240, 310, 280, 340, 400, 350, 300],
    quizScoresTrend: [60, 65, 68, 72, 74, 76, 78, 80, 82, 84],
    topicPerformance: [
      { name: 'Data Structures', score: 80, rating: 'Strong' },
      { name: 'DBMS', score: 78, rating: 'Average' },
      { name: 'Operating Systems', score: 70, rating: 'Average' },
      { name: 'Computer Networks', score: 58, rating: 'Needs Improvement' },
      { name: 'Java', score: 82, rating: 'Strong' },
    ],
    strongAreas: [
      { name: 'Arrays', score: 85 },
      { name: 'SQL', score: 82 },
      { name: 'Java Core Basics', score: 84 },
    ],
    weakAreas: [
      { name: 'Binary Trees', score: 52, action: 'Study AVL self-balancing rotations' },
      { name: 'Computer Networks', score: 55, action: 'Learn OSI layers and IP routing' },
      { name: 'Operating Systems', score: 59, action: 'Revise Page Replacement Algorithms' },
    ],
    weeklySummary: {
      studyTime: '58h 12m',
      topicsCompleted: 32,
      quizzes: 24,
      flashcards: 230,
      notesCreated: 22,
      tutorSessions: 45
    },
    insights: [
      "Your overall mastery index has grown by 18% since account registration.",
      "Topic explanation searches consistently improve quiz scores in 24 hours.",
      "OS page fault resolutions are your highest searched tutor queries.",
      "Streaks and certification goals are matched 90% of the time."
    ]
  }
};

// Study Streak detailed mock data
export const mockStreakModuleData = {
  currentStreak: 12,
  longestStreak: 24,
  totalStudyDays: 68,
  totalStudyHours: 42,
  weeklyActivity: [
    { day: 'Mon', studied: true },
    { day: 'Tue', studied: true },
    { day: 'Wed', studied: true },
    { day: 'Thu', studied: true },
    { day: 'Fri', studied: true },
    { day: 'Sat', studied: false },
    { day: 'Sun', studied: true }
  ],
  monthlyCalendar: Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    let status = 'studied';
    if ([6, 13, 20, 27].includes(dayNum)) {
      status = 'missed';
    }
    if (dayNum === 26) {
      status = 'today';
    }
    if (dayNum > 26) {
      status = 'future';
    }
    return {
      day: dayNum,
      status: status
    };
  }),
  milestones: [
    { id: 1, target: 7, label: 'First Week', completed: true, icon: '🔥' },
    { id: 2, target: 14, label: 'Two Week Warrior', completed: false, icon: '⚔️' },
    { id: 3, target: 30, label: 'Monthly Master', completed: false, icon: '👑' },
    { id: 4, target: 50, label: 'Learning Champion', completed: false, icon: '🏆' },
    { id: 5, target: 100, label: 'Century Scholar', completed: false, icon: '🎓' }
  ],
  todayGoal: {
    sessionsTarget: 2,
    sessionsCompleted: 1,
    minutesRemaining: 25,
    roadmapTopic: 'Complete Binary Tree Traversal',
    roadmapProgress: 60
  },
  weeklySummary: {
    studyDays: 6,
    studyHours: '5h 42m',
    topicsCompleted: 8,
    quizzesCompleted: 4,
    flashcardsReviewed: 36,
    notesCreated: 5
  },
  history: [
    { type: 'Current Streak', value: '12 days', active: true },
    { type: 'Previous Streak', value: '8 days', active: false },
    { type: 'Previous Streak', value: '5 days', active: false },
    { type: 'Longest Streak', value: '24 days', active: false }
  ],
  recentActivity: [
    { type: 'AI Tutor Session', detail: 'Data Structures', time: 'Today' },
    { type: 'Quiz Completed', detail: 'DBMS', time: 'Today' },
    { type: 'Flashcards Reviewed', detail: 'Operating Systems', time: 'Yesterday' },
    { type: 'Notes Generated', detail: 'Computer Networks', time: 'Yesterday' }
  ]
};
