import { Router } from 'express';
import * as legalController from '../controllers/legalController';

const router = Router();

router.get('/documents', legalController.getDocuments);

export default router;
