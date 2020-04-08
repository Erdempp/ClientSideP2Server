import asyncHandler from '../utils/asyncHandler';
import { authorizeJwt } from '../middleware/passport';
import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { MatchService } from '../services/match.service';
import { UserService } from '../services/user.service';
import { TeamService } from '../services/team.service';

const router = Router();
const matchService = new MatchService();
const userService = new UserService();
const teamService = new TeamService();

router
  .post(
    '/',
    [
      check('awayTeam')
        .isMongoId()
        .withMessage('Invalid awayTeam'),
      check('field')
        .isMongoId()
        .withMessage('Invalid field'),
      check('startDateTime')
        .isISO8601()
        .withMessage('Invalid startDateTime'),
      check('endDateTime')
        .isISO8601()
        .withMessage('Invalid endDateTime'),
    ],
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const currentUser = req.user;
      const { awayTeam, field, startDateTime, endDateTime } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const team = await teamService.getByCoach(user);
      if (!team) {
        return res.status(404).json({ error: 'Invalid team' });
      }

      const match = await matchService.create({
        organizer: user,
        homeTeam: team,
        awayTeam,
        field,
        startDateTime,
        endDateTime,
      });

      if (!match) {
        return res.status(500).json({ error: 'Failed to create new match' });
      }

      return res.status(201).json(match);
    }),
  )

  .get(
    '/',
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const fields = await matchService.getAll();
      return res.status(200).json(fields);
    }),
  )

  .get(
    '/:id',
    [
      check('id')
        .isMongoId()
        .withMessage('Invalid id'),
    ],
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const fieldId = req.params.id;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const match = await matchService.get(fieldId);
      if (!match) {
        return res.status(400).json({ error: 'Invalid match' });
      }

      return res.status(200).json(match);
    }),
  )

  .put(
    '/:id',
    [
      check('id')
        .isMongoId()
        .withMessage('Invalid id'),
      check('awayTeam')
        .optional()
        .isMongoId()
        .withMessage('Invalid awayTeam'),
      check('field')
        .optional()
        .isMongoId()
        .withMessage('Invalid field'),
      check('startDateTime')
        .optional()
        .isISO8601()
        .withMessage('Invalid startDateTime'),
      check('endDateTime')
        .optional()
        .isISO8601()
        .withMessage('Invalid endDateTime'),
    ],
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const currentUser = req.user;
      const matchId = req.params.id;
      const { awayTeam, field, startDateTime, endDateTime } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const match = await matchService.get(matchId);
      if (!match) {
        return res.status(500).json({ error: 'Invalid match' });
      }

      if (!match.homeTeam.coach.equals(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      const updatedMatch = await matchService.update(matchId, {
        awayTeam: awayTeam ? awayTeam : match.awayTeam,
        field: field ? field : match.field,
        startDateTime: startDateTime ? startDateTime : match.startDateTime,
        endDateTime: endDateTime ? endDateTime : match.endDateTime,
      });

      return res.status(200).json(updatedMatch);
    }),
  )

  .delete(
    '/:id',
    [
      check('id')
        .isMongoId()
        .withMessage('Invalid id'),
    ],
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const currentUser = req.user;
      const matchId = req.params.id;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const match = await matchService.get(matchId);
      if (!match) {
        return res.status(500).json({ error: 'Invalid match' });
      }

      if (!match.homeTeam.coach.equals(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      await matchService.remove(matchId);
      return res.status(200).json({ message: 'Match successfully deleted' });
    }),
  );

export default router;
