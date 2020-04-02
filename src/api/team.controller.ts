import { Router, Response } from 'express';
import { authorizeJwt } from '../middleware/passport';
import asyncHandler from '../utils/asyncHandler';
import { TeamService } from '../services/team.service';
import User from '../models/user.schema';
import Team from '../models/team.schema';

const router = Router();
const teamService = new TeamService();

router
  .post(
    '/',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const props = req.body;
      const currentUser = req.user;
      const { name, city, gender, description } = props;

      if (!(name && city && gender && description)) {
        return res.status(412).json({
          error: 'One or more properties were invalid and/or missing',
        });
      }

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const team = await teamService.create(
        new Team({
          name,
          city,
          coach: user,
          gender,
          description,
        }),
      );

      if (!team) {
        return res.status(500).json({ error: 'Failed to create new team' });
      }
      return res.status(201).json(team);
    }),
  )

  .post(
    '/:id/players',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const props = req.body;
      const teamId = req.params.id;
      const currentUser = req.user;
      const { playerId } = props;

      if (!playerId) {
        return res.status(412).json({
          error: 'One or more properties were invalid and/or missing',
        });
      }

      const user = await User.findById(currentUser.id);
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

      const playerUser = await User.findById(playerId);
      if (!playerUser) {
        return res.status(404).json({ error: 'Invalid player' });
      }

      // if (team.coach.equals(user.id)) {
      //   return res
      //     .status(409)
      //     .json({ error: 'Coach can not play in this team' });
      // }

      if (team.players.includes(playerUser.id)) {
        return res
          .status(409)
          .json({ error: 'User already exists in this team' });
      }

      const updatedTeam = await teamService.addPlayer(team, playerUser);
      return res.status(200).json(updatedTeam);
    }),
  )

  // .post(
  //   '/:id/spareplayers',
  //   authorizeJwt,
  //   asyncHandler(async (req: any, res: Response) => {
  //     const props = req.body;
  //     const teamId = req.params.id;
  //     const currentUser = req.user;
  //     const { player } = props;

  //     if (!player) {
  //       return res.status(412).json({
  //         error: 'One or more properties were invalid and/or missing',
  //       });
  //     }

  //     const user = await User.findById(currentUser.id);
  //     if (!user) {
  //       return res.status(400).json({ error: 'Malformed request' });
  //     }

  //     const team = await Team.findById(teamId);
  //     if (!team) {
  //       return res.status(400).json({ error: 'Invalid team' });
  //     }

  //     if (!team.coach.equals(user.id)) {
  //       return res
  //         .status(403)
  //         .json({ error: 'User does not have the required permissions' });
  //     }

  //     const playerUser = await User.findById(player);
  //     if (!playerUser) {
  //       return res.status(404).json({ error: 'Invalid player' });
  //     }

  //     if (team.coach.equals(user.id)) {
  //       return res
  //         .status(409)
  //         .json({ error: 'Coach can not play in this team' });
  //     }

  //     if (team.sparePlayers.includes(playerUser.id)) {
  //       return res
  //         .status(409)
  //         .json({ error: 'User already exists in this team' });
  //     }

  //     team.sparePlayers.push(playerUser);
  //     await team.save();
  //     return res.status(200).json(team);
  //   }),
  // )

  .get(
    '/',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const teams = await teamService.getAll();

      if (!(teams.length > 0)) {
        return res.status(404).json({ error: 'Teams not found' });
      }

      return res.status(200).json(teams);
    }),
  )

  .get(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const teamId = req.params.id;

      const team = await teamService.get(teamId);
      if (!team) {
        return res.status(400).json({ error: 'Invalid team' });
      }

      return res.status(200).json(team);
    }),
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
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      const updatedTeam = await teamService.update(
        teamId,
        new Team({
          name,
          city,
          gender,
          description,
        }),
      );

      await team.save();
      return res.status(200).json(updatedTeam);
    }),
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
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      await teamService.remove(teamId);
      return res.status(200).json({ message: 'Team successfully deleted' });
    }),
  );

export default router;
