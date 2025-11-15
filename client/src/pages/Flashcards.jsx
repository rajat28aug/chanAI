import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  Eye, 
  FileText,
  Calendar,
  Loader2
} from 'lucide-react';
import api from '../utils/api.js';
import PageTemplate from '../components/PageTemplate.jsx';
import PageHeader from '../components/PageHeader.jsx';
import AnimatedCard from '../components/AnimatedCard.jsx';
import MotionContainer from '../components/MotionContainer.jsx';
import Button from '../components/Button.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

export default function Flashcards() {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState([]);
  const [pdfFlashcardCounts, setPdfFlashcardCounts] = useState({});
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      setLoadingPdfs(true);
      const response = await api.get('/flashcards/pdfs');
      const pdfsList = response.data.pdfs || [];
      setPdfs(pdfsList);

      const counts = {};
      for (const pdf of pdfsList) {
        try {
          const flashcardResponse = await api.get(`/flashcards/document/${pdf.id}`);
          counts[pdf.id] = flashcardResponse.data.flashcards?.length || 0;
        } catch (error) {
          counts[pdf.id] = 0;
        }
      }
      setPdfFlashcardCounts(counts);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoadingPdfs(false);
    }
  };

  const generateFlashcards = async (documentId, e) => {
    e.stopPropagation();
    try {
      setGeneratingId(documentId);
      const response = await api.post(`/flashcards/generate/${documentId}`);
      setPdfFlashcardCounts(prev => ({
        ...prev,
        [documentId]: response.data.flashcards?.length || 0
      }));
      navigate(`/flashcards/${documentId}`);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert(error.response?.data?.error || 'Failed to generate flashcards. Please try again.');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleCardClick = (documentId, hasFlashcards) => {
    if (hasFlashcards) {
      navigate(`/flashcards/${documentId}`);
    }
  };

  const getCardName = (filename) => {
    if (!filename) return 'Unknown';
    return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  };

  return (
    <PageTemplate>
      <PageHeader
        title="Flashcards"
        subtitle="Create and study flashcards from your PDF documents"
        icon={BookOpen}
      />

      {loadingPdfs ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      ) : pdfs.length === 0 ? (
        <AnimatedCard className="p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-4"
          >
            📚
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No PDFs Found</h3>
          <p className="text-gray-600 mb-6">
            Upload a PDF first from the PDF Tools page to create flashcards.
          </p>
          <Button
            icon={FileText}
            onClick={() => navigate('/pdf-tools')}
          >
            Go to PDF Tools
          </Button>
        </AnimatedCard>
      ) : (
        <MotionContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.1}>
          {pdfs.map((pdf, index) => {
            const hasFlashcards = (pdfFlashcardCounts[pdf.id] || 0) > 0;
            const cardName = getCardName(pdf.filename);
            const isGenerating = generatingId === pdf.id;
            
            return (
              <motion.div
                key={pdf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AnimatedCard
                  delay={index * 0.1}
                  onClick={() => handleCardClick(pdf.id, hasFlashcards)}
                  className="overflow-hidden cursor-pointer"
                >
                {/* Card Header with Gradient */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`h-40 flex items-center justify-center relative overflow-hidden ${
                    hasFlashcards
                      ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-6xl"
                  >
                    🎴
                  </motion.div>
                  {hasFlashcards && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-3 right-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold"
                    >
                      {pdfFlashcardCounts[pdf.id]} cards
                    </motion.div>
                  )}
                </motion.div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {cardName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{pdf.filename}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {pdf.createdAt ? new Date(pdf.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>

                  {/* Action Button */}
                  {hasFlashcards ? (
                    <Button
                      icon={Eye}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/flashcards/${pdf.id}`);
                      }}
                      className="w-full"
                    >
                      View Cards
                    </Button>
                  ) : (
                    <Button
                      icon={isGenerating ? Loader2 : Sparkles}
                      onClick={(e) => generateFlashcards(pdf.id, e)}
                      disabled={isGenerating}
                      className="w-full"
                      variant={isGenerating ? 'ghost' : 'primary'}
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </span>
                      ) : (
                        'Generate Cards'
                      )}
                    </Button>
                  )}
                </div>
              </AnimatedCard>
              </motion.div>
            );
          })}
        </MotionContainer>
      )}
    </PageTemplate>
  );
}
