import Team from '../models/team.schema';
import asyncHandler from '../utils/asyncHandler';
import { Router, Request, Response } from 'express';
import { authorizeJwt } from '../middleware/passport';
import { TeamService } from '../services/team.service';
import { UserService } from '../services/user.service';
import { check, validationResult } from 'express-validator';

const router = Router();
const teamService = new TeamService();
const userService = new UserService();

router
  .post(
    '/',
    [
      check('name')
        .notEmpty()
        .withMessage('Name is empty'),
      check('city')
        .notEmpty()
        .withMessage('City is empty'),
      check('gender')
        .isIn(['men', 'women', 'mixed'])
        .withMessage('Invalid gender'),
      check('description')
        .notEmpty()
        .withMessage('Description is empty'),
    ],
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const currentUser = req.user;
      const { name, city, gender, description } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      if (!(await teamService.exists(user))) {
        const team = await teamService.create({
          name,
          city,
          coach: user,
          gender,
          description,
        });

        if (!team) {
          return res.status(500).json({ error: 'Failed to create new team' });
        }
        return res.status(201).json(team);
      }

      return res
        .status(409)
        .json({ error: 'Team with this user already exists' });
    }),
  )

  .post(
    '/:id/players',
    [
      check('id')
        .isMongoId()
        .withMessage('Invalid id'),
      check('playerId')
        .isMongoId()
        .withMessage('Invalid playerId'),
    ],
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const teamId = req.params.id;
      const currentUser = req.user;
      const { playerId } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const team = await teamService.get(teamId);
      if (!team) {
        return res.status(400).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      const playerUser = await userService.getById(playerId);
      if (!playerUser) {
        return res.status(404).json({ error: 'Invalid player' });
      }

      // if (team.players.includes(playerUser)) {
      //   return res
      //     .status(409)
      //     .json({ error: 'User already exists in this team' });
      // }
      // Temporary solution... (change to for..loop because headers are set after they have been set)
      team.players.forEach(player => {
        if (player.email === playerUser.email) {
          return res
            .status(409)
            .json({ error: 'User already exists in this team' });
        }
      });

      team.players.push(playerUser);
      await team.save();
      return res.status(200).json(team);
    }),
  )

  .get(
    '/',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const teams = await teamService.getAll();
      return res.status(200).json(teams);
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
    asyncHandler(async (req: any, res: Response) => {
      const teamId = req.params.id;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const team = await teamService.get(teamId);
      if (!team) {
        return res.status(400).json({ error: 'Invalid team' });
      }

      return res.status(200).json(team);
    }),
  )

  .put(
    '/:id',
    [
      check('id')
        .isMongoId()
        .withMessage('Invalid id'),
      check('gender')
        .optional()
        .isIn(['men', 'women', 'mixed'])
        .withMessage('Invalid gender'),
    ],
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const props = req.body;
      const currentUser = req.user;
      const teamId = req.params.id;

      const { name, city, gender, description } = props;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(500).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      const updatedTeam = await teamService.update(teamId, {
        name: name ? name : team.name,
        city: city ? city : team.city,
        gender: gender ? gender : team.gender,
        description: description ? description : team.description,
      });

      await team.save();
      return res.status(200).json(updatedTeam);
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
    asyncHandler(async (req: any, res: Response) => {
      const currentUser = req.user;
      const teamId = req.params.id;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(500).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      await teamService.remove(teamId);
      return res.status(200).json({ message: 'Team successfully deleted' });
    }),
  );

export default router;
