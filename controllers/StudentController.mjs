import Student from "../models/StudentModel.mjs";
import Class from "../models/ClassModel.mjs"; 
import Absence from "../models/AbscenceModel.mjs";
import TimeTable from "../models/TimeTableModel.mjs";
import Subject from "../models/SubjectModel.mjs";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

import multer from "multer";
const { ObjectId } = mongoose.Types; // Destructuring ObjectId from mongoose.Types

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
        as: "class",
      },
    },
    {
      $unwind: "$class",
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
        Group: "$class.Group",
      },
    },
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
        $match: {
          // Filter by student ID
          _id: newId,
        },
      },
      {
        $lookup: {
          from: "Class",
          localField: "class_id",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $unwind: "$class",
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
          Group: "$class.Group",
        },
      },
    ]);

    if (!student.length) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
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
          as: "class",
        },
      },
      {
        $unwind: "$class",
      },
      {
        $match: { "class.Major": major }, // Filter students by major
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
          Group: "$class.Group",
        },
      },
    ]);
    if (!students.length) {
      return res
        .status(404)
        .json({ success: false, message: "Students not found" });
    } else {
      res.status(200).json({ success: true, data: students });
    }
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
          as: "class",
        },
      },
      {
        $unwind: "$class",
      },
      {
        $match: { "class.Year": parseInt(year) }, // Filter students by year
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
          Group: "$class.Group",
        },
      },
    ]);
  
    if (!students.length) {
      return res
        .status(404)
        .json({ success: false, message: "Students not found" });
    } else {
      res.status(200).json({ success: true, data: students });
    }
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
          as: "class",
        },
      },
      {
        $unwind: "$class",
      },
      {
        $match: {
          "class.Major": major, // Filter students by major
          "class.Year": parseInt(year), // Filter students by year (convert to integer if needed)
        },
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
          Group: "$class.Group",
        },
      },
    ]);

    if (!students.length) {
      return res
        .status(404)
        .json({ success: false, message: "Students not found" });
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
      return res.status(400).json({
        success: false,
        errors: { cin: "CIN already exists", email: "Email Already exists" },
      });
    }
    // Vérifie si le CIN existe déjà
    if (isCinDuplicate) {
      return res
        .status(400)
        .json({ success: false, errors: { cin: "CIN already exists" } });
    }

    // Vérifie si l'email existe déjà
    if (isEmailDuplicate) {
      return res
        .status(400)
        .json({ success: false, errors: { email: "Email already exists" } });
    }

    // Check if the CIN already exists

    let classObject;

    // Check if the class already exists
    const existingClass = await Class.findOne({
      Major: Major,
      Year: Year,
      Group: Group,
    });

    if (existingClass) {
      // If the class exists, use it
      classObject = existingClass;
    } else {
      // If the class doesn't exist, create it
      classObject = await Class.create({
        Major: Major,
        Year: Year,
        Group: Group,
      });
    }

    // Create the student document and associate it with the class
    const student = await Student.create({
      ...studentData,
      CIN,
      Email,
      class_id: classObject._id,
    });

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
  const { CIN, Email } = updatedStudentData;

  try {
    const existingStudent = await Student.findById(id);
    const currentCIN = existingStudent.CIN;
    const currentEmail = existingStudent.Email;

    const isCinDuplicate = await isCinExists(CIN);
    const isEmailDuplicate = await isEmailExists(Email);

    if (currentCIN !== CIN && currentEmail !== Email) {
      if (isCinDuplicate && isEmailDuplicate) {
        return res.status(400).json({
          success: false,
          errors: {
            cin: "CIN already exists",
            email: "Email Already exists",
          },
        });
      }
      // Vérifie si le CIN existe déjà
      if (isCinDuplicate) {
        return res
          .status(400)
          .json({ success: false, errors: { cin: "CIN already exists" } });
      }

      // Vérifie si l'email existe déjà
      if (isEmailDuplicate) {
        return res
          .status(400)
          .json({ success: false, errors: { email: "Email already exists" } });
      }
    } else if (currentCIN !== CIN) {
      if (isCinDuplicate) {
        return res
          .status(400)
          .json({ success: false, errors: { cin: "CIN already exists" } });
      }
    } else if (currentEmail !== Email) {
      if (isEmailDuplicate) {
        return res
          .status(400)
          .json({ success: false, errors: { email: "Email already exists" } });
      }
    }
    // Check if the student exists
    const student = await Student.findById(id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, error: "Student not found" });
    }

    // Update the student document
    Object.assign(student, updatedStudentData);

    // Update class_id if Major, Year, or Group has changed
    if (
      Major !== student.Major ||
      Year !== student.Year ||
      Group !== student.Group
    ) {
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
    throw new Error("Student not found");
  }
  res.status(200).json({ success: true, data: {} });
});



export const dropStudentsByMajorAndYear = asyncHandler(async (req, res) => {
  try {
    const { major, year } = req.params;

    let classFilter = {};

    // If "All Majors" is specified, ignore the major filter
    if (major !== "All Majors") {
      classFilter.Major = major;
    }

    // If "All Years" is specified, ignore the year filter
    if (year !== "All Years") {
      const yearNumber = parseInt(year);
      // Check if the parameter 'year' is a valid number
      if (isNaN(yearNumber)) {
        return res.status(400).json({ success: false, error: "The 'year' parameter must be a valid number" });
      }
      classFilter.Year = yearNumber;
    }

    // Find all classes matching the given major and/or year
    const classes = await Class.find(classFilter);

    if (classes.length === 0) {
      return res.status(404).json({ success: false, error: "No classes found for the given parameters" });
    }

    // Extract the class IDs
    const classIds = classes.map(cls => cls._id);

    // Find all students belonging to the classes
    const students = await Student.find({ class_id: { $in: classIds } });

    if (students.length === 0) {
      return res.status(404).json({ success: false, error: "No students found for the given parameters" });
    }

    // Extract the student IDs
    const studentIds = students.map(student => student._id);

    // Delete the attendance records for the students
    // await Attendance.deleteMany({ student_id: { $in: studentIds } });

    // Delete the students
    await Student.deleteMany({ _id: { $in: studentIds } });

    res.status(200).json({
      success: true,
      message: `${students.length} students and their attendance records deleted successfully`,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ success: false, error: "Server error" });
  }
});

//get absence for each students
export const getStudentAbsences = asyncHandler(async (req, res) => {
  try {
    const studentId = req.params.id; // Assuming the ID is passed in the request params
    const newId = new ObjectId(studentId); // Create a new ObjectId instance

    // Step 1: Find absences by student ID
    const absences = await Absence.find({ student_id: newId });

    if (!absences.length) {
      return res
        .status(404)
        .json({ success: false, message: "No absences found for this student" });
    }

    // Step 2: For each absence, find the related timetable and subject information
    const absencesWithDetails = await Promise.all(
      absences.map(async (absence) => {
        const timetable = await TimeTable.findById(absence.timetable_id);
        if (!timetable) {
          return null;
        }
        const subject = await Subject.findById(timetable.subject_id);
        if (!subject) {
          return null;
        }

        return {
          _id: absence._id,
          timestamp: absence.timestamp,
          subjectId: subject._id,
          SubjectName: subject.SubjectName,
          Module: subject.Module,
          Coeff: subject.Coeff,
          Day: timetable.Day,
          StartTime: timetable.StartTime,
          EndTime: timetable.EndTime,
          Room: timetable.Room,
          Type: timetable.Type,
          Semester: timetable.Semester,
        };
      })
    );

    // Filter out null values from the results
    const validAbsences = absencesWithDetails.filter(absence => absence !== null);

    if (!validAbsences.length) {
      return res
        .status(404)
        .json({ success: false, message: "No valid absences found for this student" });
    }

    // Step 3: Group absences by subject and count them
    const absenceCounts = validAbsences.reduce((acc, absence) => {
      if (!acc[absence.subjectId]) {
        acc[absence.subjectId] = {
          SubjectName: absence.SubjectName,
          Module: absence.Module,
          Coeff: absence.Coeff,
          Day: absence.Day,
          StartTime: absence.StartTime,
          EndTime: absence.EndTime,
          Room: absence.Room,
          Type: absence.Type,
          Semester: absence.Semester,
          count: 0,
        };
      }
      acc[absence.subjectId].count += 1;
      return acc;
    }, {});

    // Convert the grouped object into an array
    const result = Object.values(absenceCounts);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getStudentAbsencesBySemester = asyncHandler(async (req, res) => {
  try {
    const studentId = req.params.id; // Assuming the ID is passed in the request params
    const semester = parseInt(req.params.semester, 10); // Convert semester from string to integer
    const newId = new ObjectId(studentId); // Create a new ObjectId instance

    // Step 1: Find absences by student ID
    const absences = await Absence.find({ student_id: newId });

    if (!absences.length) {
      return res
        .status(404)
        .json({ success: false, message: "No absences found for this student" });
    }

    // Step 2: For each absence, find the related timetable and subject information
    const absencesWithDetails = await Promise.all(
      absences.map(async (absence) => {
        const timetable = await TimeTable.findById(absence.timetable_id);
        if (!timetable || timetable.Semester !== semester) {
          return null;
        }
        const subject = await Subject.findById(timetable.subject_id);
        if (!subject) {
          return null;
        }

        return {
          _id: absence._id,
          timestamp: absence.timestamp,
          subjectId: subject._id,
          SubjectName: subject.SubjectName,
          Module: subject.Module,
          Coeff: subject.Coeff,
          Day: timetable.Day,
          StartTime: timetable.StartTime,
          EndTime: timetable.EndTime,
          Room: timetable.Room,
          Type: timetable.Type,
          Semester: timetable.Semester,
        };
      })
    );

    // Filter out null values from the results
    const validAbsences = absencesWithDetails.filter(absence => absence !== null);

    if (!validAbsences.length) {
      return res
        .status(404)
        .json({ success: false, message: "No valid absences found for this student in the specified semester" });
    }

    // Step 3: Group absences by subject and count them
    const absenceCounts = validAbsences.reduce((acc, absence) => {
      if (!acc[absence.subjectId]) {
        acc[absence.subjectId] = {
          SubjectName: absence.SubjectName,
          Module: absence.Module,
          Coeff: absence.Coeff,
          Day: absence.Day,
          StartTime: absence.StartTime,
          EndTime: absence.EndTime,
          Room: absence.Room,
          Type: absence.Type,
          count: 0,
        };
      }
      acc[absence.subjectId].count += 1;
      return acc;
    }, {});

    // Convert the grouped object into an array
    const result = Object.values(absenceCounts);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
