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
  getALLClasses,
  getTeacherDataWithAbsences,
  deleteTeachersByDepartment,
} from "../controllers/TeacherController.mjs";
import { createTeachersByCSV } from "../middleware/ManageCSVFileTeachers.mjs";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

const upload = multer({ dest: '../uploads' });
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
router.route('/teacherProfile/teacherDataWithAbsences/:id').get(getTeacherDataWithAbsences);

router.route('/drop/departments/:department').delete(deleteTeachersByDepartment);

router.route('/upload').post(upload.single('csv'),createTeachersByCSV);

export default router;
