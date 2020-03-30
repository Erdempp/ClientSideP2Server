import express from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler';
import { authorizeLocal } from '../middleware/passport';
import User from '../schemas/user.schema';

const router = express.Router();

router
  .post(
    '/register',
    asyncHandler(async (req, res) => {
      const props = req.body;
      const { email, name, password } = props;

      if (!(email && name && password)) {
        return res
          .status(400)
          .json({ error: 'One or more properties are missing' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(409)
          .json({ error: 'User with this email aready exists' });
      }

      const user = await User.create(new User({ email, name, password }));
      if (!user) {
        return res.status(500).json({ error: 'Failed to create new user' });
      }

      return res.status(201).json(user);
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
