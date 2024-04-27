import express from "express";
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeachersBySubject,
  getTeachersByDepartment,
  getTeachersByDepartmentAndYear,
  getAllDepartments,
} from "../controllers/TeacherController.mjs";

const router = express.Router();

router.route("/").get(getTeachers).post(createTeacher);
router.route("/departments").get(getAllDepartments);
router
  .route("/:id")
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);
router.route("/departments/:department").get(getTeachersByDepartment);
router.route("/subjects/:subject").get(getTeachersBySubject);
//router.route('/teachers/departments/:department/year/:year').get(getTeachersByDepartmentAndYear);

export default router;
