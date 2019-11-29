import { Router } from 'express';
import TeamController from '../controllers/team.controller';

const router = Router();

router.use('/teams', TeamController);

export default router;
