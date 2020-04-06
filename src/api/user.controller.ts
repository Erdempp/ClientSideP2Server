import asyncHandler from '../utils/asyncHandler';
import { Router } from 'express';
import { Request, Response } from 'express';
import { authorizeJwt } from '../middleware/passport';
import { UserService } from '../services/user.service';
import { check, validationResult } from 'express-validator';

const router = Router();
const userService = new UserService();

router
  .get(
    '/',
    authorizeJwt,
    asyncHandler(async (req: Request, res: Response) => {
      const users = await userService.getAll();
      return res.status(200).json(users);
    }),
  )

  .get(
    '/:id',
    [
      check('id')
        .isMongoId()
        .withMessage('Invald id'),
    ],
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const { id } = req.params;
      const user = await userService.getById(id);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.status(200).json(user);
    }),
  );

export default router;
