import express from "express";
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeachersBySubject,
  getTeachersByDepartment,
  getTeachersByDepartmentAndSubject,
  getAllDepartments,
  //getTeachersByClass
  getALLClasses
} from "../controllers/TeacherController.mjs";

const router = express.Router();

router.route("/").get(getTeachers).post(createTeacher);
router
  .route("/teacher/:id")
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);
router.route("/departments").get(getAllDepartments);
router.route("/departments/:department").get(getTeachersByDepartment);
router.route("/subjects/:subject").get(getTeachersBySubject);
router.route("/class").get(getALLClasses);
router.route('/departments/subjects/:department/:subject').get(getTeachersByDepartmentAndSubject );

export default router;
