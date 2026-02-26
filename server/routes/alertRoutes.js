import express from 'express';
import { sendEmergencySMS, handleTwilioWebhook } from '../controllers/alertController.js';

const router = express.Router();

router.post('/send-sms', sendEmergencySMS);

// 🌟 NEW: Twilio POSTs to this route when a button is pressed
router.post('/webhook/:scheduleId', handleTwilioWebhook); 

export default router;