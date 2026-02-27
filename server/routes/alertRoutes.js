import express from 'express';
import twilio from 'twilio';
import User from '../models/User.js';
import { sendEmergencySMS, handleTwilioWebhook, handleLanguageSelection } from '../controllers/alertController.js';

const router = express.Router();

// 1. SMS Alert Route
router.post('/sms', sendEmergencySMS);

// 🚨 NEW: Emergency SOS Route (SMS + Automated Call at the same time!)
router.post('/sos', async (req, res) => {
  try {
    const { phone, location } = req.body;
    
    const user = await User.findOne({ phone: phone });
    if (!user || !user.caretakerPhone) {
      return res.status(400).json({ error: "No caretaker phone found for this user." });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // 📱 1. Prepare the Ultra-Short SMS
    const smsPromise = client.messages.create({
      body: `SOS! ${user.name}: maps.google.com/?q=${location}`,
      to: `+91${user.caretakerPhone}`,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    // 📞 2. Prepare the Automated Voice Call
    const twimlMsg = `
      <Response>
        <Say language="en-IN">Emergency Alert. ${user.name} has pressed the S O S panic button. Please check your text messages immediately for their live GPS location.</Say>
      </Response>
    `;

    const callPromise = client.calls.create({
      twiml: twimlMsg,
      to: `+91${user.caretakerPhone}`,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    // 🚀 3. FIRE BOTH AT THE EXACT SAME TIME!
    await Promise.all([smsPromise, callPromise]);

    res.status(200).json({ message: "SOS Call and SMS Sent Successfully!" });
  } catch (error) {
    console.error("SOS Error:", error);
    res.status(500).json({ error: "Failed to send SOS" });
  }
});

// 2. Webhook: The standard medicine confirmation
router.post('/webhook/:scheduleId', handleTwilioWebhook);

// 3. Webhook: The NEW Language Selection IVR
router.post('/language/:scheduleId', handleLanguageSelection);

export default router;