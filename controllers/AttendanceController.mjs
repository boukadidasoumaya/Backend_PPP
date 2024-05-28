import expressAsyncHandler from 'express-async-handler';
import Attendance from '../models/AttendanceModel.mjs';
import moment from 'moment';
import Student from '../models/StudentModel.mjs';
import TimeTable from '../models/TimeTableModel.mjs';
import Absence from '../models/AbscenceModel.mjs';
import Class from '../models/ClassModel.mjs';


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
    
            res.status(200).json(totalStudentsPerYear);
        } catch (error) {
            console.error('Error calculating total students per year:', error);
            res.status(500).json({ message: 'Server Error' });
        }
    });
    
function addMinutesToTime(time, minutesToAdd) {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + minutesToAdd);
    const newHours = date.getHours().toString().padStart(2, '0');
    const newMinutes = date.getMinutes().toString().padStart(2, '0');
    return `${newHours}:${newMinutes}`;
  }
  
  export const calculateAbsences = expressAsyncHandler(async (req, res) => {
    try {
        console.log('Calculating absences...');
      const today = new Date();
      const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });
  
      // Retrieve timetable entries for the current day
      const timetableEntries = await TimeTable.find({ Day: currentDay });
  console.log(currentDay);
      for (const entry of timetableEntries) {
        const { class_id, StartTime, EndTime } = entry;
  
        // Get the students of the class
        const students = await Student.find({ class_id });
  
        for (const student of students) {
          // Calculate the allowed time for attendance
          const startTimeWithMargin = addMinutesToTime(StartTime, 15);
  
          // Check if the student has attendance for the given date and time within the margin
          const attendanceRecord = await Attendance.findOne({
            id: student._id.toString(),
            day: today,
            time: { $gte: StartTime, $lte: startTimeWithMargin }  // Assuming `time` is stored in "HH:mm" format
          });
  
          if (!attendanceRecord) {
           await Absence.create({
              student_id: student._id,
              timetable_id: entry._id,
              date: today,
             time: `${StartTime}-${EndTime}`
           });
           console.log('absence recorded for student:', student._id);
          }
        }
      }
  
      res.status(200).json({ message: 'Absences calculated and recorded successfully.' });
    } catch (error) {
      console.error('Error calculating absences:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  export const calculateAbsencesPerMajor = expressAsyncHandler(async (req, res) => {
    try {
      const { startOfWeek, endOfWeek } = getCurrentWeekRange();
  
      // Fetch all absence records for the current week
      const absences = await Absence.find({
        date: {
          $gte: startOfWeek,
          $lte: endOfWeek
        }
      }).populate('student_id timetable_id');
  
      const absencesPerMajor = {};
  
      for (const absence of absences) {
        const student = await Student.findById(absence.student_id);
        const studentClass = await ClassModel.findById(student.class_id);
  
        const major = studentClass.Major;
  
        if (!absencesPerMajor[major]) {
          absencesPerMajor[major] = 0;
        }
  
        absencesPerMajor[major]++;
      }
  
      res.status(200).json(absencesPerMajor);
    } catch (error) {
      console.error('Error calculating absences per major:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  function getCurrentWeekRange() {
    const startOfWeek = moment().startOf('isoWeek').toDate();
    const endOfWeek = moment().endOf('isoWeek').toDate();
    return { startOfWeek, endOfWeek };
  }