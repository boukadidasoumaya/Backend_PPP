import mongoose from 'mongoose';
const attendanceSchema = new mongoose.Schema({
  id: String, // Student ID
    day: { type: Date, default: Date.now }, // Timestamp for the day of attendance
    time: String, // Time of attendance (you may want to consider using a Date type for time as well)
    t: Number // Not sure what this field represents, but it's included as per your provided data
}, { timestamps: true }); // Add timestamps option to enable createdAt and updatedAt fields

  
  export default mongoose.model('Attendance', attendanceSchema,'Attendance');
  