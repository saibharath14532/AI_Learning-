import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle, XCircle, Clock, BookOpen, RefreshCw, LayoutDashboard, Brain, ChevronDown } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export default function QuizResultPage() {
  const navigate = useNavigate();
  const { quizResult, exitQuiz } = useQuiz();
  const reviewRef = useRef(null);

  // SEO Update
  useEffect(() => {
    document.title = "Quiz Results - AI Learning Platform";
  }, []);

  if (!quizResult) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Quiz Results" subtitle="Your performance outline" />
        <Card className="py-16">
          <EmptyState
            icon={Trophy}
            title="No Results Found"
            description="Complete a quiz attempt first to see your performance results here."
            actionText="Go to Quiz Generator"
            onAction={() => navigate('/quiz')}
          />
        </Card>
      </div>
    );
  }

  const {
    title,
    topic,
    score,
    total,
    percentage,
    timeTaken,
    strongTopics = [],
    weakTopics = [],
    reviewDetails = [],
    correctAnswers,
    incorrectAnswers,
    unanswered = 0,
  } = quizResult;

  const displayCorrect = correctAnswers !== undefined ? correctAnswers : score;
  const displayIncorrect = incorrectAnswers !== undefined ? incorrectAnswers : (total - score);
  const weakTopic = weakTopics && weakTopics.length > 0 ? weakTopics[0] : topic;

  const handleStudyWeakTopic = () => {
    navigate('/ai-tutor', { state: { topic: weakTopic } });
  };

  const handleRetake = () => {
    exitQuiz();
    navigate('/quiz');
  };

  const handleBackToDashboard = () => {
    exitQuiz();
    navigate('/dashboard');
  };

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-24">
      <PageHeader
        title="Quiz Completed!"
        subtitle={`Summary scorecard for ${title}`}
      />

      {/* Main Score Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Score Banner Card */}
        <Card variant="gradient" className="md:col-span-1 flex flex-col items-center justify-center text-center p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
            <Trophy size={28} />
          </div>
          <span className="text-xs font-black text-indigo-600 tracking-wider uppercase mb-1">
            Your Final Score
          </span>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-1">
            {percentage}%
          </h2>
          <p className="text-sm font-bold text-slate-500">
            {displayCorrect} / {total} Questions Correct
          </p>
        </Card>

        {/* Quick Metrics Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col justify-between p-5 border-l-4 border-l-emerald-500 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Correct Answers
            </span>
            <div className="flex items-end justify-between mt-4">
              <span className="text-2xl font-black text-slate-800">{displayCorrect}</span>
              <CheckCircle className="text-emerald-500" size={24} />
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5 border-l-4 border-l-rose-500 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Incorrect Answers
            </span>
            <div className="flex items-end justify-between mt-4">
              <span className="text-2xl font-black text-slate-800">{displayIncorrect}</span>
              <XCircle className="text-rose-500" size={24} />
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5 border-l-4 border-l-blue-500 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Time Taken
            </span>
            <div className="flex items-end justify-between mt-4">
              <span className="text-2xl font-black text-slate-800">{timeTaken}</span>
              <Clock className="text-blue-500" size={24} />
            </div>
          </Card>
        </div>
      </div>

      {/* AI Personalized Recommendation Banner */}
      {weakTopics.length > 0 && (
        <div className="bg-indigo-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
            <Brain size={120} />
          </div>
          <div className="relative z-10 max-w-xl">
            <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase block mb-1">
              AI Study Assistant Recommendation
            </span>
            <h3 className="text-sm font-black mb-1">Based on your performance:</h3>
            <p className="text-[11px] text-indigo-100 leading-snug">
              You scored lower on <b>{weakTopic}</b>. We recommend reviewing <b>{weakTopic}</b> before attempting another quiz.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleStudyWeakTopic}
              leftIcon={<BookOpen size={13} />}
              className="bg-white hover:bg-indigo-50 text-indigo-900 border-none font-bold"
            >
              Study {weakTopic}
            </Button>
          </div>
        </div>
      )}

      {/* Performance by Topic (Competency breakdown) */}
      <Card className="shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-4">Competency Map</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strong Areas */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Strong Areas</h4>
            {strongTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {strongTopics.map((topic, i) => (
                  <Badge key={i} color="success" size="sm">
                    {topic}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No areas scored above 80% yet. Keep studying!</p>
            )}
          </div>

          {/* Needs Improvement */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Needs Improvement</h4>
            {weakTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((topic, i) => (
                  <Badge key={i} color="warning" size="sm">
                    {topic}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No weak topics! Excellent work.</p>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Action Navigation Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={scrollToReview} leftIcon={<ChevronDown size={14} />}>
          Review Answers
        </Button>
        <Button variant="outline" size="sm" onClick={handleRetake} leftIcon={<RefreshCw size={14} />}>
          Generate New Quiz
        </Button>
        <Button variant="outline" size="sm" onClick={handleBackToDashboard} leftIcon={<LayoutDashboard size={14} />}>
          Back to Dashboard
        </Button>
      </div>

      {/* Answer Review Section */}
      <div ref={reviewRef} className="pt-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
          Detailed Question Review
        </h3>

        <div className="space-y-5">
          {reviewDetails.map((item, idx) => {
            const isCorrect = item.isCorrect;
            
            // Format values to readable string representation
            const getUserAnswerText = () => {
              if (item.userAnswer === null || item.userAnswer === undefined) return 'No answer provided';
              if (item.options.length === 0) return item.userAnswer; // Fill in
              return `${LETTERS[item.userAnswer]}. ${item.options[item.userAnswer]}`;
            };

            const getCorrectAnswerText = () => {
              if (item.options.length === 0) return item.correctAnswer; // Fill in
              return `${LETTERS[item.correctAnswer]}. ${item.options[item.correctAnswer]}`;
            };

            const LETTERS = ['A', 'B', 'C', 'D'];

            return (
              <Card
                key={idx}
                className={`border-l-4 shadow-sm ${
                  isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'
                }`}
              >
                <div className="space-y-3">
                  {/* Title & Badge */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                    <Badge color={isCorrect ? 'success' : 'error'} size="xs">
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>

                  {/* Question Prompt */}
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    {item.question}
                  </p>

                  {/* Answers Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-50">
                    <div className="p-2.5 rounded-lg bg-slate-50/50">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">
                        Your Answer
                      </span>
                      <span
                        className={`font-semibold ${
                          isCorrect ? 'text-emerald-700' : 'text-rose-700 font-bold'
                        }`}
                      >
                        {getUserAnswerText()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-indigo-50/20 border border-indigo-50/50">
                      <span className="text-[10px] text-indigo-400 uppercase font-black tracking-wider block mb-1">
                        Correct Answer
                      </span>
                      <span className="font-semibold text-slate-800">
                        {getCorrectAnswerText()}
                      </span>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg leading-relaxed mt-2">
                    <span className="font-bold text-slate-700 block mb-0.5">Explanation:</span>
                    {item.explanation}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

