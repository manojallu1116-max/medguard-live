import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  totalStock: { type: Number, default: 4 },
  // 🌟 NEW: Flag for lifetime medicines (BP, Sugar, etc.)
  isContinuous: { type: Boolean, default: false } 
});

const scheduleSchema = new mongoose.Schema({
  patientPhone: { type: String, required: true },
  shopId: { type: String, default: 'POS_ENTRY' }, 
  time_slot: { type: String, required: true },
  target_time: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'taken', 'missed', 'expired'] }, 
  
  nextVisitDate: { type: Date, default: null }, 
  consultAlertSent: { type: Boolean, default: false },

  alertLevel: { type: Number, default: 0 },
  lastAlertAt: { type: Date },
  medications: [medicationSchema],
  photo: { type: String, default: '' } 
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);