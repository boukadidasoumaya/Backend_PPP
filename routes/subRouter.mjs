import express from 'express';
import {getAllSubjects,getTeachersBySubject} from '../controllers/TeacherController.mjs';

const router = express.Router();

router.route('/').get(getAllSubjects);
router.route('/teachers').get(getTeachersBySubject);


export default router;