import { Router } from 'express';
import { studyPathController, analyticsController, quizResultController } from '../controllers/study.controller.js';

const router = Router();

router.post('/study-path', studyPathController);
router.get('/analytics', analyticsController);
router.post('/quiz/result', quizResultController);

export default router;


