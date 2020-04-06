import { Router } from 'express';
import MatchController from '../api/match.controller';

const router = Router();

router.use('/matches', MatchController);

export default router;
