import TimeTable from "../models/TimeTableModel.mjs";
import Class from "../models/ClassModel.mjs";
import Subject from "../models/SubjectModel.mjs";
import Teacher from "../models/TeacherModel.mjs";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

import asyncHandler from "express-async-handler";

// Controller function to create a new time table entry
const getTimeTables = async (req, res) => {
  try {
    const timeTables = await TimeTable.find();
    // const timeTables = await TimeTable.aggregate([
    // {
    //   $lookup: {
    //     from: "Class",
    //     localField: "class_id",
    //     foreignField: "_id",
    //     as: "class",
    //   },
    // },
    // // {
    // //   $lookup: {
    // //     from: "Subject",
    // //     localField: "subject_id",
    // //     foreignField: "_id",
    // //     as: "subject",
    // //   },
    // // },
    // // {
    // //   $lookup: {
    // //     from: "Teacher",
    // //     localField: "teacher_id",
    // //     foreignField: "_id",
    // //     as: "teacher",
    // //   },
    // // },
    // {
    //   $unwind: "$class",
    // },
    // // {
    // //   $unwind: "$subject",
    // // },
    // // {
    // //   $unwind: "$teacher",
    // // },
    // {
    //   $project: {
    //     _id: 1,
    //     StartTime: 1,
    //     EndTime: 1,
    //     Day: 1,
    //     // subject: "$subject.SubjectName",
    //     // module: "$subject.Module",
    //     // coeff: "$subject.Coeff",
    //     Major: "$class.Major",
    //     Year: "$class.Year",
    //     // teacher_name: "$teacher.FirstName" + " " + "$teacher.LastName",
    //     // teacher_cin: "$teacher.cin",
    //     // teacher_email: "$teacher.Email",
    //     Room: 1,
    //     Week: 1,
    //   },
    // },
    // ]);
    res.status(200).json({ success: true, data: timeTables });
  } catch (error) {
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
          StartTime: 1,
          EndTime: 1,
          Day: 1,
          Subject: "$subject.SubjectName",
          Module: "$subject.Module",
          Coeff: "$subject.Coeff",
          Major: "$class.Major",
          Year: "$class.Year",
          teacher_name: "$teacher.FirstName" + " " + "$teacher.LastName",
          teacher_cin: "$teacher.cin",
          teacher_email: "$teacher.Email",
          Room: 1,
          Week: 1,
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
  const { subject, module, coeff, major, year, teacher_cin, ...timeData } =
    req.body;

  try {
    let classObject;

    // Check if the class already exists
    const existingClass = await Class.findOne({ Major: major, Year: year });
    const existingSubject = await Subject.findOne({
      Subject: subject,
      Module: module,
      Coeff: coeff,
    });
    const existingTeacher = await Teacher.findOne({ teacher_cin: teacher_cin });

    if (existingClass) {
      classObject = existingClass;
    } else {
      classObject = await Class.create({ Major: major, Year: year });
    }

    if (existingSubject) {
      subjectObject = existingSubject;
    } else {
      subjectObject = await Subject.create({
        SubjectName: subject,
        Module: module,
        Coeff: coeff,
      });
    }

    if (existingTeacher) {
      teacherObject = existingTeacher;
    } else {
      teacherObject = await Teacher.create({ cin: teacher_cin });
    }

    // Create the time document and associate it with the class
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
  const { Major, Year, Group, ...updatedtimeData } = req.body;

  try {
    // Check if the time exists
    const time = await TimeTable.findById(id);
    if (!time) {
      return res.status(404).json({ success: false, error: "Time not found" });
    }

    // Update the time document
    Object.assign(time, updatedtimeData);

    // Update class_id if Major, Year, or Group has changed
    if (Major !== time.Major || Year !== time.Year || Group !== time.Group) {
      // Check if the class already exists
      let classObject = await Class.findOne({ Major, Year, Group });

      if (!classObject) {
        // If the class doesn't exist, create it
        classObject = await Class.create({ Major, Year, Group });
      }

      // Update the time's class_id
      time.class_id = classObject._id;
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

export {
  getTimeTables,
  getTimeTableById,
  createTimeTable,
  updateTimeTable,
  deleteTimeTable,
};