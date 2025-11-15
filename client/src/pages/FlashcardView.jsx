import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';

export default function FlashcardView() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [document, setDocument] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/flashcards/document/${documentId}`);
        setFlashcards(response.data.flashcards || []);
        setDocument({
          filename: response.data.filename,
          documentId: response.data.documentId
        });
      } catch (error) {
        console.error('Error loading flashcards:', error);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      loadFlashcards();
    }
  }, [documentId]);

  const getCardName = (filename) => {
    if (!filename) return 'Unknown';
    return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Flashcards Found</h2>
        <p className="text-gray-600 mb-6">This PDF doesn't have any flashcards yet.</p>
        <button
          onClick={() => navigate('/flashcards')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const cardName = getCardName(document?.filename);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/flashcards')}
            className="text-indigo-600 hover:text-indigo-700 mb-2 flex items-center gap-2"
          >
            <span>←</span> Back to Flashcards
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{cardName}</h1>
          <p className="text-gray-600 mt-1">{document?.filename}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Card</div>
          <div className="text-2xl font-semibold text-indigo-600">
            {currentIndex + 1} / {flashcards.length}
          </div>
        </div>
      </div>

      {/* Flashcard Display */}
      <div className="mb-6">
        <div
          className="relative h-96 cursor-pointer"
          onClick={handleFlip}
        >
          {/* Front of Card (Question) */}
          {!isFlipped && (
            <div className="absolute inset-0 h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-8 flex flex-col justify-center items-center text-white transition-opacity duration-300">
              <div className="text-sm uppercase tracking-wide mb-4 opacity-80">Question</div>
              {currentCard.tag && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {currentCard.tag}
                  </span>
                </div>
              )}
              <div className="text-2xl font-semibold text-center leading-relaxed">
                {currentCard.question}
              </div>
              <div className="mt-8 text-sm opacity-70">Click to reveal answer</div>
            </div>
          )}

          {/* Back of Card (Answer) */}
          {isFlipped && (
            <div className="absolute inset-0 h-full bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-2xl p-8 flex flex-col justify-center items-center text-white transition-opacity duration-300">
              <div className="text-sm uppercase tracking-wide mb-4 opacity-80">Answer</div>
              <div className="text-xl font-medium text-center leading-relaxed">
                {currentCard.answer}
              </div>
              <div className="mt-8 text-sm opacity-70">Click to see question</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>
        
        <button
          onClick={handleFlip}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        
        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* All Cards Grid View (Optional) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Cards</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {flashcards.map((card, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsFlipped(false);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                index === currentIndex
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium text-gray-600 mb-1">Card {index + 1}</div>
              <div className="text-sm text-gray-800 line-clamp-2">{card.question}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

