import express from 'express';
import {getAttendance} from '../controllers/AttendanceController.mjs';
const router = express.Router();
router.get('/attendance', getAttendance);
export default router;