import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';

const router = Router();

router.post('/', (req, res) => chatController.handleChat(req, res));
router.post('/reset', (req, res) => chatController.resetConversation(req, res));

export default router;
