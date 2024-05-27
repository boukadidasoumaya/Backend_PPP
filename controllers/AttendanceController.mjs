import expressAsyncHandler from 'express-async-handler';
import Attendance from '../models/AttendanceModel.mjs';
import moment from 'moment';
function getWeekRange() {
  const now = new Date();
  const firstDay = now.getDate() - now.getDay() + 1; // Adjust to get Monday as the first day
  const lastDay = firstDay + 6;

  const startOfWeek = new Date(now.setDate(firstDay));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(now.setDate(lastDay));
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}



const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const getWeeklyAttendance = expressAsyncHandler(async (req, res) => {
  try {
    const startOfWeek = moment().startOf('week').toDate();
    const endOfWeek = moment().endOf('week').toDate();

    const attendanceRecords = await Attendance.aggregate([
      {
        $match: {
          day: {
            $gte: startOfWeek,
            $lte: endOfWeek,
          },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: { $add: ['$day', 1] } },
          totalAttendance: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          dayOfWeek: {
            $cond: { if: { $eq: ['$_id', 7] }, then: 0, else: '$_id' }
          },
          totalAttendance: '$totalAttendance'
        }
      }
    ]);

    const allDays = Array.from({ length: 7 }, (_, i) => i);

    const data = allDays.map(day => ({
      x: WEEKDAYS[day],
      y: (attendanceRecords.find(record => record.dayOfWeek === day) || { totalAttendance: 0 }).totalAttendance
    }));

    const result = {
      id: 'current-week',
      color: 'hsl(355, 70%, 50%)',
      data
    };

    console.log('Start of Week:', startOfWeek);
    console.log('End of Week:', endOfWeek);
    console.log('Attendance Records:', attendanceRecords);

    console.dir(result, { depth: null });
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
export const getMonthlyAttendance = expressAsyncHandler(async (req, res) => {
  try {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    const attendanceRecords = await Attendance.aggregate([
        {
            $match: {
                day: {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                },
            },
        },
        {
            $group: {
                _id: { $week: '$day' },
                totalAttendance: { $sum: 1 },
            },
        },
        {
            $sort: { '_id': 1 },
        },
        {
            $project: {
                _id: 0,
                week: { $concat: ['week', { $toString: '$_id' }] },
                totalAttendance: '$totalAttendance'
            }
        }
    ]);

    const result = {
        id: 'all-students',
        color: 'hsl(355, 70%, 50%)',
        data: attendanceRecords.map(record => ({
            x: record.week,
            y: record.totalAttendance
        }))
    };
    console.log('Start of Month:', startOfMonth);
console.log('End of Month:', endOfMonth);
console.log('Attendance Records:', attendanceRecords);

console.dir(result, { depth: null });
    res.status(200).json(result);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
}
});
