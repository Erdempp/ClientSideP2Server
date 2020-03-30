import { Router } from 'express';
import AuthController from '../controllers/auth.controller';

const router = Router();

router.use('/auth', AuthController);

export default router;
