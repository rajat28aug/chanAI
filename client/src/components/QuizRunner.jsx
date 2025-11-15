import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Card from './Card.jsx';

export default function QuizRunner({ quiz, onClose, onSubmit }) {
  // Safety check: ensure quiz has questions
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Questions Available</h3>
            <p className="text-gray-600 mb-6">
              This quiz doesn't have any questions. Please try generating a new quiz.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswer = (questionIndex, answerIndex) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    
    let score = 0;
    const questionResults = quiz.questions.map((q, i) => {
      const userAnswer = answers[i];
      const isCorrect = userAnswer === q.answer || userAnswer === q.correctAnswer;
      if (isCorrect) score++;
      return {
        question: q.question,
        userAnswer: userAnswer !== undefined ? q.options[userAnswer] : null,
        correctAnswer: q.options[q.answer] || q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      };
    });

    setIsSubmitted(true);
    setResults({
      score,
      total: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
      questionResults
    });

    // Submit to backend
    if (onSubmit) {
      await onSubmit({
        quizId: quiz.id,
        score,
        total: quiz.questions.length,
        answers,
        timeTakenSec: quiz.timeLimit ? (quiz.timeLimit * 60 - timeRemaining) : 0
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  if (results) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  results.percentage >= 70 ? 'bg-green-100' : results.percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                }`}
              >
                <span className="text-4xl font-bold">
                  {results.percentage >= 70 ? '🎉' : results.percentage >= 50 ? '👍' : '📚'}
                </span>
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
              <div className="text-5xl font-bold text-indigo-600 mb-2">
                {results.score} / {results.total}
              </div>
              <div className="text-xl text-gray-600">{results.percentage}% Correct</div>
            </div>

            {/* Results */}
            <div className="space-y-4 mb-6">
              {results.questionResults.map((result, index) => (
                <Card key={index} hover={false} className="p-4">
                  <div className="flex items-start gap-3">
                    {result.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">
                        Question {index + 1}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{result.question}</div>
                      <div className="text-sm">
                        <span className="text-gray-500">Your answer: </span>
                        <span className={result.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {result.userAnswer || 'Not answered'}
                        </span>
                      </div>
                      {!result.isCorrect && (
                        <div className="text-sm mt-1">
                          <span className="text-gray-500">Correct answer: </span>
                          <span className="text-green-600 font-medium">{result.correctAnswer}</span>
                        </div>
                      )}
                      {result.explanation && (
                        <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded-lg">
                          {result.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 z-50 overflow-y-auto"
    >
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{quiz.title || 'Quiz'}</h2>
              <div className="text-sm text-gray-600 mt-1">
                Question {currentIndex + 1} of {quiz.questions.length}
              </div>
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-gray-800">{formatTime(timeRemaining)}</span>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  {currentQuestion.question}
                </h3>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentIndex] === index;
                    const isAnswered = answers[currentIndex] !== undefined;
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(currentIndex, index)}
                        disabled={isSubmitted}
                        className={`
                          w-full text-left p-4 rounded-xl border-2 transition-all
                          ${isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                            : 'border-gray-200 hover:border-indigo-300 bg-white text-gray-800'
                          }
                          ${isSubmitted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                            ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}
                          `}>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-medium">{option}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </motion.button>

            <div className="flex gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`
                    w-10 h-10 rounded-lg font-semibold transition-all
                    ${index === currentIndex
                      ? 'bg-indigo-600 text-white'
                      : answers[index] !== undefined
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentIndex === quiz.questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isSubmitted || Object.keys(answers).length < quiz.questions.length}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                Submit Quiz
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

