import { Link } from 'react-router-dom';
import { Sparkles, Brain, Zap, Map, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base leading-none block">AI Learning</span>
              <span className="text-indigo-600 text-[10px] font-semibold leading-none">PLATFORM</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</Link>
            <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">About Us</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="gradient" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-pink-500 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold tracking-wide mb-6 backdrop-blur-md border border-white/5 animate-fade-in">
            <Sparkles size={13} className="text-indigo-400" /> Powered by Gemini AI API
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight mb-6 animate-fade-in">
            Learn Smarter and Faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-400">Personalized AI Tutoring</span>
          </h1>
          <p className="text-lg text-indigo-100/80 max-w-2xl mx-auto mb-10 animate-fade-in">
            Accelerate your education. Generate customized study roadmaps, interactive quizzes, dynamic flashcards, and instant explanations tailored to your learning style.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link to="/register">
              <Button variant="gradient" size="lg" rightIcon={<ArrowRight size={18} />}>
                Start Learning Now
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-extrabold text-indigo-600">98%</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Study efficiency boost</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-indigo-600">10k+</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Quizzes generated</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-indigo-600">5k+</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Custom roadmaps active</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-indigo-600">24/7</p>
              <p className="text-sm font-medium text-slate-500 mt-1">AI assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Everything you need to master any subject</h2>
          <p className="text-slate-500 mt-3">We combine top-tier cognitive models with robust educational frameworks to deliver an adaptive learning experience.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card card-interactive">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-5">
              <Brain size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Topic Explainer</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Stuck on a complex concept? Get modular summaries, analogies, and code snippets generated by AI in seconds.
            </p>
          </div>
          <div className="card card-interactive">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-5">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Doubt Solver</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Submit your database queries or technical question. Get precise answers, architectural patterns, and diagnostic steps immediately.
            </p>
          </div>
          <div className="card card-interactive">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-5">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Quiz Generator</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Test your understanding. Dynamically generate quizzes based on any topic with instant feedback, scoring, and performance tracking.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-100/60 py-20 lg:py-28 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">How the Platform Works</h2>
            <p className="text-slate-500 mt-3">Four simple steps to transform your learning potential.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative">
              <span className="text-6xl font-black text-indigo-100 absolute -top-8 left-0 select-none">01</span>
              <div className="relative z-10 pt-4">
                <h4 className="font-bold text-slate-900 text-lg mb-2">Create Account</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Register in seconds with your name, email, and choose your current skill tier.</p>
              </div>
            </div>
            <div className="relative">
              <span className="text-6xl font-black text-indigo-100 absolute -top-8 left-0 select-none">02</span>
              <div className="relative z-10 pt-4">
                <h4 className="font-bold text-slate-900 text-lg mb-2">Set Learning Goals</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Enter target subjects like Database Management, React Design Patterns, or System Architecture.</p>
              </div>
            </div>
            <div className="relative">
              <span className="text-6xl font-black text-indigo-100 absolute -top-8 left-0 select-none">03</span>
              <div className="relative z-10 pt-4">
                <h4 className="font-bold text-slate-900 text-lg mb-2">Generate Study Tools</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Create structured learning roadmaps, note sets, flashcards, and step-by-step challenges on demand.</p>
              </div>
            </div>
            <div className="relative">
              <span className="text-6xl font-black text-indigo-100 absolute -top-8 left-0 select-none">04</span>
              <div className="relative z-10 pt-4">
                <h4 className="font-bold text-slate-900 text-lg mb-2">Track & Succeed</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Keep your daily learning streak alive, review study analytics, and download verify-ready completion certificates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-indigo-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Ready to accelerate your final year preparation?</h2>
          <p className="text-indigo-200 max-w-xl mx-auto mb-8 text-sm">Join thousands of students leveraging generative AI to make study cycles shorter and grades higher.</p>
          <Link to="/register">
            <Button variant="gradient" size="lg">Get Free Access</Button>
          </Link>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs">
        <p>© {new Date().getFullYear()} AI-Powered Personalized Learning Platform. Final Year MCA Project.</p>
      </footer>
    </div>
  );
}
