import Teacher from "../models/TeacherModel.mjs"; // Import Teacher model
import TimeTable from "../models/TimeTableModel.mjs"; // Import TimeTable model
import Subject from "../models/SubjectModel.mjs"; // Import Subject model
import Absence from "../models/AbscenceModel.mjs";
import AbsenceTeacher from "../models/AbsenceTeacherModel.mjs";
import asyncHandler from "express-async-handler";
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
        $unwind: "$timetable",
      },
      {
        $lookup: {
          from: "Subject",
          localField: "timetable.subject_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $unwind: "$subject",
      },
      {
        $group: {
          _id: "$_id",
          CIN: { $first: "$CIN" },
          FirstName: { $first: "$FirstName" },
          LastName: { $first: "$LastName" },
          Email: { $first: "$Email" },
          Department: { $first: "$Department" },
          Subjects: { $addToSet: "$subject.SubjectName" },
        },
      },
      {
        $sort: {
          LastName: 1,
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
          Subjects: 1,
        },
      },
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
            Week: 1,
          },
        },
      },
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

// @desc    Get teachers by department with their timetable
// @route   GET /teachers/departments/:department
// @access  Public
export const getTeachersByDepartment = asyncHandler(async (req, res) => {
  try {
    const { department } = req.params;
    const teachers = await Teacher.aggregate([
      {
        $match: { Department: department },
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
            Week: 1,
          },
        },
      },
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
    const distinctDepartments = await Teacher.distinct("Department");
    const sortedDepartments = distinctDepartments.sort();
    res.status(200).json({ departments: sortedDepartments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

export const getTeachersBySubject = asyncHandler(async (req, res) => {
  try {
    const subject = req.params.subject;
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
        $unwind: "$timetable",
      },
      {
        $lookup: {
          from: "Subject",
          localField: "timetable.subject_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $unwind: "$subject",
      },
      {
        $match: {
          "subject.SubjectName": subject
        }
      },
      {
        $group: {
          _id: "$_id",
          CIN: { $first: "$CIN" },
          FirstName: { $first: "$FirstName" },
          LastName: { $first: "$LastName" },
          Email: { $first: "$Email" },
          Department: { $first: "$Department" },
          Subjects: { $addToSet: "$subject.SubjectName" },
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
          Subjects: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});




export const getTeachersByDepartmentAndSubject = asyncHandler(async (req, res) => {
  try {
    const { department, subject } = req.params;

    const teachers = await Teacher.aggregate([
      {
        $match: { Department: department }, // Filter by department
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
        $unwind: "$timetable",
      },
      {
        $lookup: {
          from: "Subject",
          localField: "timetable.subject_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $unwind: "$subject",
      },
      {
        $match: {
          "subject.SubjectName": subject, // Filter by subject
        }
      },
      {
        $group: {
          _id: "$_id",
          CIN: { $first: "$CIN" },
          FirstName: { $first: "$FirstName" },
          LastName: { $first: "$LastName" },
          Email: { $first: "$Email" },
          Department: { $first: "$Department" },
          Subjects: { $addToSet: "$subject.SubjectName" },
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
          Subjects: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});





// @desc    Get teacher data with timetable, subjects, and absences
// @route   GET /teachers/:id/dataWithAbsences
// @access  Public
export const getTeacherDataWithAbsences = asyncHandler(async (req, res) => {
  const teacherId = new ObjectId(req.params.id);

  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    console.log('Teacher found:', teacher);

    const timetables = await TimeTable.aggregate([
      { $match: { teacher_id: teacherId } },
      {
        $lookup: {
          from: 'Subject',
          localField: 'subject_id',
          foreignField: '_id',
          as: 'subject'
        }
      },
      { $unwind: '$subject' },
      {
        $lookup: {
          from: 'Class',
          localField: 'class_id',
          foreignField: '_id',
          as: 'class'
        }
      },
      { $unwind: '$class' },
      {
        $project: {
          _id: 1,
          subjectId: '$subject._id',
          subjectName: '$subject.SubjectName',
          timetableId: '$_id',
          classId: '$class._id',
          className: {
            $concat: [
              { $toString: '$class.Major' },
              { $toString: '$class.Year' },
              '/',
              { $toString: '$class.Group' }
            ]
          }
        }
      }
    ]);

    console.log('Timetables:', timetables);

    const absences = await AbsenceTeacher.aggregate([
      { $match: { teacher_id: teacherId } },
      {
        $lookup: {
          from: 'Time_table',
          localField: 'timetable_id',
          foreignField: '_id',
          as: 'timetable'
        }
      },
      { $unwind: '$timetable' },
      {
        $lookup: {
          from: 'Class',
          localField: 'timetable.class_id',
          foreignField: '_id',
          as: 'class'
        }
      },
      { $unwind: '$class' },
      {
        $group: {
          _id: '$class._id',
          className: {
            $first: {
              $concat: [
                { $toString: '$class.Major' },
                { $toString: '$class.Year' },
                '/',
                { $toString: '$class.Group' }
              ]
            }
          },
          subjectId: { $first: '$timetable.subject_id' },
          absenceCount: { $sum: 1 }
        }
      }
    ]);

    console.log('Absences:', absences);

    const subjectsMap = new Map();

    timetables.forEach(({ subjectId, subjectName, classId, className }) => {
      if (!subjectsMap.has(subjectId.toString())) {
        subjectsMap.set(subjectId.toString(), {
          id: subjectId,
          subjectName: subjectName,
          classes: [],
          totalAbsences: 0,
        });
      }
      const subject = subjectsMap.get(subjectId.toString());
      subject.classes.push({ id: classId, className: className, absences: 0 });
    });

    console.log('Subjects map after timetables:', subjectsMap);

    absences.forEach(({ _id, className, subjectId, absenceCount }) => {
      const subject = subjectsMap.get(subjectId.toString());
      if (subject) {
        const cls = subject.classes.find(c => c.id.toString() === _id.toString());
        if (cls) {
          cls.absences = absenceCount;
          subject.totalAbsences += absenceCount;
        }
      }
    });

    console.log('Subjects map after absences:', subjectsMap);

    const formattedSubjects = Array.from(subjectsMap.values()).map(subject => ({
      id: subject.id,
      subjectName: subject.subjectName,
      classes: subject.classes,
      totalAbsences: subject.totalAbsences,
    }));

    console.log('Formatted subjects:', formattedSubjects);

    res.status(200).json({ success: true, data: { subjects: formattedSubjects } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});








export const getALLClasses = asyncHandler(async (req, res) => {
  try {
    const classes = await Class.aggregate([
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "class_id",
          as: "timetables",
        },
      },
      {
        $unwind: "$timetables",
      },
      {
        $lookup: {
          from: "Teacher",
          localField: "timetables.teacher_id",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $match: {},
      },
      {
        $project: {
          _id: 0,
          ClassName: 1,
          Major: 1,
          Year: 1,
        },
      },
    ]);

    if (classes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Classes not found",
      });
    }

    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// export const getTeachersByClass = asyncHandler(async (req, res) => {
//   const className = req.params.class;

//   try {
//     const teachers = await Teacher.aggregate([
//       {
//         $lookup: {
//           from: "Time_table",
//           localField: "_id",
//           foreignField: "teacher_id",
//           as: "timetables",
//         },
//       },
//       {
//         $unwind: "$timetables",
//       },
//       {
//         $lookup: {
//           from: "Class",
//           localField: "timetables.class_id",
//           foreignField: "_id",
//           as: "class",
//         },
//       },
//       {
//         $match: {
//           "class.ClassName": className,
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           teacher_name: {
//             $concat: ["$FirstName", " ", "$LastName"],
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           teacher_name: 1,
//         },
//       },
//     ]);

//     if (teachers.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Teachers not found for the given class",
//       });
//     }

//     res.status(200).json({ success: true, data: teachers });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });



const isCinExists = async (cin) => {
  const existingTeacher = await Teacher.findOne({ CIN: cin });
  return !!existingTeacher; // Renvoie true si le CIN existe déjà, sinon false
};

const isEmailExists = async (email) => {
  const existingTeacher = await Teacher.findOne({ Email: email });
  return !!existingTeacher; // Renvoie true si l'email existe déjà, sinon false
};

// @desc    Create new teacher
// @route   POST /teachers
// @access  Public
export const createTeacher = asyncHandler(async (req, res) => {
  const { CIN, FirstName, LastName, Email, Department, ...teacherData } = req.body;

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
    const teacher = await Teacher.create({
      ...teacherData,
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
  const { FirstName, LastName, CIN, Email, Department, ...teacherData } = req.body;

  try {
    const existingTeacher = await Teacher.findById(id);
    const currentCIN = existingTeacher.CIN;
    const currentEmail = existingTeacher.Email;

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
      // Check if the CIN already exists
      if (isCinDuplicate) {
        return res
          .status(400)
          .json({ success: false, errors: { cin: "CIN already exists" } });
      }

      // Check if the email already exists
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

    // Check if the teacher exists
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, error: "Teacher not found" });
    }

    // Update the teacher document
    teacher._id = id;
    teacher.FirstName = FirstName;
    teacher.LastName = LastName;
    teacher.CIN = CIN;
    teacher.Email = Email;
    teacher.Department = Department;
    //teacher.Subjects = Subjects;

    await teacher.save();

    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    console.error(error); // Log the error for debugging
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
      throw new Error("Teacher not found");
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Delete teachers by department and their timetables
// @route   DELETE /teachers/departments/:department
// @access  Public
export const deleteTeachersByDepartment = asyncHandler(async (req, res) => {
  const { department } = req.params;

  try {
    // Find the teachers by department
    const teachers = await Teacher.find({ Department: department });

    if (!teachers.length) {
      return res.status(404).json({ success: false, message: "No teachers found in this department" });
    }

    // Get the IDs of the teachers to delete
    const teacherIds = teachers.map(teacher => teacher._id);

    // Delete the timetables for these teachers
    await TimeTable.deleteMany({ teacher_id: { $in: teacherIds } });

    // Delete the teachers
    await Teacher.deleteMany({ _id: { $in: teacherIds } });

    res.status(200).json({ success: true, message: "Teachers and their timetables deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});









