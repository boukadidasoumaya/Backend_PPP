// give me router for student 

import express from 'express';
import { getStudents, getStudentById,getStudentsByMajor, createStudent,totalStudents, updateStudent, deleteStudent, getStudentsByYear, getStudentsByMajorAndByYear} from '../controllers/StudentController.mjs';

const router = express.Router();

router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);
router.route('/majors/:major').get(getStudentsByMajor);
router.route('/year/:year').get(getStudentsByYear);
router.route('/majoryear/:major/:year').get(getStudentsByMajorAndByYear);
router.route('/total-students').get(totalStudents);

export default router;