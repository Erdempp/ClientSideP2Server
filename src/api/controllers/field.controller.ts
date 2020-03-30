import { Router, Response } from 'express';
import { authorizeJwt } from '../middleware/passport';
import asyncHandler from '../utils/asyncHandler';
import User from '../schemas/user.schema';
import Field from '../schemas/footballField.schema';

const router = Router();

router
  .post(
    '/',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
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

      const field = await Field.create(
        new Field({
          name,
          contacts: [user],
          location,
          length,
          width,
          description,
        }),
      );
      if (!field) {
        return res.status(500).json({ error: 'Failed to create new field' });
      }
      return res.status(201).json(field);
    }),
  )

  .post(
    '/:id/contacts',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const props = req.body;
      const fieldId = req.params.id;
      const currentUser = req.user;
      const { contact } = props;

      if (!contact) {
        return res.status(412).json({
          error: 'One or more properties were invalid and/or missing',
        });
      }

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await Field.findById(fieldId);
      if (!field) {
        return res.status(400).json({ error: 'Invalid team' });
      }

      if (!field.contacts.includes(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      const newContact = await User.findById(contact);
      if (!newContact) {
        return res.status(404).json({ error: 'Invalid contact' });
      }

      if (field.contacts.includes(newContact.id)) {
        return res
          .status(409)
          .json({ error: 'Contact already exists for this field' });
      }

      field.contacts.push(newContact);
      await field.save();
      return res.status(200).json(field);
    }),
  )

  .post(
    '/:id/facilities',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
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

      const field = await Field.findById(fieldId);
      if (!field) {
        return res.status(400).json({ error: 'Invalid team' });
      }

      if (!field.contacts.includes(user.id)) {
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
    asyncHandler(async (req: any, res: Response) => {
      const fields = await Field.find({});

      if (!(fields.length > 0)) {
        return res.status(404).json({ error: 'Fields not found' });
      }

      return res.status(200).json(fields);
    }),
  )

  .get(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const fieldId = req.params.id;

      const field = await Field.findById(fieldId);
      if (!field) {
        return res.status(400).json({ error: 'Invalid field' });
      }

      return res.status(200).json(field);
    }),
  )

  .put(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const props = req.body;
      const currentUser = req.user;
      const fieldId = req.params.id;

      const { name, location, length, width, description } = props;

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await Field.findById(fieldId);
      if (!field) {
        return res.status(500).json({ error: 'Invalid field' });
      }

      if (!field.contacts.includes(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      field.name = name ? name : field.name;
      field.location = location ? location : field.location;
      field.length = length ? length : field.length;
      field.width = width ? width : field.width;
      field.description = description ? description : field.description;

      await field.save();
      return res.status(200).json(field);
    }),
  )

  .delete(
    '/:id',
    authorizeJwt,
    asyncHandler(async (req: any, res: Response) => {
      const currentUser = req.user;
      const fieldId = req.params.id;

      const user = await User.findById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await Field.findById(fieldId);
      if (!field) {
        return res.status(500).json({ error: 'Invalid field' });
      }

      if (!field.contacts.includes(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      await field.remove();
      return res.status(200).json({ message: 'Field successfully deleted' });
    }),
  );

export default router;
