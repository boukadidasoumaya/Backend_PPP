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
  },
});

export default mongoose.model("Subject", SubjectSchema, "Subject");
