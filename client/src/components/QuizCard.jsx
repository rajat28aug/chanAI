import { motion } from 'framer-motion';
import { Clock, BookOpen, Play, Award } from 'lucide-react';
import AnimatedCard from './AnimatedCard.jsx';

export default function QuizCard({ quiz, onStart }) {
  const difficultyColors = {
    easy: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      gradient: 'from-green-400 to-emerald-500'
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      gradient: 'from-yellow-400 to-amber-500'
    },
    hard: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      gradient: 'from-red-400 to-rose-500'
    }
  };

  const difficulty = quiz.difficulty?.toLowerCase() || 'medium';
  const colors = difficultyColors[difficulty] || difficultyColors.medium;

  return (
    <AnimatedCard hover className="p-6 h-full flex flex-col group cursor-pointer" delay={0}>
      {/* Header with Gradient Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors">
            {quiz.title || 'Untitled Quiz'}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {quiz.difficulty || 'Medium'}
            </motion.span>
            {quiz.subject && (
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200"
              >
                {quiz.subject}
              </motion.span>
            )}
          </div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}
        >
          <Award className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span className="font-medium">{quiz.questionCount || quiz.questions?.length || 0} questions</span>
        </motion.div>
        {quiz.timeLimit && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"
          >
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="font-medium">{quiz.timeLimit} min</span>
          </motion.div>
        )}
      </div>

      {/* Description */}
      {quiz.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
          {quiz.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(quiz)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg group/btn"
        >
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Play className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
          </motion.div>
          <span>Start Quiz</span>
        </motion.button>
      </div>
    </AnimatedCard>
  );
}
