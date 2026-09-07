import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import QuizProgress from '../../components/quiz/QuizProgress';
import QuestionCard from '../../components/quiz/QuestionCard';
import { toast } from 'react-hot-toast';

export default function QuizAttempt() {
  const navigate = useNavigate();
  const {
    activeQuiz,
    userAnswers,
    timeLeft,
    isSubmitting,
    saveAnswer,
    submitQuiz,
    exitQuiz,
  } = useQuiz();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // SEO Update
  useEffect(() => {
    if (activeQuiz) {
      document.title = `Attempting: ${activeQuiz.title} - AI Learning Platform`;
    }
  }, [activeQuiz]);

  // Loading text cycling during submission evaluation
  useEffect(() => {
    if (!isSubmitting) return;
    const interval = setInterval(() => {
      setLoadingStep(step => (step + 1) % 4);
    }, 450);
    return () => clearInterval(interval);
  }, [isSubmitting]);

  // Automatically submit when timer hits zero
  const handleTimeUp = async () => {
    toast.error("Time's up! Submitting your answers automatically...", { duration: 4000 });
    try {
      await submitQuiz();
      navigate('/quiz/result');
    } catch {
      toast.error('Submission failed. Please try again.');
    }
  };

  const handleNext = () => {
    if (currentIdx < activeQuiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitQuiz();
      toast.success('Quiz submitted successfully!');
      navigate('/quiz/result');
    } catch {
      toast.error('Error submitting quiz.');
    }
  };

  const handleConfirmExit = () => {
    exitQuiz();
    setShowExitDialog(false);
    navigate('/quiz');
  };

  const submitMessages = [
    "Evaluating answers against AI key...",
    "Calculating performance metrics...",
    "Synthesizing personalized feedback recommendations...",
    "Finalizing scorecard outline..."
  ];

  // Submission loading state
  if (isSubmitting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <Card className="max-w-md w-full p-8 flex flex-col items-center justify-center gap-6 shadow-lg border-indigo-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="text-indigo-600 animate-pulse" size={26} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-slate-800">Submitting your quiz...</h3>
            <p className="text-sm text-slate-500 min-h-[40px] px-4 leading-relaxed font-medium">
              {submitMessages[loadingStep]}
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${(loadingStep + 1) * 25}%` }}
            />
          </div>
        </Card>
      </div>
    );
  }

  // No active quiz - Empty State
  if (!activeQuiz) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quiz Attempt" subtitle="Complete your personalized evaluation" />
        <Card className="py-16">
          <EmptyState
            icon={HelpCircle}
            title="No Active Quiz Found"
            description="You need to configure and generate a quiz first before attempting it."
            actionText="Go to Quiz Generator"
            onAction={() => navigate('/quiz')}
          />
        </Card>
      </div>
    );
  }

  const currentQuestion = activeQuiz.questions[currentIdx];
  const selectedAnswer = userAnswers[currentQuestion.id];
  const totalQuestions = activeQuiz.questions.length;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto pb-12">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {activeQuiz.type}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">{activeQuiz.title}</h2>
        </div>
        <div className="flex gap-2">
          <Badge>{activeQuiz.difficulty}</Badge>
          <Button variant="outline" size="sm" onClick={() => setShowExitDialog(true)}>
            Exit Quiz
          </Button>
        </div>
      </div>

      {/* Progress & Timer Bar */}
      <QuizProgress
        currentQuestionIndex={currentIdx}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        onTimeUp={handleTimeUp}
      />

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={(ans) => saveAnswer(currentQuestion.id, ans)}
        questionType={activeQuiz.type}
      />

      {/* Bottom Nav Controls */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          leftIcon={<ChevronLeft size={16} />}
        >
          Previous
        </Button>

        {currentIdx === totalQuestions - 1 ? (
          <Button
            variant="primary"
            onClick={handleSubmit}
            leftIcon={<CheckCircle2 size={16} />}
            className="shadow-md"
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleNext}
            rightIcon={<ChevronRight size={16} />}
          >
            Next
          </Button>
        )}
      </div>

      {/* Exit Quiz Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={handleConfirmExit}
        title="Exit Active Quiz?"
        message="Your progress will be discarded. Are you sure you want to stop this attempt?"
        confirmLabel="Exit and Discard"
        cancelLabel="Keep Attempting"
        variant="danger"
      />
    </div>
  );
}

