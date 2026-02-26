import express from 'express';
import { syncPosBill, getPatientSchedule, getFamilySchedule, markTaken, updateScheduleTime } from '../controllers/syncController.js';

const router = express.Router();

router.post('/print-bill', syncPosBill);
router.get('/schedule/:phone', getPatientSchedule); 
router.post('/family-schedule', getFamilySchedule); 
router.patch('/schedule/:scheduleId/take', markTaken); 
router.patch('/schedule/:scheduleId/time', updateScheduleTime); // 🌟 NEW: Change Time Route

export default router;