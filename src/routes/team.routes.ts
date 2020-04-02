import { Router } from 'express';
import TeamController from '../api/team.controller';

const router = Router();

router.use('/teams', TeamController);

export default router;
