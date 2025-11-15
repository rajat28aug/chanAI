import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Copy, Check, Clock, FileText, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api.js';
import PageTemplate from '../components/PageTemplate.jsx';
import Card from '../components/Card.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';

export default function DoubtSolver() {
  const [doubts, setDoubts] = useState([]);
  const [currentDoubt, setCurrentDoubt] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('general');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const subjects = [
    { value: 'general', label: 'General' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'programming', label: 'Programming' },
    { value: 'history', label: 'History' },
    { value: 'literature', label: 'Literature' }
  ];

  useEffect(() => {
    fetchDoubts();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [doubts, currentResponse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDoubts = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get('/study/doubts');
      setDoubts(response.data.doubts || []);
    } catch (err) {
      console.error('Error fetching doubts:', err);
      // Use mock data for demonstration
      setDoubts(getMockDoubts());
    } finally {
      setLoadingHistory(false);
    }
  };

  const getMockDoubts = () => [
    {
      id: '1',
      question: 'What is the difference between let and const in JavaScript?',
      answer: 'The main difference is that `let` allows reassignment while `const` does not. Both are block-scoped, but `const` must be initialized when declared.',
      subject: 'programming',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      question: 'How does photosynthesis work?',
      answer: 'Photosynthesis is the process by which plants convert light energy into chemical energy. It involves capturing light with chlorophyll, using it to split water molecules, and combining the products with carbon dioxide to create glucose.',
      subject: 'science',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedFile({
            type: 'image',
            data: reader.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setUploadedFile({
          type: 'pdf',
          file: file,
          name: file.name
        });
      }
    }
  };

  const handleSendDoubt = async () => {
    if (!currentDoubt.trim() && !uploadedFile) return;

    const question = currentDoubt.trim();
    if (!question && !uploadedFile) return;

    setLoading(true);
    setError(null);
    setCurrentResponse('');

    const newDoubt = {
      id: Date.now().toString(),
      question: question || 'Image/File question',
      answer: '',
      subject: selectedSubject,
      createdAt: new Date().toISOString(),
      isPending: true
    };

    setDoubts(prev => [newDoubt, ...prev]);

    try {
      const payload = uploadedFile?.type === 'image' 
        ? { imageBase64: uploadedFile.data }
        : { text: question };

      const response = await api.post('/ai/doubt', payload);
      const answer = response.data.solution || response.data.answer || 'I apologize, but I couldn\'t generate a response. Please try again.';

      // Update the doubt with the answer
      setDoubts(prev => prev.map(d => 
        d.id === newDoubt.id 
          ? { ...d, answer, isPending: false }
          : d
      ));

      setCurrentResponse(answer);
    } catch (err) {
      console.error('Error solving doubt:', err);
      setError('Failed to get answer. Please try again.');
      
      // Update doubt with error
      setDoubts(prev => prev.map(d => 
        d.id === newDoubt.id 
          ? { ...d, answer: 'Error: Could not generate answer. Please try again.', isPending: false }
          : d
      ));
    } finally {
      setLoading(false);
      setCurrentDoubt('');
      setUploadedFile(null);
    }
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <PageTemplate
      title="Doubt Solver"
      subtitle="Ask any question and get instant AI-powered answers"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Area */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Subject Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {subjects.map(subject => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image or PDF (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Choose File</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadedFile && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm">
                      <FileText className="w-4 h-4" />
                      {uploadedFile.name}
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="ml-2 hover:text-indigo-900"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Question
                </label>
                <textarea
                  value={currentDoubt}
                  onChange={(e) => setCurrentDoubt(e.target.value)}
                  placeholder="Type your question here... (e.g., Explain quantum physics, Solve this math problem, etc.)"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSendDoubt();
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Press Ctrl+Enter to send
                </p>
              </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendDoubt}
                disabled={(!currentDoubt.trim() && !uploadedFile) || loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Ask Question</span>
                  </>
                )}
              </motion.button>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                  {error}
                </div>
              )}
            </div>
          </Card>

          {/* Current Response */}
          {currentResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-2">AI Response</div>
                    <div className="text-gray-700 whitespace-pre-wrap">{currentResponse}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Questions</h3>
            
            {loadingHistory ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : doubts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💭</div>
                <p className="text-gray-600 text-sm">No questions yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {doubts.map((doubt) => (
                    <motion.div
                      key={doubt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setCurrentDoubt(doubt.question);
                        setCurrentResponse(doubt.answer);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                            {doubt.question}
                          </div>
                          {doubt.answer && (
                            <div className="text-xs text-gray-600 line-clamp-2">
                              {doubt.answer}
                            </div>
                          )}
                        </div>
                        {doubt.answer && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(doubt.answer, doubt.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {copiedId === doubt.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          doubt.subject === 'programming' ? 'bg-blue-100 text-blue-700' :
                          doubt.subject === 'mathematics' ? 'bg-purple-100 text-purple-700' :
                          doubt.subject === 'science' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {subjects.find(s => s.value === doubt.subject)?.label || 'General'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(doubt.createdAt)}
                        </div>
                      </div>
                      {doubt.isPending && (
                        <div className="mt-2 text-xs text-indigo-600 flex items-center gap-1">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                          Processing...
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div ref={messagesEndRef} />
    </PageTemplate>
  );
}
