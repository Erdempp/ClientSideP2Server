import { Router, Request, Response } from 'express';
import { authorizeJwt } from '../middleware/passport';
import asyncHandler from '../utils/asyncHandler';
import { FieldService } from '../services/field.service';
import { AuthService } from '../services/auth.service';
import Field from '../models/field.schema';
import User from '../models/user.schema';
// import Field from '../models/field.schema';

const router = Router();
const fieldService = new FieldService();

router
  .post(
    '/',
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const props = req.body;
      const currentUser = req.user;
      const { name, location, length, width, description } = props;

      if (!(name && location && length && width && description)) {
        return res.status(412).json({
          error: 'One or more properties were invalid and/or missing',
        });
      }

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await fieldService.create(
        name,
        user,
        location,
        length,
        width,
        description,
      );

      if (!field) {
        return res.status(500).json({ error: 'Failed to create new field' });
      }
      return res.status(201).json(field);
    }),
  )

  .post(
    '/:id/facilities',
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const props = req.body;
      const fieldId = req.params.id;
      const currentUser = req.user;
      const { facility } = props;

      if (!facility) {
        return res.status(412).json({
          error: 'One or more properties were invalid and/or missing',
        });
      }

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await fieldService.get(fieldId);
      if (!field) {
        return res.status(400).json({ error: 'Invalid field' });
      }

      if (!field.owner === user.id) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      if (field.facilities.includes(facility)) {
        return res
          .status(409)
          .json({ error: 'Facility already exists for this field' });
      }

      field.facilities.push(facility);
      await field.save();
      return res.status(200).json(field);
    }),
  )

  .get(
    '/',
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const fields = await fieldService.getAll();

      if (!(fields.length > 0)) {
        return res.status(404).json({ error: 'Fields not found' });
      }

      return res.status(200).json(fields);
    }),
  )

  .get(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const fieldId = req.params.id;

      const field = await fieldService.get(fieldId);
      if (!field) {
        return res.status(400).json({ error: 'Invalid field' });
      }

      return res.status(200).json(field);
    }),
  )

  .put(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const props = req.body;
      const currentUser = req.user;
      const fieldId = req.params.id;

      const { name, location, length, width, description } = props;

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await fieldService.get(fieldId);
      if (!field) {
        return res.status(500).json({ error: 'Invalid field' });
      }

      if (!field.owner === user.id) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      const updatedField = await fieldService.update(
        fieldId,
        new Field({
          name,
          location,
          length,
          width,
          description,
        }),
      );

      return res.status(200).json(updatedField);
    }),
  )

  .delete(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const currentUser = req.user;
      const fieldId = req.params.id;

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await fieldService.get(fieldId);
      if (!field) {
        return res.status(500).json({ error: 'Invalid field' });
      }

      if (!field.owner === user.id) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      await fieldService.remove(fieldId);
      return res.status(200).json({ message: 'Field successfully deleted' });
    }),
  );

export default router;
