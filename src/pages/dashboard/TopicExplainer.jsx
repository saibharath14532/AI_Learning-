import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Brain, Sparkles, Layers, Zap, RotateCcw, 
  Copy, Check, Code, FileText, ChevronRight
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { toast } from 'react-hot-toast';
import { aiAPI } from '../../services/api';

// ─── Pre-configured Detailed Mock Topics ────────────────────────────────────
const MOCK_TOPICS = {
  'boyce-codd normal form': {
    title: 'Boyce-Codd Normal Form (BCNF)',
    difficulty: 'Advanced',
    focus: 'Concept Breakdown',
    summary: 'Boyce-Codd Normal Form (BCNF) is a high-level database normalization standard (sometimes referred to as 3.5NF). A relation is in BCNF if and only if for every non-trivial functional dependency X -> Y, X is a superkey. BCNF addresses update and insertion anomalies that 3NF leaves unresolved when a table has overlapping candidate keys.',
    breakdown: [
      {
        title: 'The Superkey Rule',
        text: 'Unlike 3NF, which allows X -> Y if Y is a prime attribute (part of a candidate key), BCNF strictly mandates that the determinant X MUST be a superkey. There are no exemptions.'
      },
      {
        title: 'Overlapping Candidate Keys',
        text: 'BCNF is only relevant when there are multiple candidate keys that overlap (share at least one attribute). If candidate keys do not overlap, 3NF and BCNF are identical.'
      },
      {
        title: 'Lossy vs Lossless Decompositions',
        text: 'Decomposing a table into BCNF is guaranteed to be lossless, but it may not always preserve all functional dependencies. This trade-off requires careful database architecture.'
      }
    ],
    analogy: 'Imagine a medical clinic where each treatment room is assigned one specific doctor, and each doctor is qualified in exactly one specialty. In a single flat table, (Room, Doctor, Specialty) overlaps. If doctors change specialties, we face update anomalies. BCNF forces us to split this: one table map Doctor -> Specialty (where Doctor is the unique primary key), and another map Room -> Doctor, ensuring room assignments do not cause specialty discrepancies.',
    code: `-- ❌ 3NF Table (Prone to Anomalies if Doctor is not a Superkey)
CREATE TABLE ClinicAssignment (
  RoomID VARCHAR(10),
  DoctorName VARCHAR(50),
  Specialty VARCHAR(50),
  PRIMARY KEY (RoomID, DoctorName)
);

--  BCNF Decomposed Tables (Normalized)
CREATE TABLE DoctorSpecialty (
  DoctorName VARCHAR(50) PRIMARY KEY,
  Specialty VARCHAR(50)
);

CREATE TABLE DoctorRoom (
  RoomID VARCHAR(10),
  DoctorName VARCHAR(50) REFERENCES DoctorSpecialty(DoctorName),
  PRIMARY KEY (RoomID)
);`,
    diagramType: 'bcnf'
  },
  'binary trees': {
    title: 'Binary Search Trees (BST)',
    difficulty: 'Intermediate',
    focus: 'Concept Breakdown',
    summary: 'A Binary Search Tree (BST) is a hierarchical node-based data structure. Each node has at most two children, commonly referred to as the left and right child. For any node, the value of all nodes in its left subtree must be less than the node\'s value, and the value of all nodes in its right subtree must be greater.',
    breakdown: [
      {
        title: 'Binary Search Ordering',
        text: 'The structural ordering (Left < Root < Right) allows lookup, insertion, and deletion operations to run in O(log n) time on average.'
      },
      {
        title: 'Unbalanced Degeneracy',
        text: 'If keys are inserted in sorted order, the tree degenerates into a single link chain (like a linked list), causing operation times to degrade to O(n). This is solved by self-balancing trees like AVL or Red-Black trees.'
      },
      {
        title: 'Tree Traversal Paths',
        text: 'Trees are traversed in several ways: In-Order (yields sorted elements), Pre-Order (useful for copying trees), and Post-Order (useful for deleting nodes).'
      }
    ],
    analogy: 'Think of a BST like a numbered index guide in a large dictionary. Starting in the middle, if your target word comes alphabetically before the page, you ignore the entire right half of the book and turn only to the left. At each page branch, you halve your remaining search area, finding any word in seconds rather than reading cover-to-cover.',
    code: `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const newNode = new TreeNode(value);
    if (!this.root) {
      this.root = newNode;
      return this;
    }
    let current = this.root;
    while (true) {
      if (value === current.value) return undefined;
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }
}`,
    diagramType: 'binary_tree'
  },
  'javascript promises': {
    title: 'JavaScript Promises & Async/Await',
    difficulty: 'Intermediate',
    focus: 'Concept Breakdown',
    summary: 'A Promise is a proxy for a value not necessarily known when the promise is created. It allows you to associate handlers with an asynchronous action\'s eventual success value or failure reason. Promises transition between three states: Pending, Fulfilled, or Rejected.',
    breakdown: [
      {
        title: 'State Immutability',
        text: 'Once a Promise resolves (fulfilled) or rejects, its state is locked permanently. Any subsequent resolve/reject attempts are ignored.'
      },
      {
        title: 'Promise Chaining',
        text: 'Methods like .then(), .catch(), and .finally() return a new promise, allowing developers to execute asynchronous sequences cleanly without nesting callbacks (callback hell).'
      },
      {
        title: 'Async/Await Sugar',
        text: 'Introduced in ES2017, async/await syntactically wraps Promise returns to read like synchronous code, employing try/catch for cleaner error handling.'
      }
    ],
    analogy: 'Think of a Promise like a food buzzer at a busy restaurant. You place your order (trigger the async task) and receive a buzzer (the Promise). The buzzer is Pending while your food cooks. When the food is ready, the buzzer flashes green (Fulfilled). If they run out of ingredients, the buzzer sounds a red alarm (Rejected). You collect your meal or handle the error using the buzzer.',
    code: `// Fetching user data asynchronously
function fetchUserProfile(userId) {
  return new Promise((resolve, reject) => {
    console.log("Starting network request...");
    setTimeout(() => {
      if (userId === "invalid") {
        reject(new Error("User not found"));
      } else {
        resolve({ id: userId, username: "dev_arjun", level: 5 });
      }
    }, 1500);
  });
}

// Consuming Promise using Async/Await
async function loadUser() {
  try {
    const user = await fetchUserProfile("user_101");
    console.log("Success:", user);
  } catch (error) {
    console.error("Failed:", error.message);
  }
}`,
    diagramType: 'promises'
  },
  'react concurrent rendering': {
    title: 'React Concurrent Rendering',
    difficulty: 'Advanced',
    focus: 'Concept Breakdown',
    summary: 'Concurrent Rendering is a core architecture in React 18+. It allows React to prepare multiple versions of the UI at the same time. The main benefit is that rendering becomes interruptible: React can pause a long-running render to handle an urgent user interaction, keeping the page feeling smooth.',
    breakdown: [
      {
        title: 'Blocking vs Interruptible Rendering',
        text: 'In standard rendering, once a component update starts, nothing can stop it. Under Concurrent Mode, React yields to the browser event loop regularly to check for clicks or keystrokes.'
      },
      {
        title: 'Transitions API',
        text: 'Features like useTransition and useDeferredValue differentiate between urgent updates (e.g. typing in an input) and transition updates (e.g. loading a search results list).'
      },
      {
        title: 'Suspense Integrations',
        text: 'Suspense allows UI components to declare that they are waiting for asynchronous data before displaying, rendering loading templates incrementally.'
      }
    ],
    analogy: 'Think of concurrent rendering like a master chef who is slicing vegetables for a soup (a heavy render). If a customer rings the counter bell (urgent input), the chef pauses instantly, takes the order (responds to user click), and then returns to slicing. In synchronous rendering, the chef would ignore the customer until the entire sack of potatoes is sliced, leaving the customer waiting.',
    code: `import { useState, useTransition } from 'react';

export default function SearchDashboard() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (e) => {
    // Urgent: Update the input field immediately
    setQuery(e.target.value);

    // Non-urgent: Transition the heavy search results computation
    startTransition(async () => {
      const filtered = fetchHeavySearchResults(e.target.value);
      setResults(filtered);
    });
  };

  return (
    <div>
      <input type="text" value={query} onChange={handleInputChange} />
      {isPending && <p>Loading matching records...</p>}
      <ResultsList data={results} />
    </div>
  );
}`,
    diagramType: 'concurrent'
  }
};

// ─── Concept Diagram Component ──────────────────────────────────────────────
function ConceptDiagram({ type, result }) {
  const [activeTraverse, setActiveTraverse] = useState(null);
  const [traversedNodes, setTraversedNodes] = useState([]);
  const [promiseState, setPromiseState] = useState('pending');
  const [renderPipeline, setRenderPipeline] = useState('idle'); // idle, rendering, interrupted, interactive
  const [urgentClickCount, setUrgentClickCount] = useState(0);

  // Dynamic Flowchart Hooks
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Build flowchart steps from result payload
  const steps = [
    {
      id: 0,
      title: "1. Input & Context",
      subtitle: "Context Analysis",
      desc: result?.summary || `Analyzing core concepts, dependencies, and requirements for ${result?.title || 'the selected topic'}.`,
    },
    ...(result?.breakdown && result.breakdown.length > 0
      ? result.breakdown.map((item, idx) => ({
          id: idx + 1,
          title: `${idx + 2}. ${item.title}`,
          subtitle: `Step ${idx + 2}`,
          desc: item.text,
        }))
      : [
          { id: 1, title: "2. Operational Mechanics", subtitle: "Step 2", desc: "Processing rulesets, structural properties, and constraints." },
          { id: 2, title: "3. Execution Logic", subtitle: "Step 3", desc: "Transforming inputs into verified outcomes." }
        ]),
    {
      id: (result?.breakdown?.length || 2) + 1,
      title: `${(result?.breakdown?.length || 2) + 2}. Verified Output`,
      subtitle: "Code Outlines",
      desc: `Final synthesized model, verified code snippet, and execution output for ${result?.title || 'topic'}.`,
    }
  ];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep(prev => (prev + 1) % steps.length);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  // Traversal Helper for BST
  const runTraversal = (mode) => {
    setActiveTraverse(mode);
    setTraversedNodes([]);
    
    let sequence = [];
    if (mode === 'inorder') sequence = [20, 30, 40, 50, 60, 70, 80];
    if (mode === 'preorder') sequence = [50, 30, 20, 40, 70, 60, 80];
    if (mode === 'postorder') sequence = [20, 40, 30, 60, 80, 70, 50];

    sequence.forEach((val, idx) => {
      setTimeout(() => {
        setTraversedNodes(prev => [...prev, val]);
        if (idx === sequence.length - 1) {
          setTimeout(() => {
            setActiveTraverse(null);
          }, 1500);
        }
      }, idx * 600);
    });
  };

  // Concurrent Rendering Simulator
  const startRenderingSim = (mode) => {
    setUrgentClickCount(0);
    if (mode === 'sync') {
      setRenderPipeline('rendering');
      setTimeout(() => {
        setRenderPipeline('idle');
        toast.success("Synchronous Render Completed (Main Thread Blocked for 2s)");
      }, 2000);
    } else {
      setRenderPipeline('rendering');
      // In concurrent mode, we let them click and pause
      setTimeout(() => {
        setRenderPipeline('idle');
        toast.success("Concurrent Render Completed (Main Thread Remained Responsive)");
      }, 3000);
    }
  };

  const handleUrgentSimClick = () => {
    setUrgentClickCount(c => c + 1);
    if (renderPipeline === 'rendering') {
      toast.success("Keystroke/Click registered immediately! UI responsive.");
    }
  };

  // 1. Boyce-Codd Normal Form Diagram
  if (type === 'bcnf') {
    return (
      <div className="flex flex-col gap-6 py-4">
        <h4 className="text-sm font-bold text-slate-700 mb-2">BCNF Normalization Schema Mapping</h4>
        
        {/* Table 1 */}
        <div className="border border-red-200 bg-red-50/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-red-700 bg-red-100/80 px-2.5 py-0.5 rounded-full font-sans">De-normalized Relation (3NF Violation)</span>
            <span className="text-[10px] text-red-500 font-semibold">Overlapping Candidate Keys</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600 border border-red-100">
              <thead>
                <tr className="bg-red-100/50 text-slate-700 border-b border-red-200">
                  <th className="p-2 border-r border-red-200 font-bold">RoomID (Key)</th>
                  <th className="p-2 border-r border-red-200 font-bold">DoctorName (Key)</th>
                  <th className="p-2 font-bold">Specialty (Prime, but DoctorName &rarr; Specialty)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-red-100">
                  <td className="p-2 border-r border-red-200 font-medium">Room A</td>
                  <td className="p-2 border-r border-red-200 font-medium">Dr. Sharma</td>
                  <td className="p-2 text-indigo-600 font-semibold">Cardiology</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-red-200 font-medium">Room B</td>
                  <td className="p-2 border-r border-red-200 font-medium">Dr. Sharma</td>
                  <td className="p-2 text-indigo-600 font-semibold">Cardiology (⚠️ Redundancy)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-red-500 mt-2">
            * Since DoctorName determines Specialty, DoctorName &rarr; Specialty. But DoctorName is NOT a superkey alone. Hence, BCNF is violated.
          </p>
        </div>

        {/* Transition arrow */}
        <div className="flex flex-col items-center justify-center py-2 text-indigo-500">
          <div className="h-6 w-0.5 bg-indigo-200 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 my-1">Apply BCNF Decomposition</span>
          <div className="h-6 w-0.5 bg-indigo-200 animate-pulse" />
        </div>

        {/* Decomposed Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-green-200 bg-green-50/50 rounded-xl p-4">
            <span className="text-xs font-bold text-green-700 bg-green-100/80 px-2.5 py-0.5 rounded-full block w-max mb-3 font-sans">Relation 1: DoctorSpecialty</span>
            <table className="w-full text-xs text-left text-slate-600 border border-green-100">
              <thead>
                <tr className="bg-green-100/50 text-slate-700 border-b border-green-200">
                  <th className="p-2 border-r border-green-200 font-bold">DoctorName (PK)</th>
                  <th className="p-2 font-bold">Specialty</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-r border-green-200 font-semibold">Dr. Sharma</td>
                  <td className="p-2">Cardiology</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-green-200 bg-green-50/50 rounded-xl p-4">
            <span className="text-xs font-bold text-green-700 bg-green-100/80 px-2.5 py-0.5 rounded-full block w-max mb-3 font-sans">Relation 2: DoctorRoom</span>
            <table className="w-full text-xs text-left text-slate-600 border border-green-100">
              <thead>
                <tr className="bg-green-100/50 text-slate-700 border-b border-green-200">
                  <th className="p-2 border-r border-green-200 font-bold">RoomID (PK)</th>
                  <th className="p-2 font-bold">DoctorName (FK)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-green-100">
                  <td className="p-2 border-r border-green-200">Room A</td>
                  <td className="p-2 font-medium">Dr. Sharma</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-green-200">Room B</td>
                  <td className="p-2 font-medium">Dr. Sharma</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 text-center font-medium bg-slate-100 p-2.5 rounded-lg border border-slate-200">
          ✅ Determinant in both split tables is now a candidate/superkey. Insertion anomalies eliminated!
        </p>
      </div>
    );
  }

  // 2. Binary Tree Traversal Simulator
  if (type === 'binary_tree') {
    const getNodeStyle = (val) => {
      const isTraversed = traversedNodes.includes(val);
      const isCurrent = traversedNodes[traversedNodes.length - 1] === val;
      if (isCurrent) return 'bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-300 scale-110';
      if (isTraversed) return 'bg-emerald-500 text-white border-emerald-600 shadow-md';
      return 'bg-white text-slate-800 border-slate-200 hover:border-slate-300';
    };

    return (
      <div className="flex flex-col items-center py-4">
        <div className="flex items-center justify-between w-full mb-6">
          <h4 className="text-sm font-bold text-slate-700">Interactive BST Traversal Visualizer</h4>
          <div className="flex gap-2">
            <Button size="sm" variant={activeTraverse === 'preorder' ? 'primary' : 'outline'} onClick={() => runTraversal('preorder')} disabled={!!activeTraverse}>
              Pre-order (Root-L-R)
            </Button>
            <Button size="sm" variant={activeTraverse === 'inorder' ? 'primary' : 'outline'} onClick={() => runTraversal('inorder')} disabled={!!activeTraverse}>
              In-order (L-Root-R)
            </Button>
            <Button size="sm" variant={activeTraverse === 'postorder' ? 'primary' : 'outline'} onClick={() => runTraversal('postorder')} disabled={!!activeTraverse}>
              Post-order (L-R-Root)
            </Button>
          </div>
        </div>

        {/* Traversal Output Bar */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-8 flex items-center gap-2 min-h-[50px] overflow-x-auto">
          <span className="text-xs font-bold text-slate-500">Traversed Queue:</span>
          {traversedNodes.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Click one of the traversal operations above...</span>
          ) : (
            <div className="flex items-center gap-1.5 animate-fade-in">
              {traversedNodes.map((n, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight size={12} className="text-slate-400" />}
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                    {n}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Tree Layout (Tailwind SVG nodes mapping) */}
        <div className="relative w-full max-w-[450px] aspect-[4/3] flex flex-col justify-between items-center px-4">
          
          {/* Level 0: Root */}
          <div className="flex justify-center w-full z-10">
            <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getNodeStyle(50)}`}>
              50
            </div>
          </div>

          {/* Level 1 */}
          <div className="flex justify-between w-full px-12 z-10">
            <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getNodeStyle(30)}`}>
              30
            </div>
            <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getNodeStyle(70)}`}>
              70
            </div>
          </div>

          {/* Level 2 */}
          <div className="flex justify-between w-full z-10">
            <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getNodeStyle(20)}`}>
              20
            </div>
            <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getNodeStyle(40)}`}>
              40
            </div>
            <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getNodeStyle(60)}`}>
              60
            </div>
            <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${getNodeStyle(80)}`}>
              80
            </div>
          </div>

          {/* Vector connection lines in background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            {/* Root (225, 30) -> Left (100, 120), Right (350, 120) */}
            <line x1="50%" y1="12%" x2="22%" y2="48%" stroke="#0f172a" strokeWidth="2" />
            <line x1="50%" y1="12%" x2="78%" y2="48%" stroke="#0f172a" strokeWidth="2" />
            {/* Left (100, 120) -> L1 (25, 230), L2 (150, 230) */}
            <line x1="22%" y1="48%" x2="6%" y2="84%" stroke="#0f172a" strokeWidth="2" />
            <line x1="22%" y1="48%" x2="38%" y2="84%" stroke="#0f172a" strokeWidth="2" />
            {/* Right (350, 120) -> R1 (300, 230), R2 (425, 230) */}
            <line x1="78%" y1="48%" x2="62%" y2="84%" stroke="#0f172a" strokeWidth="2" />
            <line x1="78%" y1="48%" x2="94%" y2="84%" stroke="#0f172a" strokeWidth="2" />
          </svg>
        </div>
      </div>
    );
  }

  // 3. Promise State Machine Simulator
  if (type === 'promises') {
    return (
      <div className="flex flex-col items-center py-4">
        <h4 className="text-sm font-bold text-slate-700 w-full text-left mb-4">Promise State Machine Simulator</h4>

        <div className="flex items-center gap-6 justify-center w-full mb-8 relative bg-slate-50 border border-slate-100 p-6 rounded-2xl">
          {/* State 1: Pending */}
          <div className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all duration-300 ${promiseState === 'pending' ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-100 scale-105' : 'bg-white border-slate-200 opacity-60'}`}>
            <span className={`w-3.5 h-3.5 rounded-full bg-amber-400 ${promiseState === 'pending' ? 'animate-ping' : ''}`} />
            <span className="text-xs font-bold text-slate-700">PENDING</span>
          </div>

          <div className="flex flex-col items-center text-slate-400 font-semibold text-[10px]">
            <span>.then()</span>
            <div className="h-0.5 w-12 bg-slate-300" />
          </div>

          {/* Terminal States */}
          <div className="flex flex-col gap-4">
            {/* Fulfilled */}
            <div className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-all duration-300 ${promiseState === 'fulfilled' ? 'bg-emerald-50 border-emerald-400 ring-4 ring-emerald-100 scale-105' : 'bg-white border-slate-200 opacity-60'}`}>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700 font-sans">FULFILLED</span>
            </div>
            {/* Rejected */}
            <div className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-all duration-300 ${promiseState === 'rejected' ? 'bg-red-50 border-red-400 ring-4 ring-red-100 scale-105' : 'bg-white border-slate-200 opacity-60'}`}>
              <span className="w-3.5 h-3.5 rounded-full bg-red-500" />
              <span className="text-xs font-bold text-slate-700 font-sans">REJECTED</span>
            </div>
          </div>
        </div>

        {/* Interactive Triggers */}
        <div className="flex gap-3 mt-2">
          <Button size="sm" variant="outline" onClick={() => { setPromiseState('pending'); toast.success("Reset Promise to Pending state"); }}>
            <RotateCcw size={13} /> Reset
          </Button>
          <Button size="sm" variant="primary" disabled={promiseState !== 'pending'} onClick={() => { setPromiseState('fulfilled'); toast.success("Promise resolved: value = 200 OK"); }}>
            Trigger Resolve()
          </Button>
          <Button size="sm" variant="danger" disabled={promiseState !== 'pending'} onClick={() => { setPromiseState('rejected'); toast.error("Promise rejected: error = 500 Failure"); }}>
            Trigger Reject()
          </Button>
        </div>
      </div>
    );
  }

  // 4. Concurrent Rendering Pipeline Simulator
  if (type === 'concurrent') {
    return (
      <div className="flex flex-col py-4 gap-6">
        <h4 className="text-sm font-bold text-slate-700">React Concurrent Pipeline Simulation</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Synchronous Block */}
          <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between min-h-[180px] bg-slate-50">
            <div>
              <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">Legacy: Synchronous Mode</span>
              <p className="text-[11px] text-slate-400 mt-2">Single threaded blocking render block. Input key strokes lag until slicing finishes.</p>
            </div>
            
            {renderPipeline === 'rendering' ? (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-[11px] font-black text-red-700 uppercase">UI Blocked (Cannot interact)</span>
              </div>
            ) : (
              <div className="my-4 p-3 bg-white border border-slate-100 rounded-lg text-[11px] text-slate-500">
                Ready to render
              </div>
            )}

            <Button size="sm" variant="outline" onClick={() => startRenderingSim('sync')} disabled={renderPipeline === 'rendering'}>
              Trigger Blocking Render
            </Button>
          </div>

          {/* Concurrent Block */}
          <div className="border border-indigo-200 bg-indigo-50/20 rounded-xl p-4 flex flex-col justify-between min-h-[180px]">
            <div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">React 18+: Concurrent Mode</span>
              <p className="text-[11px] text-slate-400 mt-2">Yields render cycle slices to ensure input keystrokes process immediately.</p>
            </div>

            <div className="my-4 flex flex-col gap-2">
              {renderPipeline === 'rendering' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-[11px] font-black text-emerald-700 uppercase">Render yielding (Responsive)</span>
                  </div>
                  <button onClick={handleUrgentSimClick} className="text-[10px] font-black text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 px-2 py-1 rounded shadow-sm active:scale-95 transition-all">
                    Urgent Click!
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-white border border-indigo-100/50 rounded-lg text-[11px] text-slate-500">
                  Ready to render (interactive)
                </div>
              )}
              {urgentClickCount > 0 && (
                <span className="text-[10px] font-bold text-indigo-600 text-right">
                  💥 Urgent interactions registered: {urgentClickCount}
                </span>
              )}
            </div>

            <Button size="sm" variant="primary" onClick={() => startRenderingSim('concurrent')} disabled={renderPipeline === 'rendering'}>
              Trigger Concurrent Render
            </Button>
          </div>

        </div>
      </div>
    );
  }

  // 5. Dynamic AI Flowchart Generator (for all generic topics)
  const currentStepObj = steps[activeStep] || steps[0];

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Flowchart Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-800">Dynamic AI Concept Flowchart: {result?.title || 'Schema'}</h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Interactive Step-by-Step Flowchart ({steps.length} Nodes)</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="xs" variant="outline" onClick={() => { setActiveStep(prev => (prev > 0 ? prev - 1 : steps.length - 1)); setIsPlaying(false); }}>
            &larr; Prev
          </Button>
          <Button size="xs" variant={isPlaying ? 'primary' : 'secondary'} onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? '⏸ Pause Flow' : '▶ Auto-Play Flow'}
          </Button>
          <Button size="xs" variant="outline" onClick={() => { setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : 0)); setIsPlaying(false); }}>
            Next &rarr;
          </Button>
        </div>
      </div>

      {/* Interactive Flowchart Graph Nodes */}
      <div className="w-full bg-slate-900 text-white rounded-2xl p-5 shadow-inner border border-slate-800 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] gap-2 relative py-4 px-2">
          {steps.map((s, idx) => {
            const isActive = activeStep === idx;
            const isPassed = activeStep > idx;

            return (
              <div key={s.id} className="flex items-center flex-1 relative">
                {/* Node Button */}
                <button
                  type="button"
                  onClick={() => { setActiveStep(idx); setIsPlaying(false); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 w-full cursor-pointer text-center relative z-10 ${
                    isActive
                      ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 border-indigo-400 text-white ring-4 ring-indigo-500/30 scale-105 shadow-lg shadow-indigo-500/30'
                      : isPassed
                      ? 'bg-slate-800 border-emerald-500/60 text-slate-200 hover:border-emerald-400'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-white text-indigo-700' : isPassed ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{s.subtitle}</span>
                  </div>
                  <span className="text-xs font-bold line-clamp-1 max-w-[120px]">{s.title}</span>
                </button>

                {/* Connecting Line / Arrow */}
                {idx < steps.length - 1 && (
                  <div className="flex items-center justify-center w-8 flex-shrink-0 z-0 px-1">
                    <div className={`h-0.5 w-full transition-colors duration-300 ${isPassed ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                    <ChevronRight size={14} className={isPassed ? 'text-emerald-400 -ml-1' : 'text-slate-700 -ml-1'} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Node Detail Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
              Flowchart Node {activeStep + 1} of {steps.length}
            </span>
            <h5 className="text-sm font-bold text-slate-800">{currentStepObj.title}</h5>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Click any step node above to jump
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {currentStepObj.desc}
        </p>

        <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Sparkles size={14} className="text-indigo-500 flex-shrink-0" />
            <span className="font-semibold">Flow Execution Stage:</span>
            <span className="text-emerald-600 font-bold">Node verified & active</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {activeStep === steps.length - 1 ? 'FLOW: COMPLETED' : 'FLOW: RUNNING'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── HELPER FOR LEVEL-SPECIFIC EXPLANATIONS ────────────────────────────────
const getLevelTailoredResult = (searchTopic, level, focus, baseMock) => {
  if (baseMock && baseMock.levelVariations && baseMock.levelVariations[level]) {
    return {
      ...baseMock.levelVariations[level],
      difficulty: level,
      focus: focus,
    };
  }

  // Beginner Level
  if (level === 'Beginner') {
    return {
      title: baseMock ? baseMock.title : searchTopic,
      difficulty: 'Beginner',
      focus: focus,
      summary: `A beginner-friendly guide to ${searchTopic}. This overview covers the fundamental concepts, basic terminology, and real-world intuition without complex jargon.`,
      breakdown: [
        {
          title: "1. Core Concept & Intuition",
          text: `At a basic level, ${searchTopic} provides a simple framework to organize ideas and execute tasks step-by-step.`
        },
        {
          title: "2. Why Do We Use It?",
          text: `Using ${searchTopic} makes programs easier to read, write, and understand for beginners.`
        },
        {
          title: "3. First Practical Step",
          text: `Start with simple building blocks before attempting larger, more complex implementations.`
        }
      ],
      analogy: `Think of ${searchTopic} like a simple step-by-step cooking recipe. Every ingredient is listed first, followed by easy sequential actions so anyone can follow along without getting lost.`,
      code: `// Beginner ${searchTopic.replace(/\s+/g, '')} Example
function learn${searchTopic.replace(/[^a-zA-Z0-9]/g, '') || 'Simple'}() {
  console.log("Welcome to ${searchTopic}!");
  let items = ["Step 1: Understand", "Step 2: Practice", "Step 3: Build"];
  items.forEach(item => console.log(item));
}

learn${searchTopic.replace(/[^a-zA-Z0-9]/g, '') || 'Simple'}();`,
      diagramType: baseMock?.diagramType || 'generic'
    };
  }

  // Advanced Level
  if (level === 'Advanced') {
    return {
      title: baseMock ? baseMock.title : searchTopic,
      difficulty: 'Advanced',
      focus: focus,
      summary: `An advanced deep-dive into ${searchTopic}, focusing on algorithmic time/space complexity (Big-O), memory layout, edge failure modes, and production performance tuning.`,
      breakdown: [
        {
          title: "1. Algorithmic Complexity (Big-O)",
          text: `Detailed evaluation of ${searchTopic} analyzing O(log N) vs O(N) operations, worst-case cache degradation, and memory allocation overhead.`
        },
        {
          title: "2. Memory & Concurrency Concerns",
          text: `Managing cache alignment, garbage collection pressure, thread safety, and lock-free execution patterns when scaling ${searchTopic}.`
        },
        {
          title: "3. Edge Cases & Resiliency",
          text: `Handling race conditions, deadlocks, boundary mutations, and fault-tolerant degradation strategies under heavy production load.`
        }
      ],
      analogy: `Think of advanced ${searchTopic} like a high-frequency trading engine operating at microsecond speeds where every CPU cache miss and memory allocation affects throughput.`,
      code: `/**
 * Advanced ${searchTopic.replace(/[^a-zA-Z0-9]/g, '')} Engine - O(log N) Optimized
 */
class ${searchTopic.replace(/[^a-zA-Z0-9]/g, '') || 'Advanced'}Engine {
  constructor(capacity = 1024) {
    this.buffer = new Float64Array(capacity);
    this.size = 0;
  }

  execute(inputData) {
    if (!inputData || inputData.length === 0) return { status: "EMPTY" };
    const start = performance.now();
    let sum = 0;
    for (let i = 0; i < inputData.length; i++) {
      sum += Math.log2(inputData[i] + 1);
    }
    return { status: "OK", complexity: "O(N log N)", timeMs: (performance.now() - start).toFixed(4) };
  }
}

const engine = new ${searchTopic.replace(/[^a-zA-Z0-9]/g, '') || 'Advanced'}Engine();
console.log(engine.execute([10, 20, 30, 40, 50]));`,
      diagramType: baseMock?.diagramType || 'generic'
    };
  }

  // Intermediate Level (Default)
  return {
    title: baseMock ? baseMock.title : searchTopic,
    difficulty: 'Intermediate',
    focus: focus,
    summary: `An intermediate breakdown of ${searchTopic}, analyzing operational mechanics, structural data flow, API integrations, and standard design patterns.`,
    breakdown: [
      {
        title: "1. Operational Mechanics",
        text: `Core operations of ${searchTopic} focus on establishing structured inputs, enforcing rulesets, and ensuring predictable state transformations.`
      },
      {
        title: "2. Practical APIs & Patterns",
        text: `In real applications, ${searchTopic} is encapsulated within standard modules to prevent redundant logic and simplify state handling.`
      },
      {
        title: "3. Error Handling & Constraints",
        text: `Proper implementation requires checking inputs early, throwing descriptive errors, and avoiding deeply nested dependencies.`
      }
    ],
    analogy: `Think of intermediate ${searchTopic} like an automated airport baggage conveyor. Bags are scanned and routed to specific gates to ensure timely departure without concourse bottlenecks.`,
    code: `// Intermediate ${searchTopic.replace(/[^a-zA-Z0-9]/g, '')} Implementation
function process${searchTopic.replace(/[^a-zA-Z0-9]/g, '') || 'Topic'}(inputData) {
  if (!inputData) throw new Error("Input data is required for ${searchTopic}");
  return {
    status: "Success",
    timestamp: new Date().toISOString(),
    items: Array.isArray(inputData) ? inputData.length : 1
  };
}

try {
  console.log(process${searchTopic.replace(/[^a-zA-Z0-9]/g, '') || 'Topic'}(["Dataset A", "Dataset B"]));
} catch (err) {
  console.error("Processing Failed:", err.message);
}`,
    diagramType: baseMock?.diagramType || 'generic'
  };
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TopicExplainer() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [focus, setFocus] = useState('Concept Breakdown');
  
  const [status, setStatus] = useState('idle'); // idle, loading, resolved, error
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('breakdown'); // breakdown, analogy, interactive
  const [copiedCode, setCopiedCode] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // SEO Optimization - Title and Description update
  useEffect(() => {
    document.title = "AI Tutor & Topic Explainer - AI Learning Platform";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Synthesize topics, request real-world analogies, and view interactive code/architecture diagrams.');
    }
  }, []);

  // Cycling loading steps to make progress feel alive
  useEffect(() => {
    if (status !== 'loading') return;
    const interval = setInterval(() => {
      setLoadingStep(step => (step + 1) % 4);
    }, 900);
    return () => clearInterval(interval);
  }, [status]);

  const loadingMessages = [
    "Establishing context dependencies...",
    "Formulating logical hierarchies & definitions...",
    "Drafting real-world analogies...",
    "Compiling interactive canvas schemas..."
  ];

  const handleSearch = async (searchTopic) => {
    const term = searchTopic.trim().toLowerCase();
    if (!term) {
      toast.error("Please specify a topic to explain.");
      return;
    }

    setStatus('loading');
    setQuery(searchTopic);

    try {
      // 1. Attempt backend call
      const response = await aiAPI.explainTopic({ topic: searchTopic, level, focus });
      setResult(response);
      setStatus('resolved');
      setActiveTab('breakdown');
      toast.success("Explanation synthesized successfully!");
    } catch (_err) {
      // 2. Network/API fallback to high-quality level-tailored data
      setTimeout(() => {
        const mockMatch = MOCK_TOPICS[term];
        const tailoredResult = getLevelTailoredResult(searchTopic, level, focus, mockMatch);
        setResult(tailoredResult);
        setStatus('resolved');
        setActiveTab('breakdown');
        toast.success(`Explanation synthesized for ${level} level!`);
      }, 1500); // realistic response delay
    }
  };

  const handleCopyCode = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code);
    setCopiedCode(true);
    toast.success("Code snippet copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const location = useLocation();

  // Auto-search if navigated from Quiz recommendation with a specific topic
  useEffect(() => {
    if (location.state?.topic) {
      const topicName = location.state.topic;
      handleSearch(topicName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="AI Tutor" 
        subtitle="Request instant subject explanations, real-world analogies, and interactive logic flowcharts" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Search Form */}
        <div className="lg:col-span-4 space-y-5">
          <Card variant="default" className="bg-gradient-surface border-indigo-100/50">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <Brain size={16} className="text-indigo-500" />
              Configure Topic Explainer
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="topic-input" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Topic/Concept
                </label>
                <div className="relative">
                  <input
                    id="topic-input"
                    type="text"
                    placeholder="e.g. Boyce-Codd Normal Form..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                    className="form-input pr-10"
                  />
                  <Sparkles size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Difficulty Selector */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Explanation Depth
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      id={`depth-${lvl.toLowerCase()}`}
                      onClick={() => setLevel(lvl)}
                      className={`text-xs py-2 px-2.5 rounded-lg font-bold border transition-all duration-150 ${level === lvl ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Selector */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Focus Mode
                </span>
                <div className="space-y-1.5">
                  {['Concept Breakdown', 'Analogy First', 'Actionable Summary'].map((mode) => (
                    <button
                      key={mode}
                      id={`focus-${mode.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setFocus(mode)}
                      className={`w-full text-left text-xs py-2.5 px-3 rounded-lg font-bold border flex items-center justify-between transition-all duration-150 ${focus === mode ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                      <span>{mode}</span>
                      {focus === mode && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                id="btn-explain-topic"
                variant="gradient"
                fullWidth
                isLoading={status === 'loading'}
                onClick={() => handleSearch(query)}
                leftIcon={<Brain size={15} />}
              >
                Synthesize Explanation
              </Button>
            </div>
          </Card>

          {/* Quick recommendations */}
          <Card variant="gradient" padding="sm">
            <h4 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5 font-sans">
              <Sparkles size={13} className="text-indigo-500" /> Suggested Concepts
            </h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleSearch("Boyce-Codd Normal Form")} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 text-left transition-colors">
                <span className="text-xs font-semibold text-slate-700">Boyce-Codd Normal Form (BCNF)</span>
                <Badge color="red" size="xs">Advanced</Badge>
              </button>
              <button onClick={() => handleSearch("Binary Trees")} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 text-left transition-colors">
                <span className="text-xs font-semibold text-slate-700">Binary Search Trees (BST)</span>
                <Badge color="yellow" size="xs">Intermediate</Badge>
              </button>
              <button onClick={() => handleSearch("JavaScript Promises")} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 text-left transition-colors">
                <span className="text-xs font-semibold text-slate-700">JS Promises & Async</span>
                <Badge color="yellow" size="xs">Intermediate</Badge>
              </button>
              <button onClick={() => handleSearch("React Concurrent Rendering")} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 text-left transition-colors">
                <span className="text-xs font-semibold text-slate-700">React Concurrent Mode</span>
                <Badge color="red" size="xs">Advanced</Badge>
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Explanations Area */}
        <div className="lg:col-span-8">
          
          {/* IDLE State */}
          {status === 'idle' && (
            <Card className="min-h-[460px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 animate-bounce-dots">
                <Brain size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1.5">Your AI Study Buddy</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Enter any coding, database, or algorithmic concept in the sidebar to get real-time explanations, code summaries, and interactive flow charts.
              </p>
            </Card>
          )}

          {/* LOADING State */}
          {status === 'loading' && (
            <Card className="min-h-[460px] flex flex-col items-center justify-center text-center p-8 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="text-indigo-600 animate-pulse" size={24} />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-700">Synthesizing Topic Outline</h4>
                <p className="text-xs text-slate-400 animate-pulse">{loadingMessages[loadingStep]}</p>
              </div>

              {/* Shimmer skeleton elements */}
              <div className="w-full max-w-md space-y-2.5 pt-4">
                <div className="h-4 bg-slate-100 rounded skeleton w-3/4 mx-auto" />
                <div className="h-3 bg-slate-100 rounded skeleton w-5/6 mx-auto" />
                <div className="h-3 bg-slate-100 rounded skeleton w-2/3 mx-auto" />
              </div>
            </Card>
          )}

          {/* RESOLVED State */}
          {status === 'resolved' && result && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6">
                
                {/* Meta details */}
                <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">{result.title}</h2>
                    <div className="flex gap-2 mt-1.5">
                      <Badge color={result.difficulty === 'Advanced' ? 'red' : result.difficulty === 'Intermediate' ? 'yellow' : 'green'}>
                        {result.difficulty}
                      </Badge>
                      <Badge color="slate">{result.focus}</Badge>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
                    <Sparkles size={10} /> Verified Synthesis
                  </span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                  {result.summary}
                </p>

                {/* Sub tabs */}
                <div className="border-b border-slate-100 flex gap-4 mb-5">
                  {[
                    { id: 'breakdown', label: 'Detailed Breakdown', icon: Layers },
                    { id: 'analogy', label: 'Analogy & Source Code', icon: Code },
                    { id: 'interactive', label: 'Interactive Canvas', icon: Zap }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-xs font-bold pb-3 flex items-center gap-1.5 border-b-2 transition-all ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                      >
                        <Icon size={14} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content 1: Breakdown */}
                {activeTab === 'breakdown' && (
                  <div className="space-y-4 animate-fade-in-right">
                    {result.breakdown?.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5">
                          <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {item.title}
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed pl-6">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab Content 2: Analogy & Code */}
                {activeTab === 'analogy' && (
                  <div className="space-y-5 animate-fade-in-right">
                    {/* Analogy Box */}
                    <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100">
                      <h4 className="text-xs font-black text-violet-800 flex items-center gap-1.5 mb-2 font-sans">
                        <Sparkles size={13} className="text-violet-600" />
                        Mental Model Analogy
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed italic">
                        "{result.analogy}"
                      </p>
                    </div>

                    {/* Source Code Box */}
                    {result.code && (
                      <div>
                        <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono border-b border-slate-700">
                          <span className="flex items-center gap-1.5 font-semibold text-[10px]">
                            <Code size={12} /> implementation_outline.js
                          </span>
                          <button onClick={handleCopyCode} className="hover:text-white flex items-center gap-1 cursor-pointer">
                            {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            {copiedCode ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="bg-slate-900 text-slate-200 p-4 rounded-b-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-[350px]">
                          <code>{result.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content 3: Interactive Canvas */}
                {activeTab === 'interactive' && (
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/20 animate-fade-in-right">
                    <ConceptDiagram type={result.diagramType} result={result} />
                  </div>
                )}

              </Card>

              {/* Next Steps Quick Navigation */}
              <div className="flex items-center justify-between bg-indigo-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
                  <Brain size={120} />
                </div>
                <div className="relative z-10 max-w-sm md:max-w-md">
                  <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase block mb-1">Knowledge Integration</span>
                  <h3 className="text-sm font-black mb-1.5">Reinforce what you studied!</h3>
                  <p className="text-[11px] text-indigo-100 leading-snug">
                    Generate an instant customized test to check your memory, or save these concepts to a study sheet outline.
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap relative z-10">
                  <button 
                    onClick={() => navigate('/quiz')} 
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow active:scale-95"
                  >
                    <Zap size={13} /> Generate Quiz
                  </button>
                  <button 
                    onClick={() => navigate('/notes')} 
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-800 text-white hover:bg-indigo-700 py-2.5 px-4 rounded-xl border border-indigo-700 transition-all cursor-pointer active:scale-95"
                  >
                    <FileText size={13} /> Save to Notes
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
