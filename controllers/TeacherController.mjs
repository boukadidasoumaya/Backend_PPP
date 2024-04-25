import Teacher from '../models/TeacherModel.mjs'; // Import Teacher model
import TimeTable from '../models/TimeTableModel.mjs'; // Import TimeTable model
import Subject from '../models/SubjectModel.mjs'; // Import Subject model
import asyncHandler from 'express-async-handler';
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

// @desc    Get all teachers with their subjects
// @route   GET /teachers
// @access  Public
export const getTeachers = asyncHandler(async (req, res) => {
  try {
    const teachers = await Teacher.aggregate([
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "teacher_id",
          as: "timetable",
        },
      },
      {
        $unwind: "$timetable" // Unwind the timetable array
      },
      {
        $lookup: {
          from: "Subjects",
          localField: "timetable.subject_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $group: {
          _id: "$_id",
          CIN: { $first: "$CIN" },
          FirstName: { $first: "$FirstName" },
          LastName: { $first: "$LastName" },
          Email: { $first: "$Email" },
          Department: { $first: "$Department" },
          Subjects: { $addToSet: "$subject" } // Collect subjects for each teacher
        }
      }
    ]);

    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});


// @desc    Get single teacher with timetable
// @route   GET /teachers/:id
// @access  Public
export const getTeacherById = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.params.id; // Assuming the ID is passed in the request params
    const newId = new ObjectId(teacherId); // Create a new ObjectId instance
    const teacher = await Teacher.aggregate([
      {
        $match: {
          // Filter by teacher ID
          _id: newId,
        },
      },
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "teacher_id",
          as: "timetable",
        },
      },
      {
        $project: {
          _id: 1,
          CIN: 1,
          FirstName: 1,
          LastName: 1,
          Email: 1,
          Department: 1,
          timetable: {
            StartTime: 1,
            EndTime: 1,
            Day: 1,
            subject_id: 1,
            class_id: 1,
            Room: 1,
            Week: 1
          }
        }
      }
    ]);

    if (!teacher.length) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({ success: true, data: teacher[0] }); // Return the first element (should be the only one)
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


//@desc    Get all subjects
// @route   GET /subjects
// @access  Public
export const getAllSubjects = asyncHandler(async (req, res) => {
  try {
    const distinctSubjects = await TimeTable.distinct('subject_id');
    const subjectNames = await Subject.find({ _id: { $in: distinctSubjects } }, 'SubjectName');
    const sortedSubjectNames = subjectNames.map(subject => subject.SubjectName).sort();
    res.status(200).json({ subjects: sortedSubjectNames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// @desc    Get teachers by department with their timetable
// @route   GET /teachers/departments/:department
// @access  Public
export const getTeachersByDepartment = asyncHandler(async (req, res) => {
  try {
    const { department } = req.params;
    const teachers = await Teacher.aggregate([
      {
        $match: { Department: department }
      },
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "teacher_id",
          as: "timetable",
        },
      },
      {
        $project: {
          _id: 1,
          CIN: 1,
          FirstName: 1,
          LastName: 1,
          Email: 1,
          Department: 1,
          timetable: {
            StartTime: 1,
            EndTime: 1,
            Day: 1,
            subject_id: 1,
            class_id: 1,
            Room: 1,
            Week: 1
          }
        }
      }
    ]);

    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// Other controller functions (createTeacher, updateTeacher, deleteTeacher) remain unchanged


export const getAllDepartments = asyncHandler(async (req, res) => {
  try {
    const distinctDepartments = await Teacher.distinct('Department');
    const sortedDepartments = distinctDepartments.sort();
    res.status(200).json({ departments: sortedDepartments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

export const getTeachersBySubject = asyncHandler(async (req, res) => {
  try {
    const { subject } = req.params;
    const teachers = await Teacher.aggregate([
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "teacher_id",
          as: "timetable",
        },
      },
      {
        $unwind: "$timetable" // unwind the timetable array
      },
      {
        $lookup: {
          from: "Subject",
          localField: "timetable.subject_id", // use the subject_id from the timetable
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $unwind: "$subject" // unwind the subject array
      },
      {
        $match: { "SubjectName": subject } // filter by the specified subject name
      },
      {
        $group: {
          _id: "$_id",
          CIN: { $first: "$CIN" },
          FirstName: { $first: "$FirstName" },
          LastName: { $first: "$LastName" },
          Email: { $first: "$Email" },
          Department: { $first: "$Department" },
          Subjects: { $push: "$SubjectName" } // push the subject names into an array
        }
      }
    ]);
    
    res.status(200).json({ success: true, data: teachers });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});





// @desc    Get teachers by department
// @route   GET /teachers/departments/:department
// @access  Public
/*export const getTeachersByDepartment = asyncHandler(async (req, res) => {
  try {
    const { department } = req.params;
    const teachers = await Teacher.find({ Department: department });
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});*/

// @desc    Get teachers by department and year
// @route   GET /teachers/departments/:department/year/:year
// @access  Public
export const getTeachersByDepartmentAndYear = asyncHandler(async (req, res) => {
  try {
    const { department, year } = req.params;
    const teachers = await Teacher.find({ Department: department, Year: year });
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});


// @desc    Create new teacher
// @route   POST /teachers
// @access  Public
export const createTeacher = asyncHandler(async (req, res) => {
  const { CIN, FirstName, LastName, Email, Department } = req.body;

  try {
    const teacher = await Teacher.create({
      CIN,
      FirstName,
      LastName,
      Email,
      Department,
    });

    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Update teacher
// @route   PUT /teachers/:id
// @access  Public
export const updateTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const teacher = await Teacher.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!teacher) {
      return res.status(404).json({ success: false, error: "Teacher not found" });
    }

    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Delete teacher
// @route   DELETE /teachers/:id
// @access  Public
export const deleteTeacher = asyncHandler(async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher not found');
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});
