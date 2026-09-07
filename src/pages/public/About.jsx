import { Link } from 'react-router-dom';
import { Sparkles, Award, Users, BookOpen } from 'lucide-react';
import Button from '../../components/common/Button';

export default function About() {
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
            <Link to="/features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">Project Story</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">About the Platform</h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">An advanced personalized tutoring framework engineered for modern academic curriculums and technical training.</p>
        </div>

        <div className="card space-y-6 mb-12">
          <h2 className="text-xl font-bold text-slate-900">Final Year MCA Project</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            This AI-Powered Personalized Learning Platform represents a final year Master of Computer Applications (MCA) project. It is conceptualized to solve the standard issues associated with uniform learning environments by providing:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 text-sm">
            <li className="flex items-start gap-2.5">
              <BookOpen size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
              <span><strong>Modular Explanations:</strong> Break down complex topics dynamically to target learning speeds.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Award size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
              <span><strong>Gamified Learning:</strong> Encourage daily consistency through study streaks and interactive testing.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Users size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
              <span><strong>Adaptive Roadmap Generation:</strong> Generate multi-phased custom timelines tailored to current experience levels.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Sparkles size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
              <span><strong>AI Doubt Clearance:</strong> Address database queries, compilation issues, and analytical problems.</span>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-gradient-soft border-indigo-100 text-center">
            <h3 className="font-bold text-indigo-950 mb-1">Architecture</h3>
            <p className="text-indigo-900/80 text-xs">Vite + React frontend with isolated service controllers ready to plug into Node/Python REST APIs.</p>
          </div>
          <div className="card bg-gradient-soft border-indigo-100 text-center">
            <h3 className="font-bold text-indigo-950 mb-1">Cognitive Models</h3>
            <p className="text-indigo-900/80 text-xs">Structured prompt architecture utilizing Gemini API models to parse subjects and format structured JSON responses.</p>
          </div>
          <div className="card bg-gradient-soft border-indigo-100 text-center">
            <h3 className="font-bold text-indigo-950 mb-1">Modern UI/UX</h3>
            <p className="text-indigo-900/80 text-xs">Tailwind CSS tokens, native responsive layouts, dashboard widgets, and custom state hooks.</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-500 text-sm mb-6">Ready to see the platform in action?</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="primary">Create Student Account</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Sign In (Demo)</Button>
            </Link>
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
