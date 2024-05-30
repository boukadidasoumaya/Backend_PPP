import express from 'express';
import {getWeeklyAttendance} from '../controllers/AttendanceController.mjs';
import {getMonthlyAttendance} from '../controllers/AttendanceController.mjs';
import {getMonthlyClassAttendanceData} from '../controllers/AttendanceController.mjs';
import {calculateTotalStudentsPerYear} from '../controllers/AttendanceController.mjs';
import {calculateTotalStudentsPerMajor} from '../controllers/AttendanceController.mjs';
import {calculateAbsences} from '../controllers/AttendanceController.mjs';
import {calculateAbsencesPerMajor} from '../controllers/AttendanceController.mjs';
import {calculateAbsencesPerYear} from '../controllers/AttendanceController.mjs';
import {calculateAverageAbsences} from '../controllers/AttendanceController.mjs';
const router = express.Router();
router.get('/weeklyattendance', getWeeklyAttendance);
router.get('/calculateAverageAbsences', calculateAverageAbsences);
router.get('/attendancemonthly', getMonthlyAttendance);
router.get('/attendanceclassmonthly', getMonthlyClassAttendanceData);
router.get('/calculateTotalStudentsPerMajor', calculateTotalStudentsPerMajor);
router.get('/calculateTotalStudentsPerYear', calculateTotalStudentsPerYear );
router.get('/abscence',calculateAbsences)
router.get('/calculateAbsencesPerMajor',calculateAbsencesPerMajor)
router.get('/calculateAbsencesPerYear',calculateAbsencesPerYear)
export default router;
