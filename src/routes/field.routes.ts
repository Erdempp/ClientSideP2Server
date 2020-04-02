import { Router } from 'express';
import FieldController from '../api/field.controller';

const router = Router();

router.use('/fields', FieldController);

export default router;
