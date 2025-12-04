import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validation';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';

const router = Router();
const controller = new TaskController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', authorize('admin', 'manager'), validateBody(CreateTaskDto), controller.create);
router.put('/:id', validateBody(UpdateTaskDto), controller.update);
router.delete('/:id', controller.remove);

export default router;

