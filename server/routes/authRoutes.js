import express from 'express';
import { register, login, updateSettings } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/settings', updateSettings); // 🌟 NEW ROUTE ADDED

export default router;