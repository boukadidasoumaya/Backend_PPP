import express from 'express';
import {getWeeklyAttendance} from '../controllers/AttendanceController.mjs';
import {getMonthlyAttendance} from '../controllers/AttendanceController.mjs';
import {getMonthlyClassAttendanceData} from '../controllers/AttendanceController.mjs';
import {calculateTotalStudentsPerYear} from '../controllers/AttendanceController.mjs';
import {calculateTotalStudentsPerMajor} from '../controllers/AttendanceController.mjs';
import {calculateAbsences} from '../controllers/AttendanceController.mjs';
const router = express.Router();
router.get('/weeklyattendance', getWeeklyAttendance);
router.get('/attendancemonthly', getMonthlyAttendance);
router.get('/attendanceclassmonthly', getMonthlyClassAttendanceData);
router.get('/calculateTotalStudentsPerMajor', calculateTotalStudentsPerMajor);
router.get('/calculateTotalStudentsPerYear', calculateTotalStudentsPerYear );
router.get('/abscence',calculateAbsences)
export default router;