import Class from "../models/ClassModel.mjs";

import asyncHandler from 'express-async-handler';

// @desc    Get all classes
// @route   GET /classes
// @access  Public
export const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find();
  res.status(200).json({ success: true, data: classes });
});
// Méthode pour obtenir toutes les majors distinctes triées par ordre alphabétique
export const getAllMajors = asyncHandler(async (req, res) => {
  const distinctMajors = await Class.distinct('Major');
  const sortedMajors = distinctMajors.sort();
  res.status(200).json({ majors: sortedMajors });
});


// Méthode pour obtenir tous les niveaux distincts
export const getAllLevels = asyncHandler(async (req, res) => {
  const distinctLevels = await Class.distinct('Year');
  console.log(distinctLevels);
  res.status(200).json({ levels: distinctLevels });
});


// @desc    Get single class
// @route   GET /classes/:id
// @access  Public
export const getClassById = asyncHandler(async (req, res) => {
  const Class = await Class.findById(req.params.id);
  if (!Class) {
    res.status(404);
    throw new Error('Class not found');
  }
  res.status(200).json({ success: true, data: Class });
});

// @desc    Create new class
// @route   POST /classes
// @access  Public
export const createClass = asyncHandler(async (req, res) => {
 console.log(req.body);
  const Class = await Class.create(req.body);
  res.status(201).json({ success: true, data: Class });
});

// @desc    Update class
// @route   PUT /classes/:id
// @access  Public
export const updateClass = asyncHandler(async (req, res) => {
  const Class = await Class.findByIdAndUpdate
    (req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!Class) {
        res.status(404);
        throw new Error('Class not found');
    }
    res.status(200).json({ success: true, data: Class });
}
);

// @desc    Delete class
// @route   DELETE /classes/:id
// @access  Public
export const deleteClass = asyncHandler(async (req, res) => {
  const Class = await Class.findByIdAndDelete(req.params.id);
  if (!Class) {
    res.status(404);
    throw new Error('Class not found');
  }
  res.status(200).json({ success: true, data: {} });
});
export const countClasses = asyncHandler(async (req, res) => {
  try {
    const count = await Class.countDocuments({});
    res.json({ totalClasses: count });
} catch (error) {
    res.status(500).json({ error: 'An error occurred while counting the documents' });
}
});












