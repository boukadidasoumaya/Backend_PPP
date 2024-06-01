import express from 'express';
import { getClasses,getAllMajors,getAllLevels, getClassById,countClasses, createClass, updateClass, deleteClass } from '../controllers/ClassController.mjs';

const router = express.Router();
router.route('/count').get(countClasses)

router.route('/').get(getClasses).post(createClass);
router.route('/majors').get(getAllMajors);
router.route('/levels').get(getAllLevels);
router.route('/:id').get(getClassById).put(updateClass).delete(deleteClass);

export default router;
