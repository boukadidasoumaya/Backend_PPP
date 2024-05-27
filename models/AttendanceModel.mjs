import mongoose from 'mongoose';
const attendanceSchema = new mongoose.Schema({
    id: String,
    day: Number,
    time: String,
    t: Number
  });
  
  export default mongoose.model('Attendance', attendanceSchema,'Attendance');
  