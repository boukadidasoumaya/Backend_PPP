import mongoose from 'mongoose';

const AbsenceTeacherSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  timetable_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Time_table', required: true },
}, { timestamps: true });

const AbsenceTeacher = mongoose.model('Absence_Teacher', AbsenceTeacherSchema, 'Absence_Teacher');

export default AbsenceTeacher;
