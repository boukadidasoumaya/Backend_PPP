import Student from "../models/StudentModel.mjs";

import asyncHandler from 'express-async-handler';

// @desc    Get all students
// @route   GET /students
// @access  Public
export const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find();
  res.status(200).json({ success: true, data: students });
});

// @desc    Get single student
// @route   GET /students/:id
// @access  Public
export const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  res.status(200).json({ success: true, data: student });
});

// @desc    Create new student
// @route   POST /students
// @access  Public
export const createStudent = asyncHandler(async (req, res) => {
 console.log(req.body);
  const student = await Student.create(req.body);
  res.status(201).json({ success: true, data: student });
});

// @desc    Update student
// @route   PUT /students/:id
// @access  Public
export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate
    (req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }
    res.status(200).json({ success: true, data: student });
}
);

// @desc    Delete student
// @route   DELETE /students/:id
// @access  Public
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  res.status(200).json({ success: true, data: {} });
});
