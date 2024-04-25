import express from 'express';
import {getAllDepartments ,getAllSubjects} from '../controllers/TeacherController.mjs';

const router = express.Router();

router.route('/').get(getAllDepartments);

export default router;