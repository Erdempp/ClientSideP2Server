import express, { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { authorizeJwt } from '../middleware/passport';
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

      const coach = await User.findById(currentUser.id);
      if (!coach) {
        return res.status(400).json({ error: 'Invalid coach' });
      }

      const team = await Team.create(new Team({ name, city, coach, gender, description }));
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

      const coach = await User.findById(currentUser.id);
      if (!coach) {
        return res.status(400).json({ error: 'Invalid coach' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(400).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(coach.id)) {
        return res.status(403).json({ error: 'User does not have the required permissions' });
      }

      const user = await User.findById(player);
      if (!user) {
        return res.status(404).json({ error: 'Invalid player' });
      }

      if (team.coach.equals(user.id)) {
        return res.status(409).json({ error: 'Specified user is the coach of this team' });
      }

      if (team.players.includes(user.id)) {
        return res.status(409).json({ error: 'User already exists in this team' });
      }

      team.players.push(player);
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

      const coach = await User.findById(currentUser.id);
      if (!coach) {
        return res.status(400).json({ error: 'Invalid coach' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(400).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(coach.id)) {
        return res.status(403).json({ error: 'User does not have the required permissions' });
      }

      const user = await User.findById(player);
      if (!user) {
        return res.status(404).json({ error: 'Invalid player' });
      }

      if (team.coach.equals(user.id)) {
        return res.status(409).json({ error: 'Specified user is the coach of this team' });
      }

      if (team.sparePlayers.includes(user.id)) {
        return res.status(409).json({ error: 'User already exists in this team' });
      }

      team.sparePlayers.push(player);
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

      if (!teamId) {
        return res
          .status(412)
          .json({ error: 'One or more properties were invalid and/or missing' });
      }

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

      if (!(teamId && name && city && gender && description)) {
        return res
          .status(412)
          .json({ error: 'One or more properties were invalid and/or missing' });
      }

      const coach = await User.findById(currentUser.id);
      if (!coach) {
        return res.status(400).json({ error: 'Invalid coach' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(500).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(coach.id)) {
        return res.status(403).json({ error: 'User does not have the required permissions' });
      }

      team.name = name;
      team.city = city;
      team.gender = gender;
      team.description = description;

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

      const coach = await User.findById(currentUser.id);
      if (!coach) {
        return res.status(400).json({ error: 'Invalid coach' });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(500).json({ error: 'Invalid team' });
      }

      if (!team.coach.equals(coach.id)) {
        return res.status(403).json({ error: 'User does not have the required permissions' });
      }

      await team.remove();
      return res.status(200).json({ message: 'Team successfully deleted' });
    })
  );

export default router;
