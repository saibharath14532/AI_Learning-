import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Brain, ArrowRight, HelpCircle } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { toast } from 'react-hot-toast';

const EXAMPLE_TOPICS = [
  'Data Structures',
  'DBMS Normalization',
  'JavaScript Promises',
  'Object-Oriented Programming',
  'Algorithms',
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const QUESTION_TYPES = ['Multiple Choice', 'True / False', 'Fill in the Blanks'];
const QUESTION_COUNTS = [5, 10, 15, 20];
const LEARNING_GOALS = ['Practice', 'Exam Preparation', 'Interview Preparation', 'Revision'];

export default function QuizGenerator() {
  const navigate = useNavigate();
  const { startQuiz, isGenerating } = useQuiz();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionType, setQuestionType] = useState('Multiple Choice');
  const [questionCount, setQuestionCount] = useState(10);
  const [learningGoal, setLearningGoal] = useState('Practice');
  const [loadingStep, setLoadingStep] = useState(0);

  // SEO Update
  useEffect(() => {
    document.title = "AI Quiz Generator - AI Learning Platform";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Generate customized quizzes on any coding or database topic tailored to your skill level.');
    }
  }, []);

  // Cycling loading steps for AI simulation
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingStep((step) => (step + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please specify a quiz topic or select an example below.');
      return;
    }

    try {
      await startQuiz(topic, difficulty, questionType, questionCount, learningGoal);
      toast.success('Quiz generated successfully!');
      navigate('/quiz/attempt');
    } catch {
      toast.error('Failed to generate quiz. Please try again.');
    }
  };

  const loadingMessages = [
    `Analyzing topic "${topic}" ...`,
    `Filtering questions for ${difficulty} level ...`,
    `Structuring ${questionType} quiz templates ...`,
    `Aligning to goal: ${learningGoal} ...`
  ];

  if (isGenerating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <Card className="max-w-md w-full p-8 flex flex-col items-center justify-center gap-6 shadow-lg border-indigo-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="text-indigo-600 animate-pulse" size={26} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-slate-800">AI is generating your quiz...</h3>
            <p className="text-sm text-slate-500 min-h-[40px] px-4 leading-relaxed font-medium">
              {loadingMessages[loadingStep]}
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${(loadingStep + 1) * 25}%` }}
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        title="AI Quiz Generator"
        subtitle="Test your understanding with an AI-generated quiz tailored to your learning level."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Config Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Brain size={16} className="text-indigo-500" />
                  What topic do you want to be tested on?
                </label>
                <Input
                  id="quiz-topic"
                  placeholder="e.g. Data Structures, SQL Joins, JS Promises..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-800">Difficulty</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`text-xs md:text-sm font-bold py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
                        difficulty === level
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Type */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-800">Question Type</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {QUESTION_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setQuestionType(type)}
                      className={`text-xs md:text-sm font-bold py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
                        questionType === type
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-800">Number of Questions</label>
                <div className="grid grid-cols-4 gap-2">
                  {QUESTION_COUNTS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`text-xs md:text-sm font-bold py-2.5 px-2 rounded-xl border transition-all cursor-pointer ${
                        questionCount === count
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Goal */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-800">
                  Learning Goal <span className="text-xs text-slate-400 font-medium">(Optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {LEARNING_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setLearningGoal(goal)}
                      className={`text-xs font-bold py-2 px-3.5 rounded-full border transition-all cursor-pointer ${
                        learningGoal === goal
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Action */}
              <Button
                id="btn-generate-quiz"
                type="submit"
                variant="gradient"
                fullWidth
                size="lg"
                leftIcon={<Zap size={16} />}
              >
                Generate Quiz
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Information & Example Selection */}
        <div className="space-y-5">
          {/* Quick Topics Card */}
          <Card className="bg-slate-50/50 border-slate-100">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-500" />
              Quick Select Topics
            </h3>
            <div className="flex flex-col gap-2">
              {EXAMPLE_TOPICS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className="text-left w-full p-2.5 rounded-xl bg-white border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 text-xs font-bold text-slate-700 hover:text-indigo-900 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>{item}</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-indigo-600 transition-all" />
                </button>
              ))}
            </div>
          </Card>

          {/* Guidelines info */}
          <Card variant="gradient" padding="sm" className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <HelpCircle size={14} className="text-indigo-600" />
              Smart Evaluation
            </h4>
            <div className="text-[11px] text-slate-600 space-y-2 leading-relaxed font-medium">
              <p>
                Quizzes are timed at <b>1.5 minutes per question</b>.
              </p>
              <p>
                Evaluations provide detailed answers, performance categories, and weak topic analysis.
              </p>
              <p>
                Review recomendations to dynamically load targeted concepts in the AI Tutor.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

