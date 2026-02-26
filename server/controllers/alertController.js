import twilio from 'twilio';
import Schedule from '../models/Schedule.js';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmergencySMS = async (req, res) => {
  try {
    const { targetPhone, message } = req.body;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: targetPhone });
    res.status(200).json({ message: "SMS Alert sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send SMS." });
  }
};

// 🌟 The Twilio "Press 1" Webhook
export const handleTwilioWebhook = async (req, res) => {
  const { scheduleId } = req.params;
  const { Digits } = req.body; 

  console.log(`\n📞 [TWILIO] Webhook triggered for Schedule: ${scheduleId}`);
  console.log(`📞 [TWILIO] User pressed button: ${Digits}`);

  res.type('text/xml'); 

  if (Digits === '1') {
    await Schedule.findByIdAndUpdate(scheduleId, { status: 'taken', alertLevel: 0 });
    console.log(`✅ [TWILIO] Success! Database updated to 'taken'.`);
    
    return res.send(`
      <Response>
        <Say language="en-IN">Thank you. Your medicine has been marked as taken. Stay healthy and goodbye!</Say>
      </Response>
    `);
  } else {
    console.log(`❌ [TWILIO] User pressed wrong button or none at all.`);
    return res.send(`
      <Response>
        <Say language="en-IN">We did not receive a valid input. Please check your MedGuard app. Goodbye.</Say>
      </Response>
    `);
  }
};