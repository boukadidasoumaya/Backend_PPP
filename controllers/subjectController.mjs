import Subject from "../models/SubjectModel.mjs";
import Class from "../models/ClassModel.mjs";
import TimeTable from "../models/TimeTableModel.mjs";
import Teacher from "../models/TeacherModel.mjs";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

import asyncHandler from "express-async-handler";

export const getSubjects = async (req, res) => {
  try {
    const subjects = await TimeTable.aggregate([
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
          Subject_id: "$subject_id",
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
        },
      },
    ]);
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getSubjectById = asyncHandler(async (req, res) => {
  const subjectId = req.params.id;
  const newId = new ObjectId(subjectId);

  try {
    const subject = await TimeTable.aggregate([
      {
        $match: {
          subject_id: newId,
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
          Subject_id: "$subject_id",
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
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
  const subjectName = req.params.subjectName;

  try {
    const subject = await TimeTable.aggregate([
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
          "subject.SubjectName": subjectName,
        },
      },
      {
        $project: {
          Subject_id: "$subject_id",
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
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
    const subjects = await TimeTable.aggregate([
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
        },
      },
      {
        $project: {
          Subject_id: "$subject_id",
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
          teacher_email: "$teacher.Email",
        },
      },
    ]);

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
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
    const subjects = await TimeTable.aggregate([
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
          "class.Year": parseInt(year),
        },
      },
      {
        $project: {
          Subject_id: "$subject_id",
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
        },
      },
    ]);

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
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
    const subjects = await TimeTable.aggregate([
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
          "class.Year": parseInt(year),
        },
      },
      {
        $project: {
          Subject_id: "$subject_id",
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
        },
      },
    ]);

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export const getSubjectsByTeacher = asyncHandler(async (req, res) => {
  const teacherCIN = req.params.teacher;
  console.log(req.params.teacher);
  console.log(teacherCIN);

  try {
    const subjects = await TimeTable.aggregate([
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
          "teacher.CIN": teacherCIN,
        },
      },
      {
        $project: {
          Subject_id: "$subject_id",
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
          teacher_email: "$teacher.Email",
        },
      },
    ]);

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
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
    const subjects = await TimeTable.aggregate([
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
          "teacher.CIN": teacherCIN,
          "class.Year": parseInt(year),
        },
      },
      {
        $project: {
          Subject_id: "$subject_id",
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
        },
      },
    ]);

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
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
  console.log(req.params);

  try {
    const subjects = await TimeTable.aggregate([
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
          "teacher.CIN": teacherCIN,
          "class.Major": major,
        },
      },
      {
        $project: {
          Subject_id: "$subject_id",
          SubjectName: "$subject.SubjectName",
          module: "$subject.Module",
          coeff: "$subject.Coeff",
          major: "$class.Major",
          year: "$class.Year",
          teacher_name: {
            $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
          },
          teacher_cin: "$teacher.CIN",
          teacher_email: "$teacher.Email",
        },
      },
    ]);

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
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
      const subjects = await TimeTable.aggregate([
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
            "teacher.CIN": teacherCIN,
            "class.Major": major,
            "class.Year": parseInt(year),
          },
        },
        {
          $project: {
            Subject_id: "$subject_id",
            SubjectName: "$subject.SubjectName",
            module: "$subject.Module",
            coeff: "$subject.Coeff",
            major: "$class.Major",
            year: "$class.Year",
            teacher_name: {
              $concat: ["$teacher.FirstName", " ", "$teacher.LastName"],
            },
            teacher_cin: "$teacher.CIN",
            teacher_email: "$teacher.Email",
          },
        },
      ]);

      if (subjects.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Subject not found" });
      }

      res.status(200).json({ success: true, data: subjects });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

export const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(201).json({ success: true, data: subject });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }
  res.status(200).json({ success: true, data: subject });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }
  res.status(200).json({ success: true, data: {} });
});
