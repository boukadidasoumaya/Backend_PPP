// give me router for student 

import express from 'express';
import { getStudents, getStudentById,getStudentsByMajor, createStudent, updateStudent, deleteStudent, getStudentsByYear, getStudentsByMajorAndByYear} from '../controllers/StudentController.mjs';
import { createStudentsByCSV } from '../middleware/ManageCSVFile.mjs';
const router = express.Router();
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);
router.route('/majors/:major').get(getStudentsByMajor);
router.route('/year/:year').get(getStudentsByYear);
router.route('/majoryear/:major/:year').get(getStudentsByMajorAndByYear);
router.route('/upload',upload.single('CSVFile')).post(createStudentsByCSV);

export default router;