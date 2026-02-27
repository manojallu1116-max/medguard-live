import express from 'express';
import twilio from 'twilio';
import User from '../models/User.js';
import { sendEmergencySMS, handleTwilioWebhook, handleLanguageSelection } from '../controllers/alertController.js';

const router = express.Router();

// 1. SMS Alert Route
router.post('/sms', sendEmergencySMS);

// 🚨 NEW: Emergency SOS Route (Sequential to respect Twilio Trial Limits!)
router.post('/sos', async (req, res) => {
  try {
    const { phone, location } = req.body;
    
    const user = await User.findOne({ phone: phone });
    if (!user || !user.caretakerPhone) {
      return res.status(400).json({ error: "No caretaker phone found for this user." });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // 📱 1. Fire the SMS FIRST
    try {
      await client.messages.create({
        body: `SOS! ${user.name}: https://maps.google.com/?q=${location}`,
        to: `+91${user.caretakerPhone}`,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      console.log("✅ SOS SMS Sent Successfully");
    } catch (smsError) {
      console.error("❌ Twilio SMS Error:", smsError.message);
    }

    // 📞 2. Fire the Voice Call SECOND
    try {
      const twimlMsg = `<Response><Say language="en-IN">Emergency Alert. ${user.name} has pressed the S O S panic button. Please check your text messages immediately for their live GPS location.</Say></Response>`;
      
      await client.calls.create({
        twiml: twimlMsg,
        to: `+91${user.caretakerPhone}`,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      console.log("✅ SOS Call Sent Successfully");
    } catch (callError) {
      console.error("❌ Twilio Call Error:", callError.message);
    }

    res.status(200).json({ message: "SOS Triggered!" });
  } catch (error) {
    console.error("SOS Route Error:", error);
    res.status(500).json({ error: "Failed to send SOS" });
  }
});

// 2. Webhook: The standard medicine confirmation
router.post('/webhook/:scheduleId', handleTwilioWebhook);

// 3. Webhook: The NEW Language Selection IVR
router.post('/language/:scheduleId', handleLanguageSelection);

export default router;