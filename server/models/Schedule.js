import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  patientPhone: { type: String, required: true },
  shopId: { type: String, required: true },
  time_slot: { type: String, required: true },
  target_time: { type: String, required: true }, // e.g., "08:00 AM"
  status: { type: String, enum: ['pending', 'taken', 'missed'], default: 'pending' },
  medications: [{ name: String, qty: Number }],
  
  // 🌟 NEW: Tracking the Robot's actions
  alertLevel: { type: Number, default: 0 }, // 0: None, 1: 1st Call, 2: 2nd Call, 3: SMS to Caretaker
  lastAlertAt: { type: Date } // Timestamp to calculate the "10 minute" wait
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);