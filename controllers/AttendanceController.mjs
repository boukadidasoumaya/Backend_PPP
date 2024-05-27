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
          _id: { $dayOfWeek: '$day' }, // Group by the day of the week
          totalAttendance: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          dayOfWeek: { $subtract: ['$_id', 1] }, // Adjust day of the week to align with JavaScript's representation
          totalAttendance: 1,
        },
      },
      {
        $addFields: {
          dayOfWeek: {
            $cond: {
              if: { $eq: ['$dayOfWeek', 0] },
              then: 6,
              else: { $subtract: ['$dayOfWeek', 1] }
            }
          }
        }
      },
      {
        $sort: { dayOfWeek: 1 }, // Sort by day of the week
      },
    ]);

    const result = attendanceRecords.map(record => ({
      x: getDayOfWeek(record.dayOfWeek), // Format day of the week
      y: record.totalAttendance,
    }));

    console.log('Start of Week:', startOfWeek);
    console.log('End of Week:', endOfWeek);
    console.log('Attendance Records:', result);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Function to format day of the week
function getDayOfWeek(dayOfWeek) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

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
