import { Link } from 'react-router-dom';
import { Sparkles, Brain, Zap, Map, Layers, FileText, BarChart2, Flame } from 'lucide-react';
import Button from '../../components/common/Button';

const FEATURE_LIST = [
  {
    icon: Brain,
    title: 'AI Tutor & Topic Explainer',
    description: 'Generates detailed modular summaries on any technical or academic subject. Instantly toggles between basic analogies and structured diagrams.',
  },
  {
    icon: Zap,
    title: 'Instant Doubt Resolver',
    description: 'Designed specifically for technical doubt resolution. Analyzes database configurations, SQL statements, and compilation warnings, proposing fixes immediately.',
  },
  {
    icon: Map,
    title: 'Custom Learning Roadmaps',
    description: 'Outputs multi-tiered, step-by-step progress checklists with timing indicators and verified references so you can target learning gaps systematically.',
  },
  {
    icon: Layers,
    title: 'Smart Flashcard Decks',
    description: 'Creates responsive flashcard cards on demand. Built-in flip animations allow students to test key definitions and self-verify concepts.',
  },
  {
    icon: FileText,
    title: 'Dynamic Note Compiler',
    description: 'Synthesizes clean study outlines. Features standard formatting structures, code highlights, and support for downloading references.',
  },
  {
    icon: BarChart2,
    title: 'Visual Study Analytics',
    description: 'Tracks weekly learning duration, topic quiz scores, and subject competencies. Features responsive line and bar chart widgets.',
  },
  {
    icon: Flame,
    title: 'Streak & Gamification',
    description: 'Build consistency. Displays daily streak tickers, rewards active students, and enables certificate collection upon learning accomplishments.',
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-decoration-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base leading-none block">AI Learning</span>
                <span className="text-indigo-600 text-[10px] font-semibold leading-none">PLATFORM</span>
              </div>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Home</Link>
            <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">About Us</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">Core Capabilities</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">Features Overview</h1>
            <p className="text-slate-500 text-base">Unleash structured learning utilities designed to accelerate final-year exam preparation, coding skills, and theoretical reviews.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURE_LIST.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card card-interactive flex flex-col items-start">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="card max-w-2xl mx-auto bg-gradient-to-r from-indigo-900 to-indigo-950 text-white p-8">
              <h2 className="text-xl font-bold mb-2">Want to try them live?</h2>
              <p className="text-indigo-200 text-xs mb-6 max-w-md mx-auto">Create a mock account to test subject generation, dashboard widgets, and study statistics.</p>
              <div className="flex items-center justify-center gap-3">
                <Link to="/register">
                  <Button variant="gradient">Create Free Account</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Sign In (Demo)</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs mt-auto">
        <p>© {new Date().getFullYear()} AI-Powered Personalized Learning Platform. Final Year MCA Project.</p>
      </footer>
    </div>
  );
}
