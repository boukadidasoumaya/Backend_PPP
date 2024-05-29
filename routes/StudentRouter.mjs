import express from 'express';
import { getStudents, getStudentById,getStudentsByMajor, createStudent, updateStudent, deleteStudent, getStudentsByYear, getStudentsByMajorAndByYear,dropStudentsByMajorAndYear} from '../controllers/StudentController.mjs';
import { createStudentsByCSV } from '../middleware/ManageCSVFile.mjs';
const router = express.Router();
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

const upload = multer({ dest: '../uploads' });

router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);
router.route('/majors/:major').get(getStudentsByMajor);
router.route('/year/:year').get(getStudentsByYear);
router.route('/majoryear/:major/:year').get(getStudentsByMajorAndByYear);
router.route('/upload').post(upload.single('csv'),createStudentsByCSV);
router.route('/drop/:major/:year').delete(dropStudentsByMajorAndYear);
export default router;