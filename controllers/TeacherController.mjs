import Teacher from '../models/TeacherModel.mjs';
import asyncHandler from 'express-async-handler';

// @desc    Get all teachers
// @route   GET /teachers
// @access  Public
export const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find();
  res.status(200).json({ success: true, data: teachers });
});

// @desc    Get single teacher
// @route   GET /teachers/:id
// @access  Public
export const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.status(200).json({ success: true, data: teacher });
});

// @desc    Create new teacher
// @route   POST /teachers
// @access  Public
export const createTeacher = asyncHandler(async (req, res) => {
 console.log(req.body);
  const teacher = await Teacher.create(req.body);
  res.status(201).json({ success: true, data: teacher });
});

// @desc    Update teacher
// @route   PUT /teachers/:id
// @access  Public
export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate
    (req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!teacher) {
        res.status(404);
        throw new Error('Teacher not found');
    }
    res.status(200).json({ success: true, data: teacher });
}
);

// @desc    Delete teacher
// @route   DELETE /teachers/:id
// @access  Public
export const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndDelete(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.status(200).json({ success: true, data: {} });
});
















