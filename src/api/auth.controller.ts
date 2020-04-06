import * as jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler';
import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { authorizeLocal } from '../middleware/passport';
import { AuthService } from '../services/auth.service';

const router = Router();
const authService = new AuthService();

router
  .post(
    '/register',
    [
      check('email')
        .isEmail()
        .withMessage('Invalid email'),
      check('username')
        .notEmpty()
        .withMessage('Username is empty'),
      check('password')
        .isLength({ min: 3 })
        .withMessage('Password should at least be 3 characters long'),
    ],
    asyncHandler(async (req: Request, res: Response) => {
      const { email, username, password } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      if (!(await authService.exists(email))) {
        const user = await authService.create(email, username, password);
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
