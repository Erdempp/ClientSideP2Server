import asyncHandler from '../utils/asyncHandler';
import { Router, Request, Response } from 'express';
import { authorizeJwt } from '../middleware/passport';
import { FieldService } from '../services/field.service';
import { UserService } from '../services/user.service';
import { check, validationResult, body } from 'express-validator';

const router = Router();
const fieldService = new FieldService();
const userService = new UserService();

router
  .post(
    '/',
    [
      check('name')
        .notEmpty()
        .withMessage('Name is empty'),
      check('location')
        .notEmpty()
        .withMessage('Location is empty'),
      check('location.address')
        .notEmpty()
        .withMessage('Location address is empty'),
      check('location.postalCode')
        .isPostalCode('NL')
        .withMessage('Invalid postal code'),
      check('length')
        .isNumeric()
        .withMessage('Invalid length'),
      check('width')
        .isNumeric()
        .withMessage('Invalid width'),
      check('description')
        .notEmpty()
        .withMessage('Description is empty'),
    ],
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const currentUser = req.user;
      const { name, location, length, width, description } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await fieldService.create({
        name,
        owner: user,
        location,
        length,
        width,
        description,
      });

      if (!field) {
        return res.status(500).json({ error: 'Failed to create new field' });
      }

      return res.status(201).json(field);
    }),
  )

  .post(
    '/:id/facilities',
    [
      check('id')
        .isMongoId()
        .withMessage('Invalid id'),
      check('facility')
        .notEmpty()
        .withMessage('Facility is empty'),
    ],
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const fieldId = req.params.id;
      const currentUser = req.user;
      const { facility } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await fieldService.get(fieldId);
      if (!field) {
        return res.status(400).json({ error: 'Invalid field' });
      }

      if (!field.owner.equals(user.id)) {
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

  .put(
    '/:id/facilities',
    [
      check('id')
        .isMongoId()
        .withMessage('Invalid id'),
      check('facility')
        .notEmpty()
        .withMessage('Facility is empty'),
    ],
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const fieldId = req.params.id;
      const currentUser = req.user;
      const { facility } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await fieldService.get(fieldId);
      if (!field) {
        return res.status(400).json({ error: 'Invalid field' });
      }

      if (!field.owner.equals(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      field.facilities = field.facilities.filter(f => f !== facility);
      await field.save();
      return res.status(200).json(field);
    }),
  )

  .get(
    '/',
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const fields = await fieldService.getAll();
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

      const field = await fieldService.get(fieldId);
      if (!field) {
        return res.status(400).json({ error: 'Invalid field' });
      }

      return res.status(200).json(field);
    }),
  )

  .put(
    '/:id',
    [
      check('id')
        .isMongoId()
        .withMessage('Invalid id'),
      body('location.address')
        .if(body('location').exists())
        .notEmpty()
        .withMessage('Location.address is empty'),
      body('location.postalCode')
        .if(body('location').exists())
        .isPostalCode('NL')
        .withMessage('Invalid postal code'),
      check('length')
        .optional()
        .isNumeric()
        .withMessage('Invalid length'),
      check('width')
        .optional()
        .isNumeric()
        .withMessage('Invalid width'),
    ],
    authorizeJwt,
    asyncHandler(async (req: Request & any, res: Response) => {
      const currentUser = req.user;
      const fieldId = req.params.id;
      const { name, location, length, width, description } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await fieldService.get(fieldId);
      if (!field) {
        return res.status(500).json({ error: 'Invalid field' });
      }

      if (!field.owner.equals(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      const updatedField = await fieldService.update(fieldId, {
        name: name ? name : field.name,
        location: location ? location : field.location,
        length: length ? length : field.length,
        width: width ? width : field.width,
        description: description ? description : field.description,
      });

      return res.status(200).json(updatedField);
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
      const fieldId = req.params.id;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const user = await userService.getById(currentUser.id);
      if (!user) {
        return res.status(400).json({ error: 'Malformed request' });
      }

      const field = await fieldService.get(fieldId);
      if (!field) {
        return res.status(500).json({ error: 'Invalid field' });
      }

      if (!field.owner.equals(user.id)) {
        return res
          .status(403)
          .json({ error: 'User does not have the required permissions' });
      }

      await fieldService.remove(fieldId);
      return res.status(200).json({ message: 'Field successfully deleted' });
    }),
  );

export default router;
