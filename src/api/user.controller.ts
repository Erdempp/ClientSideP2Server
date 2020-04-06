import { Router } from 'express';
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { authorizeJwt } from '../middleware/passport';
import User from '../models/user.schema';

const router = Router();

router
  .get(
    '/',
    authorizeJwt,
    asyncHandler(async (req: Request, res: Response) => {
      console.log('Hit /users');
      return res.status(200).json({ ok: '200' });
    }),
  )

  .get(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.status(200).json(user);
    }),
  );

export default router;
