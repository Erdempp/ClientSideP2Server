import express from 'express';
import { Request, Response } from 'express';
import User from '../schemas/user';
import validate from '../middleware/validate';

const router = express.Router();

router.get('/', validate, (req: Request, res: Response) => {
    console.log('Hit /users');
});

export default router;
