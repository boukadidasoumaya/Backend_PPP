import mongoose from "mongoose";
import modules from "../enums/moduleEnum.mjs";

const SubjectSchema = mongoose.Schema({
  SubjectName: {
    type: String,
    required: [true, "Please add subject name"],
  },
  Module: {
    type: String,
    required: [true, "Please add module"],
    enum: Object.values(modules),
  },
  Coeff: {
    type: Number,
    required: [true, "Please add coefficient"],
    enum: {
      values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      message: "Coefficient must be between 1 and 6",
    },
  },
});

export default mongoose.model("Subject", SubjectSchema, "Subject");
