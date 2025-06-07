import { Router } from 'express';
import {
  generateRegistrationOptionsController,
  verifyRegistrationController,
  generateAuthenticationOptionsController,
  verifyAuthenticationController,
  simpleRegisterController,
  simpleLoginController,
  checkEmailExistsController,
  generate2faOptionsController,
  verify2faController
} from '../controllers/authController';

const router = Router();

router.post('/generate-registration-options', generateRegistrationOptionsController);
router.post('/verify-registration', verifyRegistrationController);
router.post('/generate-authentication-options', generateAuthenticationOptionsController);
router.post('/verify-authentication', verifyAuthenticationController);
router.post('/register', simpleRegisterController);
router.post('/login', simpleLoginController);
router.post('/check-email-exists', checkEmailExistsController);
router.post('/generate-2fa-options', generate2faOptionsController);
router.post('/verify-2fa', verify2faController);

export default router;
