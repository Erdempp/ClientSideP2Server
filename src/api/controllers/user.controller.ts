import express from 'express';
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { authorizeJwt } from '../middleware/passport';
import User from '../schemas/user.schema';

const router = express.Router();

router.get(
  '/',
  authorizeJwt,
  asyncHandler(async (req: Request, res: Response) => {
    console.log('Hit /users');
    return res.status(200).json({ ok: '200' });
  }),
);

export default router;
