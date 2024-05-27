import express from 'express';
import {getWeeklyAttendance} from '../controllers/AttendanceController.mjs';
import {getMonthlyAttendance} from '../controllers/AttendanceController.mjs';
const router = express.Router();
router.get('/weeklyattendance', getWeeklyAttendance);
router.get('/attendancemonthly', getMonthlyAttendance);

export default router;