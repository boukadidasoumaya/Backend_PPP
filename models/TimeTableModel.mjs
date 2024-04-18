import mongoose from "mongoose";

const TimeTableSchema = mongoose.Schema({
  StartTime: {
    type: Date,
    required: [true, "Start Time is required"],
    match: [/^(?:[0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid Start Time format"],
  },
  EndTime: {
    type: Date,
    required: [true, "End Time is required"],
    match: [/^(?:[0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid End Time format"],
  },
  Day: {
    type: String,
    required: [true, "Day is required"],
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
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
    type: Number,
    required: [true, "Class is required"],
  },
  Week: {
    type: String,
    enum: ["A", "B"],
  },
});

const TimeTable = mongoose.model("Time_table", TimeTableSchema, "Time_table");

export default TimeTable;