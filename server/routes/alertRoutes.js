import express from 'express';
import { sendEmergencySMS, handleTwilioWebhook, handleLanguageSelection } from '../controllers/alertController.js';

const router = express.Router();

// 1. SMS Alert Route
router.post('/sms', sendEmergencySMS);

// 2. Webhook: The standard medicine confirmation (Listens for Press 1)
router.post('/webhook/:scheduleId', handleTwilioWebhook);

// 3. Webhook: The NEW Language Selection IVR (Listens for Press 1, 2, or 3)
router.post('/language/:scheduleId', handleLanguageSelection);

export default router;