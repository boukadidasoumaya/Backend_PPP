import expressAsyncHandler from 'express-async-handler';
import Attendance from '../models/AttendanceModel.mjs';

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

export const getAttendance = expressAsyncHandler(async (req, res) => {
  try {
    const { startOfWeek, endOfWeek } = getWeekRange();

    // Ensure startOfWeek and endOfWeek are correctly formatted dates
    if (!startOfWeek || !endOfWeek) {
      throw new Error('Invalid week range');
    }

    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          t: { $gte: startOfWeek.getTime() / 1000, $lte: endOfWeek.getTime() / 1000 }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: { $toDate: { $multiply: ["$t", 1000] } } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const dayMapping = {
      1: 'Sunday',
      2: 'Monday',
      3: 'Tuesday',
      4: 'Wednesday',
      5: 'Thursday',
      6: 'Friday',
      7: 'Saturday'
    };

    // Transform the result to the desired format
    const transformedData = [
      {
        id: "attendance",
        color: "hsl(355, 70%, 50%)",
        data: attendanceData.map(item => ({
          x: dayMapping[item._id],
          y: item.count
        }))
      }
    ];

    console.dir(transformedData, { depth: null });
    res.json(transformedData);
  } catch (error) {
    console.error(error);  // Log the error to the server console
    res.status(500).json({ error: error.message });
  }
});