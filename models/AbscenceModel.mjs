import mongoose from 'mongoose';

const AbsenceSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  timetable_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Time_table', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }
}, { timestamps: true });

const Absence = mongoose.model('Absence', AbsenceSchema, 'Absence');

export default Absence;
