import Student from "../models/StudentModel.mjs";
import Class from '../models/ClassModel.mjs'; // Import the Class model
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types; // Destructuring ObjectId from mongoose.Types



// Your createStudent function and other code...

import asyncHandler from 'express-async-handler';


// @desc    Get all students with Major, Year, and Group
// @route   GET /students
// @access  Public
export const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.aggregate([
    {
      $lookup: {
        from: "Class", // Nom de la collection des classes
        localField: "class_id",
        foreignField: "_id",
        as: "class"
      }
    },
    {
      $unwind: "$class"
    },
    {
      $project: {
        _id: 1,
        FirstName: 1,
        LastName: 1,
        Email: 1,
        CIN : 1,
        Birthday: 1,
        Major: "$class.Major",
        Year: "$class.Year",
        Group: "$class.Group"
      }
    }
  ]);

  res.status(200).json({ success: true, data: students });
});

// @desc    Get single student
// @route   GET /students/:id
// @access  Public
export const getStudentById = asyncHandler(async (req, res) => {
  const studentId = req.params.id; // Assuming the ID is passed in the request params
  const newId = new ObjectId(studentId); // Create a new ObjectId instance


  try {
    const student = await Student.aggregate([
      {
        $match: { // Filter by student ID
          _id: newId

        }
      },
      {
        $lookup: {
          from: "Class",
          localField: "class_id",
          foreignField: "_id",
          as: "class"
        }
      },
      {
        $unwind: "$class"
      },
      {
        $project: {
          _id: 1,
          FirstName: 1,
          LastName: 1,
          Email: 1,
          CIN: 1,
          Birthday: 1,
          Major: "$class.Major",
          Year: "$class.Year",
          Group: "$class.Group"
        }
      }
    ]);

    if (!student.length) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, data: student[0] }); // Return the first element (should be the only one)
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @desc    Create new student
// @route   POST /students
// @access  Public
export const createStudent = asyncHandler(async (req, res) => {
  const { Major, Year, Group, ...studentData } = req.body;

  try {
    let classObject;

    // Check if the class already exists
    const existingClass = await Class.findOne({ Major: Major, Year: Year, Group: Group });

    if (existingClass) {
      // If the class exists, use it
      classObject = existingClass;
    } else {
      // If the class doesn't exist, create it
      classObject = await Class.create({ Major: Major, Year: Year, Group: Group });
    }

    // Create the student document and associate it with the class
    const student = await Student.create({ ...studentData, class_id: classObject._id });

    // Update the class document to include the new student ID
    if (!classObject.students) {
      classObject.students = []; // Initialize students array if not already present
    }
    classObject.students.push(student._id);
    await classObject.save();

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(400).json({ success: false, error: error.message });
  }
});


// @desc    Update student
// @route   PUT /students/:id
// @access  Public
export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Major, Year, Group, ...updatedStudentData } = req.body;

  try {
    // Check if the student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Update the student document
    Object.assign(student, updatedStudentData);

    // Update class_id if Major, Year, or Group has changed
    if (Major !== student.Major || Year !== student.Year || Group !== student.Group) {
      // Check if the class already exists
      let classObject = await Class.findOne({ Major, Year, Group });

      if (!classObject) {
        // If the class doesn't exist, create it
        classObject = await Class.create({ Major, Year, Group });
      }

      // Update the student's class_id
      student.class_id = classObject._id;
    }

    await student.save();

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(400).json({ success: false, error: error.message });
  }
});


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
