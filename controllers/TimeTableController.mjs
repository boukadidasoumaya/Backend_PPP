import TimeTable from "../models/TimeTableModel.mjs";
import Class from "../models/ClassModel.mjs";
import Subject from "../models/SubjectModel.mjs";
import Teacher from "../models/TeacherModel.mjs";
import Absence from "../models/AbscenceModel.mjs";
import Attendance from "../models/AttendanceModel.mjs";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

import asyncHandler from "express-async-handler";
import sendEmail from "./EmailSender.mjs";

// Controller function to create a new time table entry
const getTimeTables = async (req, res) => {
  try {
    const timeTables = await TimeTable.aggregate([
      {
        $lookup: {
          from: "Class",
          localField: "class_id",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $lookup: {
          from: "Subject",
          localField: "subject_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "Teacher",
          localField: "teacher_id",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $unwind: "$class",
      },
      {
        $unwind: "$subject",
      },
      {
        $unwind: "$teacher",
      },
      {
        $project: {
          _id: 1,
          Day: 1,
          Room: 1,
          StartTime: 1,
          EndTime: 1,
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          group: "$class.Group",
          // teacher_firstname: "$teacher.FirstName",
          // teacher_lastname: "$teacher.LastName",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
          Week: 1,
        },
      },
    ]);
    res.status(200).json({ success: true, data: timeTables });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
export const getTimeTablesByMajorAndYear = async (req, res) => {
  try {
    // Récupérez les paramètres de la requête GET
    const { major, year } = req.params;

    // Vérifiez si les paramètres sont présents
    if (!major || !year) {
      return res.status(400).json({ success: false, error: "Veuillez fournir les paramètres 'major' et 'year'" });
    }

    // Convertissez l'année en nombre
    const yearNumber = parseInt(year);

    // Vérifiez si le paramètre 'year' est un nombre valide
    if (isNaN(yearNumber)) {
      return res.status(400).json({ success: false, error: "Le paramètre 'year' doit être un nombre valide" });
    }

    // Filtrez les emplois du temps par major et année
    const timeTables = await TimeTable.aggregate([
      {
        $lookup: {
          from: "Class",
          localField: "class_id",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $lookup: {
          from: "Subject",
          localField: "subject_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "Teacher",
          localField: "teacher_id",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $unwind: "$class",
      },
      {
        $unwind: "$subject",
      },
      {
        $unwind: "$teacher",
      },
      {
        $match: {
          "class.Major": major,
          "class.Year": yearNumber,
        },
      },
      {
        $project: {
          _id: 1,
          Day: 1,
          Room: 1,
          StartTime: 1,
          EndTime: 1,
          Semester : 1,
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          group: "$class.Group",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
          Week: 1,
        },
      },
    ]);

    // Envoyez les emplois du temps filtrés en réponse
    res.status(200).json({ success: true, data: timeTables });
  } catch (error) {
    // Gérez les erreurs
    res.status(400).json({ success: false, error: error.message });
  }
};


const getTimeTableById = asyncHandler(async (req, res) => {
  const timeTableId = req.params.id;
  const newId = new ObjectId(timeTableId);

  try {
    const timeTable = await TimeTable.aggregate([
      {
        $match: {
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
        $lookup: {
          from: "Subject",
          localField: "subject_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "Teacher",
          localField: "teacher_id",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $unwind: "$class",
      },
      {
        $unwind: "$subject",
      },
      {
        $unwind: "$teacher",
      },
      {
        $project: {
          _id: 1,
          Day: 1,
          Room: 1,
          StartTime: 1,
          EndTime: 1,
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          group: "$class.Group",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
        },
      },
    ]);

    if (!timeTable.length) {
      return res
        .status(404)
        .json({ success: false, message: "Time not found" });
    }

    res.status(200).json({ success: true, data: timeTable[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

const createTimeTable = asyncHandler(async (req, res) => {
  const {
    subject,
    module,
    coeff,
    major,
    year,
    group,
    teacher_cin,
    ...timeData
  } = req.body;

  const existingStartTimeClass = await TimeTable.findOne({
    StartTime: timeData.StartTime,
    Day: timeData.Day,
    class_id: await Class.findOne({
      Major: major,
      Year: year,
      Group: group,
    }),
  });
  const existingEndTimeClass = await TimeTable.findOne({
    EndTime: timeData.EndTime,
    Day: timeData.Day,
    class_id: await Class.findOne({
      Major: major,
      Year: year,
      Group: group,
    }),
  });

  const existingStartTimeRoom = await TimeTable.findOne({
    StartTime: timeData.StartTime,
    Day: timeData.Day,
    Room: timeData.Room,
  });
  const existingEndTimeRoom = await TimeTable.findOne({
    EndTime: timeData.EndTime,
    Day: timeData.Day,
    Room: timeData.Room,
  });

  const existingStartTimeWeek = await TimeTable.findOne({
    StartTime: timeData.StartTime,
    Day: timeData.Day,
    Week: timeData.Week,
  });
  const existingEndTimeWeek = await TimeTable.findOne({
    EndTime: timeData.EndTime,
    Day: timeData.Day,
    Week: timeData.Week,
  });
  const existingStartTimeWeekW = await TimeTable.findOne({
    StartTime: timeData.StartTime,
    Day: timeData.Day,
    Week: "W",
  });
  const existingEndTimeWeekW = await TimeTable.findOne({
    EndTime: timeData.EndTime,
    Day: timeData.Day,
    Week: "W",
  });

  const existingStartTimeTeacher = await TimeTable.findOne({
    StartTime: timeData.StartTime,
    Day: timeData.Day,
    teacher_id: await Teacher.findOne({ CIN: teacher_cin }),
  });
  const existingEndTimeTeacher = await TimeTable.findOne({
    EndTime: timeData.EndTime,
    Day: timeData.Day,
    teacher_id: await Teacher.findOne({ CIN: teacher_cin }),
  });

  let error = "";
  let existError = false;

  if (existingStartTimeClass || existingEndTimeClass) {
    existError = true;
    error = {
      $concat: [error, "Time already exists in this class\n"],
    };
  }
  if (existingStartTimeRoom || existingEndTimeRoom) {
    existError = true;
    error = {
      $concat: [error, "Time already exists in this room\n"],
    };
  }
  if (
    existingStartTimeWeek ||
    existingEndTimeWeek ||
    existingStartTimeWeekW ||
    existingEndTimeWeekW
  ) {
    existError = true;
    error = {
      $concat: [error, "Time already exists in this week\n"],
    };
  }
  if (existingStartTimeTeacher || existingEndTimeTeacher) {
    existError = true;
    error = {
      $concat: [error, "Time already exists for this teacher\n"],
    };
  }

  if (existError) return res.status(400).json({ success: false, error: error });

  try {
    let classObject;
    let subjectObject;
    let teacherObject;

    // Check if the class already exists
    const existingClass = await Class.findOne({
      Major: major,
      Year: year,
      Group: group,
    });
    if (existingClass) {
      classObject = existingClass;
    } else {
      classObject = await Class.create({ Major: major, Year: year });
    }

    // Check if the subject already exists
    const existingSubject = await Subject.findOne({
      SubjectName: subject,
      Module: module,
      Coeff: coeff,
    });
    if (existingSubject) {
      subjectObject = existingSubject;
    } else {
      subjectObject = await Subject.create({
        SubjectName: subject,
        Module: module,
        Coeff: coeff,
      });
    }

    // Check if the teacher already exists
    const existingTeacher = await Teacher.findOne({ CIN: teacher_cin });
    if (existingTeacher) {
      teacherObject = existingTeacher;
    } else {
      teacherObject = await Teacher.create({ CIN: teacher_cin });
    }

    // Create the time document and associate it with the class, subject, and teacher
    const time = await TimeTable.create({
      ...timeData,
      class_id: classObject._id,
      subject_id: subjectObject._id,
      teacher_id: teacherObject._id,
    });

    // Update the class document to include the new time ID
    if (!classObject.timetable) {
      classObject.timetable = []; // Initialize timetable array if not already present
    }
    classObject.timetable.push(time._id);
    await classObject.save();

    res.status(201).json({ success: true, data: time });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(400).json({ success: false, error: error.message });
  }
});

const updateTimeTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    subject,
    module,
    coeff,
    major,
    year,
    group,
    teacher_cin,
    ...updatedtimeData
  } = req.body;

  const existingStartTimeClass = await TimeTable.findOne({
    StartTime: timeData.StartTime,
    Day: timeData.Day,
    class_id: await Class.findOne({
      Major: major,
      Year: year,
      Group: group,
    }),
  });
  const existingEndTimeClass = await TimeTable.findOne({
    EndTime: timeData.EndTime,
    Day: timeData.Day,
    class_id: await Class.findOne({
      Major: major,
      Year: year,
      Group: group,
    }),
  });

  const existingStartTimeRoom = await TimeTable.findOne({
    StartTime: timeData.StartTime,
    Day: timeData.Day,
    Room: timeData.Room,
  });
  const existingEndTimeRoom = await TimeTable.findOne({
    EndTime: timeData.EndTime,
    Day: timeData.Day,
    Room: timeData.Room,
  });

  const existingStartTimeWeek = await TimeTable.findOne({
    StartTime: timeData.StartTime,
    Day: timeData.Day,
    Week: timeData.Week,
  });
  const existingEndTimeWeek = await TimeTable.findOne({
    EndTime: timeData.EndTime,
    Day: timeData.Day,
    Week: timeData.Week,
  });
  const existingStartTimeWeekW = await TimeTable.findOne({
    StartTime: timeData.StartTime,
    Day: timeData.Day,
    Week: "W",
  });
  const existingEndTimeWeekW = await TimeTable.findOne({
    EndTime: timeData.EndTime,
    Day: timeData.Day,
    Week: "W",
  });

  const existingStartTimeTeacher = await TimeTable.findOne({
    StartTime: timeData.StartTime,
    Day: timeData.Day,
    teacher_id: await Teacher.findOne({ CIN: teacher_cin }),
  });
  const existingEndTimeTeacher = await TimeTable.findOne({
    EndTime: timeData.EndTime,
    Day: timeData.Day,
    teacher_id: await Teacher.findOne({ CIN: teacher_cin }),
  });

  let error = "";
  let existError = false;

  if (existingStartTimeClass || existingEndTimeClass) {
    existError = true;
    error = {
      $concat: [error, "Time already exists in this class\n"],
    };
  }
  if (existingStartTimeRoom || existingEndTimeRoom) {
    existError = true;
    error = {
      $concat: [error, "Time already exists in this room\n"],
    };
  }
  if (
    existingStartTimeWeek ||
    existingEndTimeWeek ||
    existingStartTimeWeekW ||
    existingEndTimeWeekW
  ) {
    existError = true;
    error = {
      $concat: [error, "Time already exists in this week\n"],
    };
  }
  if (existingStartTimeTeacher || existingEndTimeTeacher) {
    existError = true;
    error = {
      $concat: [error, "Time already exists for this teacher\n"],
    };
  }

  if (existError) return res.status(400).json({ success: false, error: error });

  try {
    // Check if the time exists
    const time = await TimeTable.findById(id);
    if (!time) {
      return res.status(404).json({ success: false, error: "Time not found" });
    }

    // Update the time document
    Object.assign(time, updatedtimeData);

    // Update class_id if Major, Year, or Group has changed
    if (major !== time.Major || year !== time.Year || group !== time.Group) {
      // Check if the class already exists
      let classObject = await Class.findOne({ major, year, group });

      if (!classObject) {
        // If the class doesn't exist, create it
        classObject = await Class.create({ major, year, group });
      }
      time.class_id = classObject._id;
    }

    if (teacher_cin !== time.teacher_cin) {
      // Check if the teacher already exists
      let teacherObject = await Teacher.findOne({ CIN: teacher_cin });

      if (!teacherObject) {
        // If the teacher doesn't exist, create it
        teacherObject = await Teacher.create({ CIN: teacher_cin });
      }
      time.teacher_id = teacherObject._id;
    }

    if (
      subject !== time.SubjectName ||
      module !== time.Module ||
      coeff !== time.Coeff
    ) {
      let subjectObject = await Subject.findOne({ subject, module, coeff });

      if (!subjectObject) {
        // If the subject doesn't exist, create it
        subjectObject = await Subject.create({ subject, module, coeff });
      }
      time.subject_id = subjectObject._id;
    }

    await time.save();

    res.status(200).json({ success: true, data: time });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(400).json({ success: false, error: error.message });
  }
});

const deleteTimeTable = asyncHandler(async (req, res) => {
  try {
    // Check if the time exists
    const time = await TimeTable.findByIdAndDelete(req.params.id);
    if (!time) {
      return res.status(404).json({ success: false, error: "Time not found" });
    }

    res.status(200).json({
      success: true,
      message: "Time table entry deleted successfully",
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ success: false, error: "Server error" });
  }
});
export const dropTimeTablesByMajorYearAndSemester = asyncHandler(async (req, res) => {
  try {
    const { major, year, semester } = req.params;

    // Vérifiez si les paramètres sont présents
    if (!major || !year || !semester) {
      return res.status(400).json({ success: false, error: "Veuillez fournir les paramètres 'major', 'year', et 'semester'" });
    }

    // Convertissez l'année en nombre
    const yearNumber = parseInt(year);

    // Vérifiez si le paramètre 'year' est un nombre valide
    if (isNaN(yearNumber)) {
      return res.status(400).json({ success: false, error: "Le paramètre 'year' doit être un nombre valide" });
    }

    // Récupérer les classes correspondant à major et year
    const classes = await Class.find({ Major: major, Year: yearNumber });

    if (classes.length === 0) {
      return res.status(404).json({ success: false, error: "Aucune classe trouvée pour les paramètres donnés" });
    }

    // Récupérer les IDs des classes
    const classIds = classes.map(cls => cls._id);

    // Récupérer les timetable_ids avant suppression
    const timetables = await TimeTable.find({ class_id: { $in: classIds }, Semester: semester });
    const timetableIds = timetables.map(timetable => timetable._id);

    // Supprimer les timetables correspondant aux classes trouvées et au semestre donné
    const result = await TimeTable.deleteMany({ class_id: { $in: classIds }, Semester: semester });

    // Supprimer les entrées dans les tables absence et attendance
    await Absence.deleteMany({ timetable_id: { $in: timetableIds } });
    await Attendance.deleteMany({ timetable_id: { $in: timetableIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} time table entries deleted successfully along with associated absences and attendances`,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ success: false, error: "Server error" });
  }
});




export {
  getTimeTables,
  getTimeTableById,
  createTimeTable,
  updateTimeTable,
  deleteTimeTable,
};
