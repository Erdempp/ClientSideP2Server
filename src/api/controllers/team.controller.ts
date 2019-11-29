import express, { Response } from 'express';
import { authorizeJwt } from '../middleware/passport';
import asyncHandler from '../utils/asyncHandler';
import User from '../schemas/user.schema';
import Team from '../schemas/footballTeam.schema';

const router = express.Router();

router
  .post(
    '/',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const props = req.body;
      const currentUser = req.user;
      const { name, city, gender, description } = props;

      if (!(name && city && gender && description)) {
        return res
          .status(412)
          .json({ error: 'One or more properties were invalid and/or missing' });
      }

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const team = await Team.create(new Team({ name, city, coach: user, gender, description }));
      if (!team) {
        return res.status(500).json({ error: 'Failed to create new team' });
      }
      return res.status(201).json(team);
    })
  )

  .post(
    '/:id/players',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const props = req.body;
      const teamId = req.params.id;
      const currentUser = req.user;
      const { player } = props;

      if (!player) {
        return res
          .status(412)
          .json({ error: 'One or more properties were invalid and/or missing' });
      }

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(400).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(user.id)) {
        return res.status(403).json({ error: 'User does not have the required permissions' });
      }

      const playerUser = await User.findById(player);
      if (!playerUser) {
        return res.status(404).json({ error: 'Invalid player' });
      }

      if (team.coach.equals(user.id)) {
        return res.status(409).json({ error: 'Coach can not play in this team' });
      }

      if (team.players.includes(playerUser.id)) {
        return res.status(409).json({ error: 'User already exists in this team' });
      }

      team.players.push(playerUser);
      await team.save();
      return res.status(200).json(team);
    })
  )

  .post(
    '/:id/spareplayers',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const props = req.body;
      const teamId = req.params.id;
      const currentUser = req.user;
      const { player } = props;

      if (!player) {
        return res
          .status(412)
          .json({ error: 'One or more properties were invalid and/or missing' });
      }

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(400).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(user.id)) {
        return res.status(403).json({ error: 'User does not have the required permissions' });
      }

      const playerUser = await User.findById(player);
      if (!playerUser) {
        return res.status(404).json({ error: 'Invalid player' });
      }

      if (team.coach.equals(user.id)) {
        return res.status(409).json({ error: 'Coach can not play in this team' });
      }

      if (team.sparePlayers.includes(playerUser.id)) {
        return res.status(409).json({ error: 'User already exists in this team' });
      }

      team.sparePlayers.push(playerUser);
      await team.save();
      return res.status(200).json(team);
    })
  )

  .get(
    '/',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const teams = await Team.find({});

      if (!(teams.length > 0)) {
        return res.status(404).json({ error: 'Teams not found' });
      }

      return res.status(200).json(teams);
    })
  )

  .get(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const teamId = req.params.id;

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(400).json({ error: 'Invalid team' });
      }

      return res.status(200).json(team);
    })
  )

  .put(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const props = req.body;
      const currentUser = req.user;
      const teamId = req.params.id;

      const { name, city, gender, description } = props;

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(500).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(user.id)) {
        return res.status(403).json({ error: 'User does not have the required permissions' });
      }

      team.name = name ? name : team.name;
      team.city = city ? city : team.city;
      team.gender = gender ? gender : team.gender;
      team.description = description ? description : team.description;

      await team.save();
      return res.status(200).json(team);
    })
  )

  .delete(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const currentUser = req.user;
      const teamId = req.params.id;

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(500).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(user.id)) {
        return res.status(403).json({ error: 'User does not have the required permissions' });
      }

      await team.remove();
      return res.status(200).json({ message: 'Team successfully deleted' });
    })
  );

export default router;
