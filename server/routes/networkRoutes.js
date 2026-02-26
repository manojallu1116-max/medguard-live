import express from 'express';
import { getBloodDonors, getNearbyClinics } from '../controllers/networkController.js';

const router = express.Router();

// 🩸 Blood Network Route
router.get('/blood/:bloodGroup', getBloodDonors);

// 🏥 NEW: Clinic Locator Route
router.get('/clinics', getNearbyClinics);

export default router;