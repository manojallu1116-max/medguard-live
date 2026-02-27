import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  // 🌟 ACTUALLY FIXED: The code now matches the comment!
  totalStock: { type: Number, default: 4 } 
});

const scheduleSchema = new mongoose.Schema({
  patientPhone: { type: String, required: true },
  shopId: { type: String, default: 'POS_ENTRY' }, 
  time_slot: { type: String, required: true },
  target_time: { type: String, required: true },
  // 🌟 ADDED 'expired' to the allowed status list
  status: { type: String, default: 'pending', enum: ['pending', 'taken', 'missed', 'expired'] }, 
  
  // 🌟 NEW: Doctor Consultation Date Logic
  nextVisitDate: { type: Date, default: null }, 
  consultAlertSent: { type: Boolean, default: false },

  alertLevel: { type: Number, default: 0 },
  lastAlertAt: { type: Date },
  medications: [medicationSchema],
  photo: { type: String, default: '' } 
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);