import express from "express";
import {
  getSubjects,
  getSubjectById,
  getSubjectByName,
  getSubjectsByMajor,
  getSubjectsByYear,
  getSubjectsByMajorAndByYear,
  getSubjectsByTeacher,
  getSubjectsByTeacherAndMajor,
  getSubjectsByTeacherAndYear,
  getSubjectsByTeacherMajorAndYear,
  getAllModules,
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.mjs";

const router = express.Router();

router.route("/").get(getSubjects).post(createSubject);
router.route("/modules").get(getAllModules);
router.route("/subjects").get(getAllSubjects);
router
  .route("/:id")
  .get(getSubjectById)
  .put(updateSubject)
  .delete(deleteSubject);
router.route("/subject/:subjectName").get(getSubjectByName);
router.route("/majors/:major").get(getSubjectsByMajor);
router.route("/year/:year").get(getSubjectsByYear);
router.route("/majoryear/:major/:year").get(getSubjectsByMajorAndByYear);
router.route("/teacher/:teacher").get(getSubjectsByTeacher);
router.route("/teacheryear/:teacher/:year").get(getSubjectsByTeacherAndYear);
router.route("/teachermajor/:teacher/:major").get(getSubjectsByTeacherAndMajor);
router
  .route("/teachermajoryear/:teacher/:major/:year")
  .get(getSubjectsByTeacherMajorAndYear);

export default router;
