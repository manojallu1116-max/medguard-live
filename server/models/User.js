import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, 
  password: { type: String, required: true }, 
  familyPin: { type: String, required: true }, 
  role: { type: String, enum: ['patient', 'clinic', 'observer'], default: 'patient' },
  language: { type: String, default: 'English' }, // Will be used for Twilio Voice Language!
  isDonor: { type: Boolean, default: false },
  bloodGroup: { type: String },
  shopId: { type: String },
  
  // 🌟 NEW: User App Settings for Automation
  caretakerPhone: { type: String, default: '' },
  reminderType: { type: String, enum: ['call', 'notification', 'none'], default: 'call' },
  
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } 
  }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
export default mongoose.model('User', userSchema);