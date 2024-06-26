import express from "express";
import {
  getSubjects,
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
  dropSubjectsByMajorAndYear,
} from "../controllers/subjectController.mjs";
import { importSubjectsFromCSV } from "../middleware/ManageCSVFileSubjects.mjs";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "../uploads" });

router.route("/").get(getSubjects).post(createSubject);
router.route("/upload").post(upload.single("csv"), importSubjectsFromCSV);
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
router.route("/drop/:major/:year").delete(dropSubjectsByMajorAndYear);

export default router;
