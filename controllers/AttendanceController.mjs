import expressAsyncHandler from 'express-async-handler';
import Attendance from '../models/AttendanceModel.mjs';
import moment from 'moment';
import Student from '../models/StudentModel.mjs';


const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getWeeklyAttendance = expressAsyncHandler(async (req, res) => {
    try {
        const startOfWeek = moment().startOf('week').toDate(); // Start of the current week
        const endOfWeek = moment().endOf('week').toDate(); // End of the current week
    
        // Aggregation pipeline to count attendance per day of the current week
        const attendanceRecords = await Attendance.aggregate([
          {
            $match: {
              day: {
                $gte: startOfWeek,
                $lte: endOfWeek
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$day'
                }
              }, // Group by date in format YYYY-MM-DD
              totalAttendance: { $sum: 1 } // Count the number of attendance records
            }
          },
          {
            $sort: { '_id': 1 } // Sort by date
          }
        ]);
    
        const result = {
          id: 'current-week',
          color: 'hsl(355, 70%, 50%)',
          data: attendanceRecords.map(record => ({
            x: record._id,
            y: record.totalAttendance
          }))
        };
    
        console.log('Final Result:', result);
        res.status(200).json([result]); // Wrap result in array
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
   
    

    res.status(200).json(result);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
}
});
export const getMonthlyClassAttendanceData = async () => {
    try {
      const startOfMonth = moment().startOf('month').toDate();
      const endOfMonth = moment().endOf('month').toDate();
  
      const monthlyAttendance = await Attendance.aggregate([
        {
          $match: {
            day: {
              $gte: startOfMonth,
              $lte: endOfMonth
            }
          }
        },
        {
          $lookup: {
            from: 'students',
            localField: 'student',
            foreignField: '_id',
            as: 'student'
          }
        },
        {
          $unwind: '$student'
        },
        {
          $group: {
            _id: '$student.class_id',
            totalAttendance: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'classes',
            localField: '_id',
            foreignField: '_id',
            as: 'class'
          }
        },
        {
          $unwind: '$class'
        },
        {
          $project: {
            _id: 0,
            country: '$class.country', // Assuming class has a 'country' field
            'hot dog': '$totalAttendance',
            'hot dogColor': { $concat: ['hsl(', { $multiply: ['$totalAttendance', 10] }, ', 70%, 50%)'] }
          }
        }
      ]);
  
      return monthlyAttendance;
    } catch (error) {
      console.error('Error calculating monthly class attendance:', error);
      throw error;
    }
  };
    export const calculateTotalStudentsPerMajor= expressAsyncHandler(async (req, res) => {
    try {
      const totalStudentsPerMajor = await Student.aggregate([
        {
          $lookup: {
            from: 'Class',
            localField: 'class_id',
            foreignField: '_id',
            as: 'class'
          }
        },
        {
          $unwind: '$class'
        },
        {
          $group: {
            _id: '$class.Major',
            totalStudents: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            major: '$_id',
            totalStudents: 1
          }
        }
      ]);
  
      res.status(200).json(totalStudentsPerMajor)
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    }
    );
    export const calculateTotalStudentsPerYear = expressAsyncHandler(async (req, res) => {
        try {
            console.log('Calculating total students per year...');
            const totalStudentsPerYear = await Student.aggregate([
                {
                    $lookup: {
                        from: 'Class',
                        localField: 'class_id',
                        foreignField: '_id',
                        as: 'class'
                    }
                },
                {
                    $unwind: '$class'
                },
                {
                    $group: {
                        _id: '$class.Year',
                        totalStudents: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        year: '$_id',
                        totalStudents: 1
                    }
                }
            ]);
            console.log('Total students per year:', totalStudentsPerYear);
    
            res.status(200).json(totalStudentsPerYear);
        } catch (error) {
            console.error('Error calculating total students per year:', error);
            res.status(500).json({ message: 'Server Error' });
        }
    });