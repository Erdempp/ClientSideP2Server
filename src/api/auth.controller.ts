import { Router, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler';
import { authorizeLocal } from '../middleware/passport';
import { AuthService } from '../services/auth.service';

const router = Router();
const authService = new AuthService();

router
  .post(
    '/register',
    asyncHandler(async (req: Request, res: Response) => {
      const props = req.body;
      const { email, name, password } = props;

      if (!(email && name && password)) {
        return res
          .status(400)
          .json({ error: 'One or more properties are missing' });
      }

      if (!(await authService.exists(email))) {
        const user = await authService.create(email, name, password);
        if (!user) {
          return res.status(500).json({ error: 'Failed to create new user' });
        }
        return res.status(201).json(user);
      }
      return res
        .status(409)
        .json({ error: 'User with this email already exists' });
    }),
  )

  .post(
    '/login',
    authorizeLocal,
    asyncHandler(async (req, res) => {
      const token = jwt.sign({ id: req.user.id }, 'randomSecret', {
        expiresIn: '24h',
      });
      if (!token) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      return res.status(200).json({ token });
    }),
  );

export default router;
