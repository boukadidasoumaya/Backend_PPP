// give me router for student 

import express from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/StudentController.mjs';

const router = express.Router();

router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);

export default router;