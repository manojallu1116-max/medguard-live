import twilio from 'twilio';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';
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

// 🌟 Helper Functions using Tenglish & Hinglish!
const getVoiceLanguage = (lang) => {
  if (lang === 'Hindi') return 'hi-IN';
  if (lang === 'Telugu') return 'te-IN'; 
  return 'en-IN';
};

const getSuccessScript = (lang) => {
  if (lang === 'Hindi') return "Dhanyawad. Aapki dawa darj kar li gayi hai. Swasth rahein!";
  if (lang === 'Telugu') return "Dhanyavadalu. Mee mandulu namodu cheyabaddayi. Arogyamga undandi!";
  return "Thank you. Your medicine has been marked as taken. Stay healthy and goodbye!";
};

const getFailScript = (lang) => {
  if (lang === 'Hindi') return "Kshama karein, galat input. Kripaya app check karein. Dhanyawad.";
  if (lang === 'Telugu') return "Kshaminchandi, tappu input. Dayachesi app check cheyandi. Dhanyavadalu.";
  return "We did not receive a valid input. Please check your MedGuard app. Goodbye.";
};

// 🌟 1. The Medicine Confirmation Webhook (Press 1)
export const handleTwilioWebhook = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { Digits } = req.body; 

    console.log(`\n📞 [TWILIO] Webhook triggered for Schedule: ${scheduleId}`);
    console.log(`📞 [TWILIO] User pressed button: ${Digits}`);

    const schedule = await Schedule.findById(scheduleId);
    let lang = 'English';
    let voiceLang = 'en-IN';

    if (schedule) {
      const user = await User.findOne({ phone: schedule.patientPhone });
      if (user && user.language) {
        lang = user.language;
        voiceLang = getVoiceLanguage(lang);
      }
    }

    res.type('text/xml'); 

    if (Digits === '1') {
      await Schedule.findByIdAndUpdate(scheduleId, { status: 'taken', alertLevel: 0 });
      console.log(`✅ [TWILIO] Success! Database updated to 'taken'.`);
      
      return res.send(`
        <Response>
          <Say language="${voiceLang}">${getSuccessScript(lang)}</Say>
        </Response>
      `);
    } else {
      console.log(`❌ [TWILIO] User pressed wrong button or none at all.`);
      return res.send(`
        <Response>
          <Say language="${voiceLang}">${getFailScript(lang)}</Say>
        </Response>
      `);
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    res.type('text/xml');
    return res.send(`<Response><Say>Error processing request. Goodbye.</Say></Response>`);
  }
};

// 🌟 2. The Smart Language Setup Webhook (Press 1, 2, or 3)
export const handleLanguageSelection = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { Digits } = req.body; 

    console.log(`\n🗣️ [TWILIO IVR] User pressed: ${Digits} for language selection.`);

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.send(`<Response><Say>Error. Goodbye.</Say></Response>`);
    
    const user = await User.findOne({ phone: schedule.patientPhone });

    // 1. Determine which language they picked
    let selectedLanguage = 'English';
    let voiceLang = 'en-IN';
    if (Digits === '2') { selectedLanguage = 'Hindi'; voiceLang = 'hi-IN'; }
    if (Digits === '3') { selectedLanguage = 'Telugu'; voiceLang = 'te-IN'; }

    // 2. Save it to MongoDB FOREVER!
    user.language = selectedLanguage;
    await user.save();
    console.log(`✅ [TWILIO IVR] Saved ${selectedLanguage} to ${user.name}'s profile!`);

    // 3. Generate the medicine script in their new language
    const spokenMedicines = schedule.medications.map(med => `${med.qty} ${med.name}`).join(' and ');
    let script = `Hello ${user.name}, this is MedGuard. It is time for your ${schedule.time_slot} medication. Please take ${spokenMedicines} now. Press 1 to confirm.`;
    
    if (selectedLanguage === 'Hindi') {
      script = `Namaste ${user.name}, yeh Med-guard hai. Aapki ${schedule.time_slot} dawa ka samay ho gaya hai. Kripaya ${spokenMedicines} lein. Confirm karne ke liye, 1 dabayein.`;
    } else if (selectedLanguage === 'Telugu') {
      script = `Namaskaram ${user.name}, idi Med-guard. Mee ${schedule.time_slot} mandula samayam ayindi. Dayachesi ${spokenMedicines} teesukondi. Confirm cheyadaniki, 1 nokkandi.`;
    }

    // 4. Send them straight to the next step (Press 1 to confirm)
    const webhookUrl = `${process.env.PUBLIC_URL}/api/alerts/webhook/${schedule._id}`;

    res.type('text/xml');
    return res.send(`
      <Response>
        <Gather numDigits="1" action="${webhookUrl}" method="POST" timeout="10">
          <Say language="${voiceLang}">${script}</Say>
        </Gather>
        <Say language="${voiceLang}">We did not receive any input. Goodbye.</Say>
      </Response>
    `);

  } catch (error) {
    console.error("Language Webhook Error:", error);
    res.type('text/xml');
    return res.send(`<Response><Say>Error processing request. Goodbye.</Say></Response>`);
  }
};