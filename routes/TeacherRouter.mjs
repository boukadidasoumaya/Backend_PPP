import express from 'express';
import { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher, getTeachersByDepartment, getTeachersByDepartmentAndYear, getAllDepartments, getAllSubjects } from '../controllers/TeacherController.mjs';

const router = express.Router();

router.route('/').get(getTeachers).post(createTeacher);
router.route('/:id').get(getTeacherById).put(updateTeacher).delete(deleteTeacher);
router.route('/departments/:department').get(getTeachersByDepartment);
//router.route('/teachers/departments/:department/year/:year').get(getTeachersByDepartmentAndYear);

export default router;
