import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req, res) => {
  try {
    const { name, phone, password, familyPin, role, shopId, isDonor, bloodGroup, lat, lng } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: "User with this phone number already exists!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name, phone, password: hashedPassword, familyPin,
      role: role || 'patient',
      shopId: role === 'clinic' ? shopId : undefined,
      isDonor: isDonor || false,
      bloodGroup: isDonor ? bloodGroup : ''
    });

    if (lat && lng) {
      newUser.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)] 
      };
    }

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials!" });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'fallback_secret_key', 
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      token, 
      user: { name: user.name, phone: user.phone, role: user.role, shopId: user.shopId }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed." });
  }
};

// 🌟 BROUGHT THIS BACK: User Settings Update
export const updateSettings = async (req, res) => {
  try {
    const { phone, caretakerPhone, reminderType } = req.body;
    
    const user = await User.findOneAndUpdate(
      { phone },
      { caretakerPhone, reminderType },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Settings updated successfully!" });
  } catch (error) {
    console.error("Settings Update Error:", error);
    res.status(500).json({ error: "Failed to update settings." });
  }
};