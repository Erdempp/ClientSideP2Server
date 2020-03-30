import { Router } from 'express';
import FieldController from '../controllers/field.controller';

const router = Router();

router.use('/fields', FieldController);

export default router;
