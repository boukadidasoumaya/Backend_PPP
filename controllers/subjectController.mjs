import Subject from "../models/SubjectModel.mjs";
import Class from "../models/ClassModel.mjs";
import TimeTable from "../models/TimeTableModel.mjs";
import Teacher from "../models/TeacherModel.mjs";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

import asyncHandler from "express-async-handler";

export const getSubjects = asyncHandler(async (req, res) => {
  try {
    const subjects = await Subject.aggregate([
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "subject_id",
          as: "timetables",
        },
      },
      {
        $unwind: {
          path: "$timetables",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "Class",
          localField: "timetables.class_id",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $unwind: {
          path: "$class",
          preserveNullAndEmptyArrays: true,
        },
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
        $unwind: {
          path: "$teacher",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            SubjectName: "$SubjectName",
            module: "$Module",
            coeff: "$Coeff",
            teacher_name: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_years: {
            $addToSet: {
              $concat: [
                { $toString: "$class.Major" },
                " ",
                { $toString: "$class.Year" },
              ],
            },
          },
        },
      },
      {
        $sort: {
          "_id.SubjectName": 1,
        },
      },
      {
        $project: {
          _id: "$_id._id",
          SubjectName: "$_id.SubjectName",
          module: "$_id.module",
          coeff: "$_id.coeff",
          teacher_name: "$_id.teacher_name",
          classes_years: 1,
        },
      },
    ]);
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export const getSubjectById = asyncHandler(async (req, res) => {
  const subjectId = req.params.id;
  const subjectIdObj = new ObjectId(subjectId);
  console.log(subjectId);

  try {
    const subject = await Subject.aggregate([
      {
        $match: {
          _id: subjectIdObj,
        },
      },
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "subject_id",
          as: "timetables",
        },
      },
      {
        $unwind: "$timetables",
      },
      {
        $lookup: {
          from: "Class",
          localField: "timetables.class_id",
          foreignField: "_id",
          as: "class",
        },
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
        $unwind: "$class",
      },
      {
        $unwind: "$teacher",
      },
      {
        $group: {
          _id: {
            SubjectName: "$SubjectName",
            module: "$Module",
            coeff: "$Coeff",
            teacher_name: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_years: {
            $addToSet: {
              $concat: [
                { $toString: "$class.Major" },
                " ",
                { $toString: "$class.Year" },
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          SubjectName: "$_id.SubjectName",
          module: "$_id.module",
          coeff: "$_id.coeff",
          teacher_name: "$_id.teacher_name",
          classes_years: 1,
        },
      },
    ]);

    if (subject.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    res.status(200).json({ success: true, data: subject[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getSubjectByName = asyncHandler(async (req, res) => {
  const subjectName = req.params.name; // Assuming the subject name is passed in the request params

  try {
    const subject = await Subject.aggregate([
      {
        $match: {
          SubjectName: subjectName,
        },
      },
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "subject_id",
          as: "timetables",
        },
      },
      {
        $unwind: "$timetables",
      },
      {
        $lookup: {
          from: "Class",
          localField: "timetables.class_id",
          foreignField: "_id",
          as: "class",
        },
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
        $unwind: "$class",
      },
      {
        $unwind: "$teacher",
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            SubjectName: "$SubjectName",
            module: "$Module",
            coeff: "$Coeff",
            teacher_name: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_years: {
            $addToSet: {
              $concat: [
                { $toString: "$class.Major" },
                " ",
                { $toString: "$class.Year" },
              ],
            },
          },
        },
      },
      {
        $sort: {
          "_id.SubjectName": 1,
        },
      },
      {
        $project: {
          _id: "$_id._id",
          SubjectName: "$_id.SubjectName",
          module: "$_id.module",
          coeff: "$_id.coeff",
          teacher_name: "$_id.teacher_name",
          classes_years: 1,
        },
      },
    ]);

    if (subject.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    res.status(200).json({ success: true, data: subject[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getSubjectsByMajor = asyncHandler(async (req, res) => {
  const { major } = req.params;

  try {
    const subjects = await Subject.aggregate([
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "subject_id",
          as: "timetables",
        },
      },
      {
        $unwind: "$timetables",
      },
      {
        $lookup: {
          from: "Class",
          localField: "timetables.class_id",
          foreignField: "_id",
          as: "class",
        },
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
        $unwind: "$class",
      },
      {
        $unwind: "$teacher",
      },
      {
        $match: {
          "class.Major": major,
        },
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            SubjectName: "$SubjectName",
            module: "$Module",
            coeff: "$Coeff",
            teacher_name: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_years: {
            $addToSet: {
              $concat: [
                { $toString: "$class.Major" },
                " ",
                { $toString: "$class.Year" },
              ],
            },
          },
        },
      },
      {
        $sort: {
          "_id.SubjectName": 1,
        },
      },
      {
        $project: {
          _id: "$_id._id",
          SubjectName: "$_id.SubjectName",
          module: "$_id.module",
          coeff: "$_id.coeff",
          teacher_name: "$_id.teacher_name",
          classes_years: 1,
        },
      },
    ]);

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subjects not found for the given major",
      });
    }

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getSubjectsByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  try {
    const subjects = await Subject.aggregate([
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "subject_id",
          as: "timetables",
        },
      },
      {
        $unwind: "$timetables",
      },
      {
        $lookup: {
          from: "Class",
          localField: "timetables.class_id",
          foreignField: "_id",
          as: "class",
        },
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
        $unwind: "$class",
      },
      {
        $unwind: "$teacher",
      },
      {
        $match: {
          "class.Year": parseInt(year),
        },
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            SubjectName: "$SubjectName",
            module: "$Module",
            coeff: "$Coeff",
            teacher_name: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_years: {
            $addToSet: {
              $concat: [
                { $toString: "$class.Major" },
                " ",
                { $toString: "$class.Year" },
              ],
            },
          },
        },
      },
      {
        $sort: {
          "_id.SubjectName": 1,
        },
      },
      {
        $project: {
          _id: "$_id._id",
          SubjectName: "$_id.SubjectName",
          module: "$_id.module",
          coeff: "$_id.coeff",
          teacher_name: "$_id.teacher_name",
          classes_years: 1,
        },
      },
    ]);

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subjects not found for the given major",
      });
    }

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getSubjectsByMajorAndByYear = asyncHandler(async (req, res) => {
  const { major, year } = req.params;

  try {
    const subjects = await Subject.aggregate([
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "subject_id",
          as: "timetables",
        },
      },
      {
        $unwind: "$timetables",
      },
      {
        $lookup: {
          from: "Class",
          localField: "timetables.class_id",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $match: {
          "class.Major": major,
          "class.Year": parseInt(year),
        },
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
        $unwind: "$class",
      },
      {
        $unwind: "$teacher",
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            SubjectName: "$SubjectName",
            module: "$Module",
            coeff: "$Coeff",
            teacher_name: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_years: {
            $addToSet: {
              $concat: [
                { $toString: "$class.Major" },
                " ",
                { $toString: "$class.Year" },
              ],
            },
          },
        },
      },
      {
        $sort: {
          "_id.SubjectName": 1,
        },
      },
      {
        $project: {
          _id: "$_id._id",
          SubjectName: "$_id.SubjectName",
          module: "$_id.module",
          coeff: "$_id.coeff",
          teacher_name: "$_id.teacher_name",
          classes_years: 1,
        },
      },
    ]);

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subjects not found for the given year",
      });
    }

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getSubjectsByTeacher = asyncHandler(async (req, res) => {
  const teacherCIN = req.params.teacher;

  try {
    const subjects = await Subject.aggregate([
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "subject_id",
          as: "timetables",
        },
      },
      {
        $unwind: "$timetables",
      },
      {
        $lookup: {
          from: "Class",
          localField: "timetables.class_id",
          foreignField: "_id",
          as: "class",
        },
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
        $match: {
          "teacher.CIN": teacherCIN,
        },
      },
      {
        $unwind: "$class",
      },
      {
        $unwind: "$teacher",
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            SubjectName: "$SubjectName",
            module: "$Module",
            coeff: "$Coeff",
            teacher_name: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_years: {
            $addToSet: {
              $concat: [
                { $toString: "$class.Major" },
                " ",
                { $toString: "$class.Year" },
              ],
            },
          },
        },
      },
      {
        $sort: {
          "_id.SubjectName": 1,
        },
      },
      {
        $project: {
          _id: "$_id._id",
          SubjectName: "$_id.SubjectName",
          module: "$_id.module",
          coeff: "$_id.coeff",
          teacher_name: "$_id.teacher_name",
          classes_years: 1,
        },
      },
    ]);

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subjects not found for the given year",
      });
    }

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getSubjectsByTeacherAndYear = asyncHandler(async (req, res) => {
  const teacherCIN = req.params.teacher;
  const year = req.params.year;

  try {
    const subjects = await Subject.aggregate([
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "subject_id",
          as: "timetables",
        },
      },
      {
        $unwind: "$timetables",
      },
      {
        $lookup: {
          from: "Class",
          localField: "timetables.class_id",
          foreignField: "_id",
          as: "class",
        },
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
        $match: {
          "teacher.CIN": teacherCIN,
          "class.Year": parseInt(year),
        },
      },
      {
        $unwind: "$class",
      },
      {
        $unwind: "$teacher",
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            SubjectName: "$SubjectName",
            module: "$Module",
            coeff: "$Coeff",
            teacher_name: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_years: {
            $addToSet: {
              $concat: [
                { $toString: "$class.Major" },
                " ",
                { $toString: "$class.Year" },
              ],
            },
          },
        },
      },
      {
        $sort: {
          "_id.SubjectName": 1,
        },
      },
      {
        $project: {
          _id: "_id._id",
          SubjectName: "$_id.SubjectName",
          module: "$_id.module",
          coeff: "$_id.coeff",
          teacher_name: "$_id.teacher_name",
          classes_years: 1,
        },
      },
    ]);

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subjects not found for the given year",
      });
    }

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getSubjectsByTeacherAndMajor = asyncHandler(async (req, res) => {
  const teacherCIN = req.params.teacher;
  const major = req.params.major;

  try {
    const subjects = await Subject.aggregate([
      {
        $lookup: {
          from: "Time_table",
          localField: "_id",
          foreignField: "subject_id",
          as: "timetables",
        },
      },
      {
        $unwind: "$timetables",
      },
      {
        $lookup: {
          from: "Class",
          localField: "timetables.class_id",
          foreignField: "_id",
          as: "class",
        },
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
        $match: {
          "teacher.CIN": teacherCIN,
          "class.Major": major,
        },
      },
      {
        $unwind: "$class",
      },
      {
        $unwind: "$teacher",
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            SubjectName: "$SubjectName",
            module: "$Module",
            coeff: "$Coeff",
            teacher_name: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_years: {
            $addToSet: {
              $concat: [
                { $toString: "$class.Major" },
                " ",
                { $toString: "$class.Year" },
              ],
            },
          },
        },
      },
      {
        $sort: {
          "_id.SubjectName": 1,
        },
      },
      {
        $project: {
          _id: "$_id._id",
          SubjectName: "$_id.SubjectName",
          module: "$_id.module",
          coeff: "$_id.coeff",
          teacher_name: "$_id.teacher_name",
          classes_years: 1,
        },
      },
    ]);

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subjects not found for the given year",
      });
    }

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getSubjectsByTeacherMajorAndYear = asyncHandler(
  async (req, res) => {
    const teacherCIN = req.params.teacher;
    const major = req.params.major;
    const year = req.params.year;

    try {
      const subjects = await Subject.aggregate([
        {
          $lookup: {
            from: "Time_table",
            localField: "_id",
            foreignField: "subject_id",
            as: "timetables",
          },
        },
        {
          $unwind: "$timetables",
        },
        {
          $lookup: {
            from: "Class",
            localField: "timetables.class_id",
            foreignField: "_id",
            as: "class",
          },
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
          $match: {
            "teacher.CIN": teacherCIN,
            "class.Major": major,
            "class.Year": parseInt(year),
          },
        },
        {
          $unwind: "$class",
        },
        {
          $unwind: "$teacher",
        },
        {
          $group: {
            _id: {
              _id: "$_id",
              SubjectName: "$SubjectName",
              module: "$Module",
              coeff: "$Coeff",
              teacher_name: {
                $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
              },
            },
            classes_years: {
              $addToSet: {
                $concat: [
                  { $toString: "$class.Major" },
                  " ",
                  { $toString: "$class.Year" },
                ],
              },
            },
          },
        },
        {
          $sort: {
            "_id.SubjectName": 1,
          },
        },
        {
          $project: {
            _id: "$_id._id",
            SubjectName: "$_id.SubjectName",
            module: "$_id.module",
            coeff: "$_id.coeff",
            teacher_name: "$_id.teacher_name",
            classes_years: 1,
          },
        },
      ]);

      if (subjects.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Subjects not found for the given year",
        });
      }

      res.status(200).json({ success: true, data: subjects });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

export const getAllSubjects = asyncHandler(async (req, res) => {
  try {
    const distinctSubjects = await TimeTable.distinct("subject_id");
    const subjectNames = await Subject.find(
      { _id: { $in: distinctSubjects } },
      "SubjectName"
    );
    const sortedSubjectNames = subjectNames
      .map((subject) => subject.SubjectName)
      .sort();
    res.status(200).json({ subjects: sortedSubjectNames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

export const createSubject = asyncHandler(async (req, res) => {
  const existingSubject = await Subject.findOne({
    SubjectName: req.body.SubjectName,
    Coeff: req.body.Coeff,
  });
  if (!existingSubject) {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } else {
    res.status(400).json({ success: false, message: "Subject already exists" });
  }
});

export const updateSubject = asyncHandler(async (req, res) => {
  const existingSubject = await Subject.findOne({
    SubjectName: req.body.SubjectName,
    Module: req.body.Module,
    Coeff: req.body.Coeff,
  });
  if (!existingSubject) {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }
    res.status(200).json({ success: true, data: subject });
  } else {
    res.status(400).json({ success: false, message: "Subject already exists" });
  }
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const subjectId = req.params.id;

  // Step 1: Delete the subject itself
  const deletedSubject = await Subject.findByIdAndDelete(subjectId);

  if (!deletedSubject) {
    return res
      .status(404)
      .json({ success: false, message: "Subject not found" });
  }

  // Step 2: Delete associated timetable entries
  const deletedTimetables = await TimeTable.deleteMany({
    subject_id: subjectId,
  });

  res
    .status(200)
    .json({ success: true, data: { deletedSubject, deletedTimetables } });
});
