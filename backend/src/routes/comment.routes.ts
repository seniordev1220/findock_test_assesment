import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const controller = new CommentController();

router.use(authenticate);

// Routes for task comments
router.get('/tasks/:taskId/comments', controller.list);
router.post('/tasks/:taskId/comments', controller.create);

// Routes for comment updates/deletes
router.put('/comments/:id', controller.update);
router.delete('/comments/:id', controller.remove);

export default router;

