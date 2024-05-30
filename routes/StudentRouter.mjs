// give me router for student 

import express from 'express';
import { getStudents, getStudentById,getStudentsByMajor, createStudent,totalStudents, updateStudent, deleteStudent, getStudentsByYear, getStudentsByMajorAndByYear,countStudents} from '../controllers/StudentController.mjs';

const router = express.Router();
router.route('/count').get(countStudents);

router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);
router.route('/majors/:major').get(getStudentsByMajor);
router.route('/year/:year').get(getStudentsByYear);
router.route('/majoryear/:major/:year').get(getStudentsByMajorAndByYear);

export default router;