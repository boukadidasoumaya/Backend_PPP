import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define schema
const StudentSchema = new mongoose.Schema({
  Student_id: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true
  },
  CIN: {
    type: String,
    required: [true, 'CIN is required'],
    unique: true,
    match: [/^[0-9]{8}$/, 'CIN must be an 8-digit number']
  },
  FirstName: {
    type: String,
    required: [true, 'First Name is required'],
    match: [/^[a-zA-Z]+$/, 'First Name must contain only letters']
  },
  LastName: {
    type: String,
    required: [true, 'Last Name is required'],
    match: [/^[a-zA-Z]+$/, 'Last Name must contain only letters']
  },
  Email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format']
  },
  Class_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Class ID is required']
  },
//   image_url: {
//     type: String,
//     match: [/^(http|https):\/\/[^ "]+$/, 'Invalid image URL format']
//   }
});

// Compile the schema into a model
const Student = mongoose.model('Student', StudentSchema,'Student');

export default Student;
