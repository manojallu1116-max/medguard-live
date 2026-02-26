import Schedule from '../models/Schedule.js';
import User from '../models/User.js';

export const syncPosBill = async (req, res) => {
  try {
    const { patient_phone, shop_id, medicines } = req.body;
    const morningMeds = []; 
    const afternoonMeds = []; 
    const nightMeds = [];

    medicines.forEach(med => {
      med.dosage_routine.forEach(dose => {
        if (dose.time_slot === 'Morning') morningMeds.push({ name: med.name, qty: dose.qty });
        if (dose.time_slot === 'Afternoon') afternoonMeds.push({ name: med.name, qty: dose.qty });
        if (dose.time_slot === 'Night') nightMeds.push({ name: med.name, qty: dose.qty });
      });
    });

    if (morningMeds.length > 0) await Schedule.create({ patientPhone: patient_phone, shopId: shop_id, time_slot: 'Morning', target_time: '08:00 AM', medications: morningMeds });
    if (afternoonMeds.length > 0) await Schedule.create({ patientPhone: patient_phone, shopId: shop_id, time_slot: 'Afternoon', target_time: '02:00 PM', medications: afternoonMeds });
    if (nightMeds.length > 0) await Schedule.create({ patientPhone: patient_phone, shopId: shop_id, time_slot: 'Night', target_time: '08:00 PM', medications: nightMeds });

    res.status(200).json({ message: "Prescription successfully synced to patient app!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to sync bill" });
  }
};

export const getPatientSchedule = async (req, res) => {
  try {
    const { phone } = req.params;
    const schedules = await Schedule.find({ patientPhone: phone });
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
    
    if (user.familyPin !== familyPin) {
      return res.status(401).json({ message: "Access Denied: Incorrect Family PIN." });
    }

    const schedules = await Schedule.find({ patientPhone: phone });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch family schedule" });
  }
};

export const markTaken = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    await Schedule.findByIdAndUpdate(scheduleId, { status: 'taken' });
    res.status(200).json({ message: "Medicine marked as taken!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

// 🌟 ALLOW USER TO CHANGE TIME AND RESET ROBOT ALERTS
export const updateScheduleTime = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { newTime } = req.body;
    
    // Convert 24h time from input (e.g. "14:30") to 12h AM/PM format
    const [hours, minutes] = newTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; 
    const formattedTime = `${formattedHour}:${minutes} ${ampm}`;

    // 🌟 ADDED alertLevel: 0 to reset the robot's memory for this pill!
    await Schedule.findByIdAndUpdate(scheduleId, { 
      target_time: formattedTime,
      alertLevel: 0 
    });
    
    res.status(200).json({ message: "Time updated successfully!", target_time: formattedTime });
  } catch (error) {
    res.status(500).json({ error: "Failed to update time" });
  }
};