import express from 'express';
import {getWeeklyAttendance} from '../controllers/AttendanceController.mjs';
import {getMonthlyAttendance} from '../controllers/AttendanceController.mjs';
import {getMonthlyClassAttendanceData} from '../controllers/AttendanceController.mjs';
import {calculateTotalStudentsPerMajor} from '../controllers/AttendanceController.mjs';
const router = express.Router();
router.get('/weeklyattendance', getWeeklyAttendance);
router.get('/attendancemonthly', getMonthlyAttendance);
router.get('/attendanceclassmonthly', getMonthlyClassAttendanceData);
router.get('/calculateTotalStudentsPerMajor', calculateTotalStudentsPerMajor);

export default router;