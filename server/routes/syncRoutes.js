import express from 'express';
import { syncPosBill, getPatientSchedule, getFamilySchedule, markTaken, updateScheduleTime, addManualReminder } from '../controllers/syncController.js';

const router = express.Router();

router.post('/print-bill', syncPosBill);
router.get('/schedule/:phone', getPatientSchedule); 
router.post('/family-schedule', getFamilySchedule); 
router.patch('/schedule/:scheduleId/take', markTaken); 
router.patch('/schedule/:scheduleId/time', updateScheduleTime); 

// 🌟 NEW: Route to add reminder with photo
router.post('/add-reminder', addManualReminder);

export default router;