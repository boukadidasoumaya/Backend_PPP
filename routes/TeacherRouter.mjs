// router for teacher 
//
import express from 'express';
import { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } from '../controllers/TeacherController.mjs';

const router = express.Router();

router.route('/').get(getTeachers).post(createTeacher);
router.route('/:id').get(getTeacherById).put(updateTeacher).delete(deleteTeacher);

export default router;
