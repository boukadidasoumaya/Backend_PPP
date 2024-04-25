import express from "express";
import {
  getTimeTables,
  getTimeTableById,
  createTimeTable,
  updateTimeTable,
  deleteTimeTable,
} from "../controllers/TimeTableController.mjs";

const router = express.Router();

router.route("/").get(getTimeTables).post(createTimeTable);
router
  .route("/:id")
  .get(getTimeTableById)
  .put(updateTimeTable)
  .delete(deleteTimeTable);

export default router;
