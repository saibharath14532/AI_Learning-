import React from 'react';
import AnswerOption from './AnswerOption';
import Card from '../common/Card';
import Input from '../common/Input';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  questionType,
}) {
  if (!question) return null;

  return (
    <Card className="shadow-sm">
      <div className="space-y-6">
        {/* Question Text */}
        <h3 className="text-base md:text-lg font-bold text-slate-900 leading-relaxed">
          {question.question}
        </h3>

        {/* Input Interface based on Question Type */}
        {questionType === 'Fill in the Blanks' ? (
          <div className="pt-2">
            <Input
              label="Your Answer"
              placeholder="Type your answer here..."
              value={selectedAnswer || ''}
              onChange={(e) => onAnswerSelect(e.target.value)}
              className="max-w-md"
            />
            <p className="text-[11px] text-slate-400 mt-2">
              Note: Answers are evaluated case-insensitively. Ensure spelling is correct.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {question.options.map((option, idx) => (
              <AnswerOption
                key={idx}
                letter={LETTERS[idx] || (idx + 1).toString()}
                text={option}
                isSelected={
                  selectedAnswer !== undefined &&
                  selectedAnswer !== null &&
                  parseInt(selectedAnswer, 10) === idx
                }
                onClick={() => onAnswerSelect(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
