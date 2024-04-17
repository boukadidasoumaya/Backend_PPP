import Subject from "../models/SubjectModel.mjs";

import asyncHandler from 'express-async-handler';

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find();
  res.status(200).json({ success: true, data: subjects });
});

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Public
export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  res.status(200).json({ success: true, data: subject });
});

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Public
export const createSubject = asyncHandler(async (req, res) => {
 console.log(req.body);
  const subject = await Subject.create(req.body);
  res.status(201).json({ success: true, data: subject });
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Public
export const updateSubject = asyncHandler(async (req, res) => {
  
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  res.status(200).json({ success: true, data: subject });
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Public
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  res.status(200).json({ success: true, data: {} });
});