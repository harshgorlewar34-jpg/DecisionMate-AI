import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';

const router = Router();

router.post('/analyze', (req, res) => chatController.handleAnalyze(req, res));
router.get('/state/:conversationId', (req, res) => chatController.getState(req, res));

export default router;
