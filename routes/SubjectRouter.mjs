import express from "express";
import {
  getSubjects,
  getSubjectById,
  getSubjectByName,
  getSubjectsByMajor,
  getSubjectsByYear,
  getSubjectsByMajorAndByYear,
  getSubjectsByModule,
  getSubjectsByModuleAndMajor,
  getSubjectsByModuleAndYear,
  getSubjectsByModuleMajorAndYear,
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
router.route("/:id").put(updateSubject).delete(deleteSubject);
router.route("/subject/:subjectName").get(getSubjectByName);
router.route("/majors/:major").get(getSubjectsByMajor);
router.route("/year/:year").get(getSubjectsByYear);
router.route("/majoryear/:major/:year").get(getSubjectsByMajorAndByYear);
router.route("/module/:module").get(getSubjectsByModule);
router.route("/moduleyear/:module/:year").get(getSubjectsByModuleAndYear);
router.route("/modulemajor/:module/:major").get(getSubjectsByModuleAndMajor);
router
  .route("/modulemajoryear/:module/:major/:year")
  .get(getSubjectsByModuleMajorAndYear);

export default router;
