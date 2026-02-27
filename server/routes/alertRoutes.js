import express from 'express';
import twilio from 'twilio';
import User from '../models/User.js';
import { sendEmergencySMS, handleTwilioWebhook, handleLanguageSelection } from '../controllers/alertController.js';

const router = express.Router();

// 1. SMS Alert Route
router.post('/sms', sendEmergencySMS);

// 🚨 NEW: Emergency SOS Route (Ultra-Compressed for Twilio Trial limit)
router.post('/sos', async (req, res) => {
  try {
    const { phone, location } = req.body;
    
    // Find the user to get their name and caretaker phone
    const user = await User.findOne({ phone: phone });
    if (!user || !user.caretakerPhone) {
      return res.status(400).json({ error: "No caretaker phone found for this user." });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // 🌟 REMOVED EMOJIS AND SHORTENED TEXT TO AVOID TWILIO CHARACTER LIMIT
    await client.messages.create({
      body: `MedGuard SOS: ${user.name} needs help! Loc: ${location}`,
      to: `+91${user.caretakerPhone}`,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    res.status(200).json({ message: "SOS Sent Successfully!" });
  } catch (error) {
    console.error("SOS Error:", error);
    res.status(500).json({ error: "Failed to send SOS" });
  }
});

// 2. Webhook: The standard medicine confirmation (Listens for Press 1)
router.post('/webhook/:scheduleId', handleTwilioWebhook);

// 3. Webhook: The NEW Language Selection IVR (Listens for Press 1, 2, or 3)
router.post('/language/:scheduleId', handleLanguageSelection);

export default router;