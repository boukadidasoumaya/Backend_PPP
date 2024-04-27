import mongoose from "mongoose";

// Define schema
const TeacherSchema = new mongoose.Schema({
  CIN: {
    type: String,
    required: [true, "CIN is required"],
    unique: true,
    match: [/^[0-9]{8}$/, "CIN must be an 8-digit number"],
  },
  FirstName: {
    type: String,
    required: [true, "First Name is required"],
    match: [/^[a-zA-Z]+$/, "First Name must contain only letters"],
  },
  LastName: {
    type: String,
    required: [true, "Last Name is required"],
    match: [/^[a-zA-Z]+$/, "Last Name must contain only letters"],
  },
  Email: {
    type: String,
    required: [true, "Email is required"],
    match: [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format",
    ],
  },
  Department: {
    type: String,
    required: [true, "Department is required"],
    unique: true,
    enum: {
      values: [
        "Génie Informatique et Mathématiques",
        "Génie Physique et Instrumentation",
        "Génie Biologique et Chimie",
        "Sciences Sociales",
        "Langues et Formation Générale",
      ],
      message: "Invalid department",
    },
  },
});

// Compile the schema into a model
const Teacher = mongoose.model("Teacher", TeacherSchema, "Teacher");

export default Teacher;
