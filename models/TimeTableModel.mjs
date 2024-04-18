import mongoose from "mongoose";

const TimeTableSchema = mongoose.Schema({
  StartTime: {
    type: String,
    required: [true, "Start Time is required"],
    enum: [
        "08:00",
        "09:30",
        "09:45",
        "11:15",
        "11:30",
        "13:00",
        "14:00",
        "15:30",
        "15:45",
        "17:15",
    ],
  },
  EndTime: {
    type: String,
    required: [true, "End Time is required"],
    enum: [
        "08:00",
        "09:30",
        "09:45",
        "11:15",
        "11:30",
        "13:00",
        "14:00",
        "15:30",
        "15:45",
        "17:15",
      ],
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
    required: [true, "Week is required"],
    enum: ["A", "B", "W"],
  },
});

const TimeTable = mongoose.model("Time_table", TimeTableSchema, "Time_table");

export default TimeTable;
