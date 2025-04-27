import { Router } from 'express';
import {
  generateRegistrationOptionsController,
  verifyRegistrationController,
  generateAuthenticationOptionsController,
  verifyAuthenticationController,
  simpleRegisterController,
  simpleLoginController,
} from '../controllers/authController';

const router = Router();

router.post('/generate-registration-options', generateRegistrationOptionsController);
router.post('/verify-registration', verifyRegistrationController);
router.post('/generate-authentication-options', generateAuthenticationOptionsController);
router.post('/verify-authentication', verifyAuthenticationController);
router.post('/register', simpleRegisterController);
router.post('/login', simpleLoginController);

export default router;
