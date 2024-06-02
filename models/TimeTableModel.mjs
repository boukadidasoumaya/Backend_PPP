import mongoose from "mongoose";

const TimeTableSchema = mongoose.Schema({
  StartTime: {
    type: String,
    required: [true, "Start Time is required"],
  },
  EndTime: {
    type: String,
    required: [true, "End Time is required"],

  },
  Day: {
    type: String,
    required: [true, "Day is required"],
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday"],
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Subject ID is required"],
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Teacher ID is required"],
  },
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Class ID is required"],
  },
  Room: {
    type: String,
    required: [true, "Room is required"],
  },
  Semester:{
    type: Number,
    required: [true, "Semester is required"],
  
  },
  Type:{
    type: String,
    required: [true, "Type is required"],
    enum: ["TD", "TP", "Lecture"],
  }
});

const TimeTable = mongoose.model("Time_table", TimeTableSchema, "Time_table");

export default TimeTable;
