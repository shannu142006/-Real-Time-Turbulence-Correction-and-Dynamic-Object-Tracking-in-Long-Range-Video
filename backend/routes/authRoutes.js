import express from 'express';
import { 
  registerUser, 
  authUser, 
  recoverAccount, 
  googleLogin, 
  verify2FA,
  updateSecuritySettings 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/recover', recoverAccount);
router.post('/google-login', googleLogin);
router.post('/verify-2fa', verify2FA);
router.put('/update-security', protect, updateSecuritySettings);

export default router;
