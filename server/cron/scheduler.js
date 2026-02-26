import cron from 'node-cron';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const getVoiceLanguage = (lang) => {
  if (lang === 'Hindi') return 'hi-IN';
  if (lang === 'Telugu') return 'te-IN'; 
  return 'en-IN';
};

const getSpokenScript = (lang, name, timeSlot, medicines, isSecondCall = false) => {
  if (lang === 'Hindi') {
    if (isSecondCall) return `नमस्ते ${name}। यह मेडगार्ड से आपका दूसरा रिमाइंडर है। कृपया तुरंत ${medicines} लें। पुष्टि करने के लिए 1 दबाएं।`;
    return `नमस्ते ${name}, यह मेडगार्ड है। आपकी ${timeSlot} दवा का समय हो गया है। कृपया ${medicines} लें। पुष्टि करने के लिए 1 दबाएं।`;
  } 
  if (lang === 'Telugu') {
    if (isSecondCall) return `నమస్కారం ${name}. ఇది మెడ్‌గార్డ్ నుండి రెండవ రిమైండర్. దయచేసి వెంటనే ${medicines} తీసుకోండి. నిర్ధారించడానికి 1 నొక్కండి.`;
    return `నమస్కారం ${name}, ఇది మెడ్‌గార్డ్. మీ ${timeSlot} మందుల సమయం అయింది. దయచేసి ${medicines} తీసుకోండి. నిర్ధారించడానికి 1 నొక్కండి.`;
  }
  if (isSecondCall) return `Hello ${name}. This is your second reminder. Please take ${medicines} immediately. Press 1 to confirm.`;
  return `Hello ${name}, this is MedGuard. It is time for your ${timeSlot} medication. Please take ${medicines} now. Press 1 to confirm.`;
};

const getNoInputScript = (lang) => {
  if (lang === 'Hindi') return "हमें कोई उत्तर नहीं मिला। हम बाद में कॉल करेंगे। धन्यवाद।";
  if (lang === 'Telugu') return "మాకు ఎలాంటి సమాధానం రాలేదు. మేము మళ్లీ కాల్ చేస్తాము. ధన్యవాదాలు.";
  return "We did not receive any input. We will call you back later. Goodbye.";
};

export const startCronJobs = () => {
  console.log("🤖 MedGuard Automation Robot has started!");

  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentHourStr = now.getHours() % 12 || 12;
    const currentMinStr = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const currentTimeStr = `${currentHourStr}:${currentMinStr} ${ampm}`;

    console.log(`\n🤖 [${currentTimeStr}] Robot is awake! Checking database...`);

    try {
      const pendingSchedules = await Schedule.find({ status: 'pending' });
      console.log(`🤖 Found ${pendingSchedules.length} pending medicines.`);

      for (const schedule of pendingSchedules) {
        const user = await User.findOne({ phone: schedule.patientPhone });
        if (!user || user.reminderType === 'none') continue;

        const voiceLang = getVoiceLanguage(user.language);
        const targetPatientPhone = `+91${user.phone}`; 
        const spokenMedicines = schedule.medications.map(med => `${med.qty} ${med.name}`).join(' and ');
        
        const webhookUrl = `${process.env.PUBLIC_URL}/api/alerts/webhook/${schedule._id}`;

        // LEVEL 0: 1st Alert!
        if (schedule.alertLevel === 0 && schedule.target_time === currentTimeStr) {
          console.log(`[ALERT 1] Ringing ${user.name}... Waiting for Keypad '1'...`);
          if (user.reminderType === 'call') {
            try {
              const script = getSpokenScript(user.language, user.name, schedule.time_slot, spokenMedicines, false);
              const twimlMsg = `
                <Response>
                  <Gather numDigits="1" action="${webhookUrl}" method="POST" timeout="10">
                    <Say language="${voiceLang}">${script}</Say>
                  </Gather>
                  <Say language="${voiceLang}">${getNoInputScript(user.language)}</Say>
                </Response>
              `;
              await client.calls.create({ twiml: twimlMsg, to: targetPatientPhone, from: process.env.TWILIO_PHONE_NUMBER });
              console.log(`✅ Call 1 successfully sent!`);
            } catch (err) { console.error("❌ TWILIO ERROR:", err.message); }
          }
          schedule.alertLevel = 1;
          schedule.lastAlertAt = new Date();
          await schedule.save();
        }
        
        // LEVEL 1: 2nd Alert!
        else if (schedule.alertLevel === 1) {
          const diffMins = Math.floor((now - new Date(schedule.lastAlertAt)) / 60000);
          if (diffMins >= 1) { 
            console.log(`[ALERT 2] Recalling ${user.name}... Waiting for Keypad '1'...`);
            if (user.reminderType === 'call') {
              try {
                const script = getSpokenScript(user.language, user.name, schedule.time_slot, spokenMedicines, true);
                const twimlMsg = `
                  <Response>
                    <Gather numDigits="1" action="${webhookUrl}" method="POST" timeout="10">
                      <Say language="${voiceLang}">${script}</Say>
                    </Gather>
                    <Say language="${voiceLang}">${getNoInputScript(user.language)}</Say>
                  </Response>
                `;
                await client.calls.create({ twiml: twimlMsg, to: targetPatientPhone, from: process.env.TWILIO_PHONE_NUMBER });
                console.log(`✅ Call 2 successfully sent!`);
              } catch (err) { console.error("❌ TWILIO ERROR:", err.message); }
            }
            schedule.alertLevel = 2;
            schedule.lastAlertAt = new Date();
            await schedule.save();
          }
        }
        
        // LEVEL 2: Escalate to SMS!
        else if (schedule.alertLevel === 2) {
          const diffMins = Math.floor((now - new Date(schedule.lastAlertAt)) / 60000);
          if (diffMins >= 1 && user.caretakerPhone) {
            console.log(`[ALERT 3] Escalating! Texting Caretaker...`);
            try {
              await client.messages.create({
                body: `🚨 MedGuard Emergency: ${user.name} missed their medication (${spokenMedicines}). Please check on them.`,
                to: `+91${user.caretakerPhone}`,
                from: process.env.TWILIO_PHONE_NUMBER
              });
              console.log("✅ SMS successfully sent to Caretaker!");
            } catch (err) { console.error("❌ TWILIO SMS ERROR:", err.message); }
            schedule.alertLevel = 3; 
            await schedule.save();
          }
        }
      }
    } catch (error) { console.error("Cron Error:", error); }
  });
};