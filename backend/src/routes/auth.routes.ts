import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation';
import { LoginDto, RegisterDto } from '../dto/auth.dto';

const router = Router();
const controller = new AuthController();

router.post('/register', validateBody(RegisterDto), controller.register);
router.post('/login', validateBody(LoginDto), controller.login);

export default router;

