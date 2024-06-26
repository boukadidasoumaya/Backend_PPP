import express from "express";
import {
  getTimeTables,
  getTimeTableById,
  createTimeTable,
  updateTimeTable,
  deleteTimeTable,
  getTimeTablesByMajorAndYear,
  dropTimeTablesByMajorYearAndSemester
} from "../controllers/TimeTableController.mjs";
import {importTimeTableFromCSV} from '../middleware/ManageCSVFileTimeTable.mjs';
const router = express.Router();
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

const upload = multer({ dest: '../uploads' });
router.route("/").get(getTimeTables).post(createTimeTable);
router
  .route("/:id")
  .get(getTimeTableById)
  .put(updateTimeTable)
  .delete(deleteTimeTable);

router.route('/upload').post(upload.single('csv'),importTimeTableFromCSV);
router.route('/majoryear/:major/:year').get(getTimeTablesByMajorAndYear);
router.route('/drop/:major/:year/:semester').delete(dropTimeTablesByMajorYearAndSemester);
export default router;
