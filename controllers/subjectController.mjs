import Subject from "../models/SubjectModel.mjs";
import TimeTable from "../models/TimeTableModel.mjs";
import Class from "../models/ClassModel.mjs";
import Modules from "../enums/moduleEnum.mjs";
import asyncHandler from "express-async-handler";
import { mongoose, Types } from "mongoose";
import multer from "multer";

const { ObjectId } = mongoose.Types;

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
          _id: "$_id",
          SubjectName: { $first: "$SubjectName" },
          Module: { $first: "$Module" },
          Coeff: { $first: "$Coeff" },
          teacher_names: {
            $push: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_year: {
            $push: {
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
        $set: {
          teacher_name: {
            $setIntersection: ["$teacher_names", "$teacher_names"],
          },
          classes_years: {
            $setIntersection: ["$classes_year", "$classes_year"],
          },
        },
      },
      {
        $sort: {
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
        },
      },

      {
        $project: {
          _id: 1,
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
          teacher_name: 1,
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
  if (!Types.ObjectId.isValid(subjectId)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid subject ID" });
  }
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
          _id: "$_id",
          SubjectName: { $first: "$SubjectName" },
          Module: { $first: "$Module" },
          Coeff: { $first: "$Coeff" },
          teacher_names: {
            $push: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_year: {
            $push: {
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
        $set: {
          teacher_name: {
            $setIntersection: ["$teacher_names", "$teacher_names"],
          },
          classes_years: {
            $setIntersection: ["$classes_year", "$classes_year"],
          },
        },
      },
      {
        $sort: {
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
        },
      },
      {
        $project: {
          _id: 0,
          SubjectName: "$_id.SubjectName",
          Module: "$_id.Module",
          Coeff: "$_id.Coeff",
          teacher_name: 1,
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
          _id: "$_id",
          SubjectName: { $first: "$SubjectName" },
          Module: { $first: "$Module" },
          Coeff: { $first: "$Coeff" },
          teacher_names: {
            $push: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_year: {
            $push: {
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
        $set: {
          teacher_name: {
            $setIntersection: ["$teacher_names", "$teacher_names"],
          },
          classes_years: {
            $setIntersection: ["$classes_year", "$classes_year"],
          },
        },
      },
      {
        $sort: {
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
        },
      },
      {
        $project: {
          _id: 1,
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
          teacher_name: 1,
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
          _id: "$_id",
          SubjectName: { $first: "$SubjectName" },
          Module: { $first: "$Module" },
          Coeff: { $first: "$Coeff" },
          teacher_names: {
            $push: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_year: {
            $push: {
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
        $set: {
          teacher_name: {
            $setIntersection: ["$teacher_names", "$teacher_names"],
          },
          classes_years: {
            $setIntersection: ["$classes_year", "$classes_year"],
          },
        },
      },
      {
        $sort: {
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
        },
      },
      {
        $project: {
          _id: 1,
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
          teacher_name: 1,
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
          _id: "$_id",
          SubjectName: { $first: "$SubjectName" },
          Module: { $first: "$Module" },
          Coeff: { $first: "$Coeff" },
          teacher_names: {
            $push: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_year: {
            $push: {
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
        $set: {
          teacher_name: {
            $setIntersection: ["$teacher_names", "$teacher_names"],
          },
          classes_years: {
            $setIntersection: ["$classes_year", "$classes_year"],
          },
        },
      },
      {
        $sort: {
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
        },
      },
      {
        $project: {
          _id: 1,
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
          teacher_name: 1,
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
          _id: "$_id",
          SubjectName: { $first: "$SubjectName" },
          Module: { $first: "$Module" },
          Coeff: { $first: "$Coeff" },
          teacher_names: {
            $push: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_year: {
            $push: {
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
        $set: {
          teacher_name: {
            $setIntersection: ["$teacher_names", "$teacher_names"],
          },
          classes_years: {
            $setIntersection: ["$classes_year", "$classes_year"],
          },
        },
      },
      {
        $sort: {
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
        },
      },
      {
        $project: {
          _id: 1,
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
          teacher_name: 1,
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

export const getSubjectsByModule = asyncHandler(async (req, res) => {
  const Mod = req.params.module;
  console.log(Mod);

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
          Module: Mod,
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
          _id: "$_id",
          SubjectName: { $first: "$SubjectName" },
          Module: { $first: "$Module" },
          Coeff: { $first: "$Coeff" },
          teacher_names: {
            $push: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_year: {
            $push: {
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
        $set: {
          teacher_name: {
            $setIntersection: ["$teacher_names", "$teacher_names"],
          },
          classes_years: {
            $setIntersection: ["$classes_year", "$classes_year"],
          },
        },
      },
      {
        $sort: {
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
        },
      },
      {
        $project: {
          _id: 1,
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
          teacher_name: 1,
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

export const getSubjectsByModuleAndYear = asyncHandler(async (req, res) => {
  const Mod = req.params.module;
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
          Module: Mod,
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
          _id: "$_id",
          SubjectName: { $first: "$SubjectName" },
          Module: { $first: "$Module" },
          Coeff: { $first: "$Coeff" },
          teacher_names: {
            $push: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_year: {
            $push: {
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
        $set: {
          teacher_name: {
            $setIntersection: ["$teacher_names", "$teacher_names"],
          },
          classes_years: {
            $setIntersection: ["$classes_year", "$classes_year"],
          },
        },
      },
      {
        $sort: {
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
        },
      },
      {
        $project: {
          _id: "_id._id",
          SubjectName: "$_id.SubjectName",
          Module: "$_id.Module",
          Coeff: "$_id.Coeff",
          teacher_name: 1,
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

export const getSubjectsByModuleAndMajor = asyncHandler(async (req, res) => {
  const Mod = req.params.module;
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
          Module: Mod,
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
          _id: "$_id",
          SubjectName: { $first: "$SubjectName" },
          Module: { $first: "$Module" },
          Coeff: { $first: "$Coeff" },
          teacher_names: {
            $push: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
          },
          classes_year: {
            $push: {
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
        $set: {
          teacher_name: {
            $setIntersection: ["$teacher_names", "$teacher_names"],
          },
          classes_years: {
            $setIntersection: ["$classes_year", "$classes_year"],
          },
        },
      },
      {
        $sort: {
          "_id.SubjectName": 1,
          "_id.Module": 1,
        },
      },
      {
        $project: {
          _id: 1,
          SubjectName: 1,
          Module: 1,
          Coeff: 1,
          teacher_name: 1,
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

export const getSubjectsByModuleMajorAndYear = asyncHandler(
  async (req, res) => {
    const Mod = req.params.module;
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
            Module: Mod,
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
            _id: "$_id",
            SubjectName: { $first: "$SubjectName" },
            Module: { $first: "$Module" },
            Coeff: { $first: "$Coeff" },
            teacher_names: {
              $push: {
                $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
              },
            },
            classes_year: {
              $push: {
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
          $set: {
            teacher_name: {
              $setIntersection: ["$teacher_names", "$teacher_names"],
            },
            classes_years: {
              $setIntersection: ["$classes_year", "$classes_year"],
            },
          },
        },
        {
          $sort: {
            "_id.SubjectName": 1,
            "_id.Module": 1,
            "_id.Coeff": 1,
          },
        },
        {
          $project: {
            _id: 1,
            SubjectName: 1,
            Module: 1,
            Coeff: 1,
            teacher_name: 1,
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

export const getAllModules = asyncHandler(async (req, res) => {
  try {
    console.log("eeeeeeeeeeeeeeeeeeeeee")
    console.log(Object.values(Modules))
    res.status(200).json({ success: true, data: Object.values(Modules) });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export const getAllSubjects = asyncHandler(async (req, res) => {
  try {
    const subjects = await Subject.distinct("SubjectName");
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export const createSubject = asyncHandler(async (req, res) => {
  const existingSubject = await Subject.findOne({
    SubjectName: req.body.SubjectName,
    Module: req.body.Module,
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
  try {
    // Find the existing subject by SubjectName, Module, and Coeff
    const existingSubject = await Subject.findOne({
      SubjectName: req.body.SubjectName,
      Module: req.body.Module,
      Coeff: req.body.Coeff,
    });

    // If the existing subject is found
    if (existingSubject) {
      // Update the subject_id of related timetables to the new subject's _id
      await TimeTable.updateMany(
        { subject_id: req.params.id },
        { $set: { subject_id: existingSubject._id } }
      );
    }

    // Update the subject
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // If subject not found
    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }

    // Respond with the updated subject
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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

export const dropSubjectsByMajorAndYear = asyncHandler(async (req, res) => {
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
        return res.status(400).json({
          success: false,
          error: "The 'year' parameter must be a valid number",
        });
      }
      classFilter.Year = yearNumber;
    }

    // Find all classes matching the given major and/or year
    const classes = await Class.find(classFilter);

    if (classes.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No classes found for the given parameters",
      });
    }

    // Extract the class IDs
    const classIds = classes.map((cls) => cls._id);

    const timetables = await TimeTable.find({class_id: {$in: classIds}})

    if (timetables.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No timetable found for the given parameters",
      });
    }

    // Extract the subject IDs
    const subjectIds = timetables.map((tt) => tt.subject_id);

    // Delete the foreign key references in the Time_table table
    await TimeTable.deleteMany({ class_id: { $in: classIds } });

    // Delete the subjects
    await Subject.deleteMany({ _id: { $in: subjectIds } });

    res.status(200).json({
      success: true,
      message: `${subjectIds.length} subjects and their references in the Time_table deleted successfully`,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ success: false, error: "Server error" });
  }
});
