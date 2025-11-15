import { Router } from 'express';
import { summarizeController } from '../controllers/summarize.controller.js';
import { 
  flashcardsController,
  getPdfsForFlashcardsController,
  generateFlashcardsForPdfController,
  getFlashcardsForPdfController
} from '../controllers/flashcards.controller.js';
import { 
  quizController, 
  getQuizzesController, 
  getQuizByIdController,
  submitQuizController,
  generateQuizFromPdfController
} from '../controllers/quiz.controller.js';
import { solveController } from '../controllers/solve.controller.js';
import { doubtController, getDoubtsController } from '../controllers/doubt.controller.js';

const router = Router();

router.post('/summarize', summarizeController);
router.post('/flashcards', flashcardsController); // Legacy endpoint
router.get('/flashcards/pdfs', getPdfsForFlashcardsController);
router.post('/flashcards/generate/:documentId', generateFlashcardsForPdfController);
router.get('/flashcards/document/:documentId', getFlashcardsForPdfController);
router.post('/quiz', quizController);
router.post('/quizzes/generate/:documentId', generateQuizFromPdfController);
router.get('/quizzes', getQuizzesController);
router.get('/quizzes/:id', getQuizByIdController);
router.post('/quizzes/:id/submit', submitQuizController);
router.post('/solve', solveController);
router.post('/ai/doubt', doubtController);
router.get('/study/doubts', getDoubtsController);

export default router;


