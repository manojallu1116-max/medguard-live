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
    if (isSecondCall) return `Namaste ${name}. Yeh Med-guard se aapka doosra reminder hai. Kripaya turant ${medicines} lein. Confirm karne ke liye, 1 dabayein.`;
    return `Namaste ${name}, yeh Med-guard hai. Aapki ${timeSlot} dawa ka samay ho gaya hai. Kripaya ${medicines} lein. Confirm karne ke liye, 1 dabayein.`;
  } 
  if (lang === 'Telugu') {
    if (isSecondCall) return `Namaskaram ${name}. Idi Med-guard nundi rendova reminder. Dayachesi ventane ${medicines} teesukondi. Confirm cheyadaniki, 1 nokkandi.`;
    return `Namaskaram ${name}, idi Med-guard. Mee ${timeSlot} mandula samayam ayindi. Dayachesi ${medicines} teesukondi. Confirm cheyadaniki, 1 nokkandi.`;
  }
  if (isSecondCall) return `Hello ${name}. This is your second reminder. Please take ${medicines} immediately. Press 1 to confirm.`;
  return `Hello ${name}, this is MedGuard. It is time for your ${timeSlot} medication. Please take ${medicines} now. Press 1 to confirm.`;
};

const getNoInputScript = (lang) => {
  if (lang === 'Hindi') return "Humein koi jawaab nahi mila. Hum baad mein call karenge. Dhanyawad.";
  if (lang === 'Telugu') return "Maku elanti samadhanam raledu. Memu malli call chestamu. Dhanyavadalu.";
  return "We did not receive any input. We will call you back later. Goodbye.";
};

export const startCronJobs = () => {
  console.log("🤖 MedGuard Automation Robot has started!");

  cron.schedule('* * * * *', async () => {
    const now = new Date();
    
    const currentHourStr = (now.getHours() % 12 || 12).toString().padStart(2, '0');
    const currentMinStr = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const currentTimeStr = `${currentHourStr}:${currentMinStr} ${ampm}`;

    console.log(`\n🤖 [${currentTimeStr}] Robot is awake! Checking database...`);

    try {
      const pendingSchedules = await Schedule.find({ status: 'pending' });
      
      if (pendingSchedules.length > 0) {
        console.log(`🤖 Found ${pendingSchedules.length} pending medicines.`);
      }

      for (const schedule of pendingSchedules) {
        
        // 🌟 --- NEW SMART EXPIRY LOGIC WITH CONTINUOUS OVERRIDE --- 🌟
        if (schedule.nextVisitDate) {
          const today = new Date();
          const visitDate = new Date(schedule.nextVisitDate);
          
          today.setHours(0, 0, 0, 0);
          visitDate.setHours(0, 0, 0, 0);
          
          const timeDiff = visitDate.getTime() - today.getTime();
          const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

          // 1. If Date has passed, filter out non-continuous meds!
          if (daysLeft < 0) {
            // Only keep medicines marked as Continuous (BP/Sugar)
            const continuousMeds = schedule.medications.filter(med => med.isContinuous);

            if (continuousMeds.length === 0) {
              console.log(`🛑 Prescription Expired for ${schedule.patientPhone}. No continuous meds. Stopping reminders.`);
              schedule.status = 'expired';
              await schedule.save();
              continue; // Skip the rest of the loop, NO CALL!
            } else {
              console.log(`♻️ Prescription Expired, but keeping continuous meds running for ${schedule.patientPhone}!`);
              schedule.medications = continuousMeds;
              schedule.nextVisitDate = null; // Clear the expiry date so it runs forever now
              await schedule.save();
            }
          }

          // 2. Warning SMS logic remains the same
          if (daysLeft === 2 && !schedule.consultAlertSent) {
            console.log(`⚠️ 2 Days Left! Sending Consult Warning.`);
            try {
              const medName = schedule.medications.length > 0 ? schedule.medications[0].name : "your medicines";
              let phoneNum = schedule.patientPhone;
              if (!phoneNum.startsWith('+')) phoneNum = `+91${phoneNum}`; 

              await client.messages.create({
                body: `MedGuard Alert: Your prescription for ${medName} ends in 2 days. Please consult your doctor. Do not take leftovers without advice.`,
                to: phoneNum,
                from: process.env.TWILIO_PHONE_NUMBER
              });
              schedule.consultAlertSent = true;
              await schedule.save();
            } catch (err) { console.error("❌ Twilio Warning Error:", err.message); }
          }
        }
        // 🌟 -------------------------------------------------- 🌟

        const user = await User.findOne({ phone: schedule.patientPhone });
        if (!user || user.reminderType === 'none') continue;

        const voiceLang = getVoiceLanguage(user.language);
        const targetPatientPhone = `+91${user.phone}`; 
        const spokenMedicines = schedule.medications.map(med => `${med.qty} ${med.name}`).join(' and ');
        
        const webhookUrl = `${process.env.PUBLIC_URL}/api/alerts/webhook/${schedule._id}`;

        // LEVEL 0: 1st Alert!
        if (schedule.alertLevel === 0 && schedule.target_time === currentTimeStr) {
          console.log(`[ALERT 1] Ringing ${user.name}... Checking Language Preferences...`);
          
          if (user.reminderType === 'call') {
            try {
              let twimlMsg = '';

              if (!user.language || user.language === 'none' || user.language === '') {
                console.log(`🗣️ No language found. Asking for preference...`);
                const languageWebhookUrl = `${process.env.PUBLIC_URL}/api/alerts/language/${schedule._id}`;
                
                twimlMsg = `
                  <Response>
                    <Gather numDigits="1" action="${languageWebhookUrl}" method="POST" timeout="15">
                      <Say language="en-IN">Welcome to Med Guard. For English, press 1.</Say>
                      <Say language="hi-IN">Hindi ke liye, do dabayein.</Say>
                      <Say language="te-IN">Telugu kosam, moodu nokkandi.</Say>
                    </Gather>
                    <Say language="en-IN">We did not receive any input. We will call back later. Goodbye.</Say>
                  </Response>
                `;
              } 
              else {
                console.log(`🗣️ Language known (${user.language}). Skipping menu...`);
                const script = getSpokenScript(user.language, user.name, schedule.time_slot, spokenMedicines, false);
                
                twimlMsg = `
                  <Response>
                    <Gather numDigits="1" action="${webhookUrl}" method="POST" timeout="10">
                      <Say language="${voiceLang}">${script}</Say>
                    </Gather>
                    <Say language="${voiceLang}">${getNoInputScript(user.language)}</Say>
                  </Response>
                `;
              }

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
                body: `MedGuard SOS: ${user.name} missed meds (${spokenMedicines}). Pls check!`,
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