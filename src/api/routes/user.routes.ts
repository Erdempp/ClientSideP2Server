import { Router } from 'express';
import UserController from '../controllers/user.controller';

const router = Router();

router.use('/auth', UserController);

export default router;
