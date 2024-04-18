import express from 'express';
import { login, register, deleteAdmin, updateAdmin , resetPassword,resetverif} from '../controllers/AdminController.mjs';
import validationToken from '../middleware/ValidateToken.mjs';
// Admin login
const router = express.Router();

router.post('/login', login);

router.post('/resetverif', resetverif);
router.post('/resetPassword', resetPassword);
router.post('/register', register);

router.delete('/:id', validationToken, deleteAdmin);


router.put('/', validationToken, updateAdmin);


export default router;
