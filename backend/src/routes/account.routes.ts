import { Router } from 'express';
import { AccountController } from '../controllers/account.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', AccountController.getAccounts);
router.get('/providers', AccountController.getProviders);
router.post('/connect', AccountController.connect);
router.post('/connect-mock', AccountController.connectMock);
router.post('/:id/sync', AccountController.syncAccount);
router.post('/:id/revoke-consent', AccountController.revokeConsent);

export default router;
