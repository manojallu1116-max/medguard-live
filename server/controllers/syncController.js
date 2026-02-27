import Schedule from '../models/Schedule.js';
import User from '../models/User.js';
import twilio from 'twilio';

export const syncPosBill = async (req, res) => {
  try {
    const { patient_phone, shop_id, medicines, next_visit_date } = req.body;
    const morningMeds = []; const afternoonMeds = []; const nightMeds = [];

    const defaultHdPhoto = "https://images.unsplash.com/photo-1584308666744-24d5e478acba?auto=format&fit=crop&w=400&q=80";

    // 🌟 ADDED isContinuous mapping
    medicines.forEach(med => {
      med.dosage_routine.forEach(dose => {
        if (dose.time_slot === 'Morning') morningMeds.push({ name: med.name, qty: dose.qty, isContinuous: med.isContinuous });
        if (dose.time_slot === 'Afternoon') afternoonMeds.push({ name: med.name, qty: dose.qty, isContinuous: med.isContinuous });
        if (dose.time_slot === 'Night') nightMeds.push({ name: med.name, qty: dose.qty, isContinuous: med.isContinuous });
      });
    });

    const visitDateObj = next_visit_date ? new Date(next_visit_date) : null;

    if (morningMeds.length > 0) await Schedule.create({ patientPhone: patient_phone, shopId: shop_id, time_slot: 'Morning', target_time: '08:00 AM', medications: morningMeds, photo: defaultHdPhoto, nextVisitDate: visitDateObj });
    if (afternoonMeds.length > 0) await Schedule.create({ patientPhone: patient_phone, shopId: shop_id, time_slot: 'Afternoon', target_time: '02:00 PM', medications: afternoonMeds, photo: defaultHdPhoto, nextVisitDate: visitDateObj });
    if (nightMeds.length > 0) await Schedule.create({ patientPhone: patient_phone, shopId: shop_id, time_slot: 'Night', target_time: '08:00 PM', medications: nightMeds, photo: defaultHdPhoto, nextVisitDate: visitDateObj });

    res.status(200).json({ message: "Prescription synced with Expiry Date and Continuous Flags!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to sync bill" });
  }
};

export const getPatientSchedule = async (req, res) => {
  try {
    const { phone } = req.params;
    const schedules = await Schedule.find({ patientPhone: phone }).sort({ createdAt: -1 });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
};

export const getFamilySchedule = async (req, res) => {
  try {
    const { phone, familyPin } = req.body;
    const user = await User.findOne({ phone, role: 'patient' });
    if (!user) return res.status(404).json({ message: "Patient not found." });
    if (user.familyPin !== familyPin) return res.status(401).json({ message: "Access Denied: Incorrect Family PIN." });

    const schedules = await Schedule.find({ patientPhone: phone }).sort({ createdAt: -1 });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch family schedule" });
  }
};

export const markTaken = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    const newlyLowStockMeds = []; 

    schedule.medications.forEach(med => {
      const oldStock = med.totalStock; 
      const warningThreshold = med.qty * 3; 

      if (med.totalStock >= med.qty) med.totalStock -= med.qty; 
      else med.totalStock = 0; 

      if (oldStock > warningThreshold && med.totalStock <= warningThreshold) {
        newlyLowStockMeds.push(`${med.name}: Only ${med.totalStock} left!`);
      }
    });

    schedule.status = 'taken';
    schedule.alertLevel = 0;
    await schedule.save();

    if (newlyLowStockMeds.length > 0) {
      try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const cleanMedsList = newlyLowStockMeds.map(m => `- ${m}`).join('\n');
        const messageBody = `MedGuard Refill Alert: Your meds finish in 2-3 days. Please visit your doctor for a checkup.\n${cleanMedsList}`;
        
        let phoneNum = schedule.patientPhone;
        if (!phoneNum.startsWith('+')) phoneNum = `+91${phoneNum}`; 

        await client.messages.create({ body: messageBody, from: process.env.TWILIO_PHONE_NUMBER, to: phoneNum });
      } catch (twilioErr) {
        console.error("❌ Twilio Error:", twilioErr.message);
      }
    }
    res.status(200).json({ message: "Medicine marked as taken & inventory updated!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

export const updateScheduleTime = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { newTime } = req.body;
    const [hours, minutes] = newTime.split(':');
    const formattedTime = `${(parseInt(hours) % 12 || 12).toString().padStart(2, '0')}:${minutes} ${parseInt(hours) >= 12 ? 'PM' : 'AM'}`;

    await Schedule.findByIdAndUpdate(scheduleId, { target_time: formattedTime, alertLevel: 0 });
    res.status(200).json({ message: "Time updated!", target_time: formattedTime });
  } catch (error) {
    res.status(500).json({ error: "Failed to update time" });
  }
};

export const addManualReminder = async (req, res) => {
  try {
    const { phone, medicineName, timeSlot, quantity, totalStock, photo } = req.body;

    let target_time = "09:00 AM";
    if (timeSlot === "Afternoon") target_time = "01:00 PM";
    if (timeSlot === "Night") target_time = "08:00 PM";

    const parsedQty = parseInt(quantity) || 1; 
    const parsedStock = parseInt(totalStock) || 15; 
    const fallbackShopId = "MANUAL_ENTRY";

    let finalPhoto = photo || "";
    if (!finalPhoto) {
      finalPhoto = "https://images.unsplash.com/photo-1584308666744-24d5e478acba?auto=format&fit=crop&w=400&q=80";
    }

    const newSchedule = new Schedule({
      patientPhone: phone,
      shopId: fallbackShopId,               
      time_slot: timeSlot,
      target_time: target_time,
      status: 'pending',
      alertLevel: 0,
      medications: [{ name: medicineName, qty: parsedQty, totalStock: parsedStock, isContinuous: false }], 
      photo: finalPhoto 
    });

    await newSchedule.save();
    res.status(201).json({ message: "Reminder added!", schedule: newSchedule });
    
  } catch (error) {
    console.error("Add Reminder Error:", error);
    res.status(500).json({ error: "Failed to add reminder" });
  }
};