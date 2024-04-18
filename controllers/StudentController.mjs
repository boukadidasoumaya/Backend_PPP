import Student from "../models/StudentModel.mjs";
import Class from '../models/ClassModel.mjs'; // Import the Class model
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';

import multer from "multer";
const { ObjectId } = mongoose.Types; // Destructuring ObjectId from mongoose.Types

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

// Your createStudent function and other code...



// @desc    Get all students with Major, Year, and Group
// @route   GET /students
// @access  Public
export const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.aggregate([
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
 
  try {
    const studentId = req.params.id; // Assuming the ID is passed in the request params
    const newId = new ObjectId(studentId); // Create a new ObjectId instance
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

export const getStudentsByMajor = asyncHandler(async (req, res) => {
  try {
    const { major } = req.params;

    const students = await Student.aggregate([
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
        $match: { "class.Major": major } // Filter students by major
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
    if (!students.length) {
      return res.status(404).json({ success: false, message: "Students not found" });
    }
    else
   { res.status(200).json({ success: true, data: students });}
  } catch (error) {
    console.error("Error getting students by major:", error);
    res.status(500).json({ success: false, error: "Error fetching students." });
  }
});

export const getStudentsByYear = asyncHandler(async (req, res) => {
  
  try {
    
    const { year } = req.params;
    const students = await Student.aggregate([
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
        $match: { "class.Year": parseInt(year) } // Filter students by year
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
    console.log(students);
    if (!students.length) {
      return res.status(404).json({ success: false, message: "Students not found" });
    }
    else
    {res.status(200).json({ success: true, data: students })};
  } catch (error) {
    console.error("Error getting students by year:", error);
    res.status(500).json({ success: false, error: "Error fetching students." });
  }
});

export const getStudentsByMajorAndByYear = asyncHandler(async (req, res) => {
  try {
    const { major, year } = req.params;

    const students = await Student.aggregate([
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
        $match: {
          "class.Major": major, // Filter students by major
          "class.Year": parseInt(year) // Filter students by year (convert to integer if needed)
        }
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

    if (!students.length) {
      return res.status(404).json({ success: false, message: "Students not found" });
    }

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("Error getting students by major and year:", error);
    res.status(500).json({ success: false, error: "Error fetching students." });
  }
});

// @desc    Create new student
// @route   POST /students
// @access  Public
// Fonction pour vérifier si le CIN existe déjà dans la base de données

export const isCinExists = async (cin) => {
  const existingStudent = await Student.findOne({ CIN: cin });
  return !!existingStudent; // Renvoie true si le CIN existe déjà, sinon false
};

// Fonction pour vérifier si l'email existe déjà dans la base de données
export const isEmailExists = async (email) => {
  const existingStudent = await Student.findOne({ Email: email });
  return !!existingStudent; // Renvoie true si l'email existe déjà, sinon false
};

export const createStudent = asyncHandler(async (req, res) => {
    const { Major, Year, Group, CIN, Email, ...studentData } = req.body;

  try {
    const isCinDuplicate = await isCinExists(CIN);
    const isEmailDuplicate = await isEmailExists(Email);

    if (isCinDuplicate && isEmailDuplicate) {
      return res.status(400).json({ success: false, errors: { cin:"CIN already exists" , email:"Email Already exists" } });
    }
    // Vérifie si le CIN existe déjà
    if (isCinDuplicate) {
      return res.status(400).json({ success: false, errors: {cin:"CIN already exists"} });
    }

    // Vérifie si l'email existe déjà
    if (isEmailDuplicate) {
      return res.status(400).json({ success: false, errors: {email:"Email already exists"} });
    }

   
    // Check if the CIN already exists
    
    
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
    const student = await Student.create({ ...studentData,CIN,Email, class_id: classObject._id });

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
  const { Major, Year, Group ,...updatedStudentData } = req.body;
  const {CIN, Email} = updatedStudentData;


  try {
    const existingStudent = await Student.findById(id);
    const currentCIN = existingStudent.CIN;
    const currentEmail = existingStudent.Email;

    const isCinDuplicate = await isCinExists(CIN);
    const isEmailDuplicate = await isEmailExists(Email);

    if ((currentCIN !==CIN && currentEmail !==Email)) {
      
      if (isCinDuplicate && isEmailDuplicate) {
      return res.status(400).json({ success: false, errors: { cin:"CIN already exists" , email:"Email Already exists" } });
    }
    // Vérifie si le CIN existe déjà
    if (isCinDuplicate) {
      return res.status(400).json({ success: false, errors: {cin:"CIN already exists"} });
    }

    // Vérifie si l'email existe déjà
    if (isEmailDuplicate) {
      return res.status(400).json({ success: false, errors: {email:"Email already exists"} });
    }}
    else if (currentCIN !==CIN) {
      if (isCinDuplicate) {
      return res.status(400).json({ success: false, errors: {cin:"CIN already exists"} });
    }
    }
    else if (currentEmail !==Email) {
      if (isEmailDuplicate) {
      return res.status(400).json({ success: false, errors: {email:"Email already exists"} });
    }
    }
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

