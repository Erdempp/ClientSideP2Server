import { Router } from 'express';
import UserController from '../controllers/user.controller';

const router = Router();

router.use('/users', UserController);

export default router;
