import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  TrendingUp, 
  Clock,
  AlertCircle,
  Play,
  ClipboardList,
  X,
  Loader2
} from 'lucide-react';
import api from '../utils/api.js';
import PageTemplate from '../components/PageTemplate.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';
import MotionContainer, { MotionItem } from '../components/MotionContainer.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import QuizCard from '../components/QuizCard.jsx';
import QuizRunner from '../components/QuizRunner.jsx';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSource, setCreateSource] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/quizzes');
      setQuizzes(response.data.quizzes || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes. Please try again.');
      // Fallback to mock data for UI demonstration
      setQuizzes(getMockQuizzes());
    } finally {
      setLoading(false);
    }
  };

  const getMockQuizzes = () => [
    {
      id: '1',
      title: 'Introduction to React',
      subject: 'Web Development',
      difficulty: 'Easy',
      questionCount: 10,
      timeLimit: 15,
      description: 'Test your knowledge of React fundamentals and core concepts',
      questions: []
    },
    {
      id: '2',
      title: 'Advanced JavaScript Concepts',
      subject: 'Programming',
      difficulty: 'Hard',
      questionCount: 15,
      timeLimit: 30,
      description: 'Challenge yourself with advanced JS topics and patterns',
      questions: []
    },
    {
      id: '3',
      title: 'Database Design Principles',
      subject: 'Database',
      difficulty: 'Medium',
      questionCount: 12,
      timeLimit: 20,
      description: 'Master database design and normalization techniques',
      questions: []
    }
  ];

  const handleStartQuiz = async (quiz) => {
    try {
      // Fetch full quiz details if not already loaded
      if (!quiz.questions || quiz.questions.length === 0) {
        const response = await api.get(`/quizzes/${quiz.id}`);
        setSelectedQuiz(response.data.quiz || quiz);
      } else {
        setSelectedQuiz(quiz);
      }
    } catch (err) {
      console.error('Error loading quiz:', err);
      // Use mock questions for demonstration
      setSelectedQuiz({
        ...quiz,
        questions: getMockQuestions(quiz.questionCount || 10)
      });
    }
  };

  const getMockQuestions = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      question: `Sample question ${i + 1}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 0,
      correctAnswer: 'Option A',
      explanation: 'This is a sample explanation for the correct answer.'
    }));
  };

  const handleSubmitQuiz = async (result) => {
    try {
      await api.post(`/quizzes/${result.quizId}/submit`, result);
      // Refresh quizzes list
      fetchQuizzes();
    } catch (err) {
      console.error('Error submitting quiz:', err);
      // Still submit to analytics endpoint as fallback
      try {
        await api.post('/quiz/result', {
          score: result.score,
          total: result.total,
          topic: selectedQuiz?.title || 'Quiz',
          timeTakenSec: result.timeTakenSec
        });
      } catch (e) {
        console.error('Error saving to analytics:', e);
      }
    }
  };

  const handleCreateQuiz = async () => {
    if (!createSource.trim()) return;
    
    try {
      setCreating(true);
      const response = await api.post('/quiz', {
        text: createSource,
        numQuestions: 10
      });
      
      const newQuiz = {
        id: Date.now().toString(),
        title: 'Generated Quiz',
        subject: 'General',
        difficulty: 'Medium',
        questionCount: response.data.quiz?.length || 10,
        timeLimit: 15,
        description: 'Quiz generated from your text',
        questions: response.data.quiz || []
      };
      
      setQuizzes(prev => [newQuiz, ...prev]);
      setShowCreateModal(false);
      setCreateSource('');
      setSelectedQuiz(newQuiz);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError('Failed to create quiz. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             quiz.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesSubject = selectedSubject === 'all' || 
                          quiz.subject?.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesDifficulty && matchesSubject;
  });

  const subjects = [...new Set(quizzes.map(q => q.subject).filter(Boolean))];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  return (
    <PageTemplate
      title="Quizzes"
      subtitle="Test your knowledge and track your progress"
      icon={ClipboardList}
    >
      {/* Search and Filters */}
      <AnimatedCard delay={0.1} className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                placeholder="Search quizzes by title, subject, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(d => (
                  <option key={d} value={d.toLowerCase()}>{d}</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            {subjects.length > 0 && (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s} value={s.toLowerCase()}>{s}</option>
                ))}
              </select>
            )}

            {/* Create Quiz Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all whitespace-nowrap shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Quiz
            </motion.button>
          </div>
        </AnimatedCard>

      {/* Stats Cards */}
      <MotionContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" stagger={0.1}>
        <MotionItem>
          <AnimatedCard delay={0.2} className="p-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
              >
                <BookOpen className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <div className="text-3xl font-bold text-gray-800">{quizzes.length}</div>
                <div className="text-sm text-gray-600 font-medium">Total Quizzes</div>
              </div>
            </div>
          </AnimatedCard>
        </MotionItem>
        <MotionItem>
          <AnimatedCard delay={0.3} className="p-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
              >
                <TrendingUp className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <div className="text-3xl font-bold text-gray-800">{filteredQuizzes.length}</div>
                <div className="text-sm text-gray-600 font-medium">Available Now</div>
              </div>
            </div>
          </AnimatedCard>
        </MotionItem>
        <MotionItem>
          <AnimatedCard delay={0.4} className="p-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg"
              >
                <Clock className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Questions</div>
              </div>
            </div>
          </AnimatedCard>
        </MotionItem>
      </MotionContainer>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <AnimatedCard delay={0} className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div className="text-red-800 font-medium">{error}</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchQuizzes}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md"
              >
                Retry
              </motion.button>
            </div>
          </AnimatedCard>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <MotionContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.1}>
          {[...Array(6)].map((_, i) => (
            <MotionItem key={i}>
              <LoadingSkeleton variant="card" />
            </MotionItem>
          ))}
        </MotionContainer>
      ) : filteredQuizzes.length === 0 ? (
        <AnimatedCard delay={0.2} className="p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-6xl mb-4"
          >
            📝
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Quizzes Found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedDifficulty !== 'all' || selectedSubject !== 'all'
              ? 'Try adjusting your filters to see more results'
              : 'Create your first quiz to get started'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
          >
            Create Quiz
          </motion.button>
        </AnimatedCard>
      ) : (
        <MotionContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.1}>
          {filteredQuizzes.map((quiz, index) => (
            <MotionItem key={quiz.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <QuizCard quiz={quiz} onStart={handleStartQuiz} />
              </motion.div>
            </MotionItem>
          ))}
        </MotionContainer>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowCreateModal(false);
                setCreateSource('');
              }}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </motion.button>

            <div className="mb-6">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Create New Quiz
              </h3>
              <p className="text-gray-600">
                Paste your chapter text or study material below. We'll generate quiz questions for you.
              </p>
            </div>

            <textarea
              value={createSource}
              onChange={(e) => setCreateSource(e.target.value)}
              placeholder="Paste your text here... (e.g., chapter content, notes, study material)"
              className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
            />

            <div className="flex gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateSource('');
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateQuiz}
                disabled={!createSource.trim() || creating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Generate Quiz
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Quiz Runner */}
      {selectedQuiz && (
        <QuizRunner
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          onSubmit={handleSubmitQuiz}
        />
      )}
    </PageTemplate>
  );
}
