import expressAsyncHandler from 'express-async-handler';
import Attendance from '../models/AttendanceModel.mjs';
import moment from 'moment';
import Student from '../models/StudentModel.mjs';
import TimeTable from '../models/TimeTableModel.mjs';
import Absence from '../models/AbscenceModel.mjs';
import ClassModel from '../models/ClassModel.mjs';


const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getWeeklyAttendance = expressAsyncHandler(async (req, res) => {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of the current day

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 5); // 5 days before today
    startDate.setHours(0, 0, 0, 0); // Start of the start day

    const rangeEndDate = new Date(endDate);
    rangeEndDate.setDate(endDate.getDate() + 1); // 2 days after today
    rangeEndDate.setHours(23, 59, 59, 999); // End of the end day

    const attendanceRecords = await Attendance.aggregate([
      {
        $match: {
          day: {
            $gte: startDate,
            $lte: rangeEndDate
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

    // Ensure all days within the range are included, even if they have no attendance
    const allDates = [];
    for (let d = startDate; d <= rangeEndDate; d.setDate(d.getDate() + 1)) {
      allDates.push({
        date: new Date(d).toISOString().split('T')[0], // Format date to YYYY-MM-DD
        totalAttendance: 0
      });
    }

    // Merge the attendance records with the complete date range
    const attendanceMap = new Map(attendanceRecords.map(record => [record._id, record.totalAttendance]));
    const resultData = allDates.map(date => ({
      x: date.date,
      y: attendanceMap.get(date.date) || 0
    }));

    const result = {
      id: 'attendance-range',
      color: 'hsl(355, 70%, 50%)',
      data: resultData
    };

    res.status(200).json([result]); // Wrap result in array
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
    export const getMonthlyAttendance = expressAsyncHandler(async (req, res) => {
      try {
        // Calculate the start and end of the last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29); // Go back 29 days from today to get the start of the 30-day range
        startDate.setHours(0, 0, 0, 0); // Set time to the start of the day
        endDate.setHours(23, 59, 59, 999); // Set time to the end of the current day
    
        const attendanceRecords = await Attendance.aggregate([
            {
                $match: {
                    day: {
                        $gte: startDate,
                        $lte: endDate,
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

      const today = new Date();
      const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });
  
      // Retrieve timetable entries for the current day
      const timetableEntries = await TimeTable.find({ Day: currentDay });
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
      // Calculate the start and end of the last seven days
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 6); // Go back 6 days from today to get the start of the 7-day range
      startDate.setHours(0, 0, 0, 0); // Set time to the start of the day
  
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999); // Set time to the end of the current day
  
      // Find absences within the last seven days
      const absences = await Absence.find({
        date: { $gte: startDate, $lte: endDate }
      })
      .populate({
        path: 'timetable_id',
        populate: {
          path: 'class_id',
          model: 'Class'
        }
      });
  
      // Aggregate absences per major
      const absencesPerMajor = absences.reduce((acc, absence) => {
        const major = absence.timetable_id.class_id.Major;
        if (!acc[major]) {
          acc[major] = 0;
        }
        acc[major]++;
        return acc;
      }, {});
  
      // Ensure all majors are represented in the result, even if they have zero absences
      const majors = ['MPI', 'GL', 'RT', 'IIA', 'IMI', 'Master', 'Doctorat'];
      const absencesData = majors.map((major, index) => {
        return {
          country: major,
          'hot dog': absencesPerMajor[major] || 0,
          'hot dogColor': `hsl(${index * 40}, 70%, 50%)`
        };
      });
  
      res.json(absencesData);
    } catch (error) {
      console.error('Error calculating absences per major:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


const getCurrentWeekDates = () => {
    const currentDate = new Date();
    const firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    const lastDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
    
    // Set time to start and end of the day for accurate range querying
    firstDayOfWeek.setHours(0, 0, 0, 0);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    
    return { firstDayOfWeek, lastDayOfWeek };
  };
  export const calculateAbsencesPerYear = expressAsyncHandler(async (req, res) => {
    try {

      
        // Calculate the start and end of the current week
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
    
        // Find absences within the current week
        const absences = await Absence.find({
          date: { $gte: startOfWeek, $lte: endOfWeek }
        })
        .populate({
          path: 'timetable_id',
          populate: {
            path: 'class_id',
            model: 'Class'
          }
        });
    
        // Aggregate absences per year
        const absencesPerYear = absences.reduce((acc, absence) => {
          const year = absence.timetable_id.class_id.Year;
          if (!acc[year]) {
            acc[year] = 0;
          }
          acc[year]++;
          return acc;
        }, {});
    
        // Ensure all years are represented in the result, even if they have zero absences
        const years = [1, 2, 3, 4, 5, 6]; // Adjust this array according to your school's year system
        const absencesData = years.map((year, index) => {
            return {
              country: `Year ${year}`,
              'absences': absencesPerYear[year] || 0,
              'totalStudents': 0 // This will be updated later
            };
        });

        // Fetch total students per year
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

        // Update absencesData with total students
        absencesData.forEach(absence => {
            const yearData = totalStudentsPerYear.find(data => data.year === parseInt(absence.country.split(' ')[1]));
            if (yearData) {
                absence.totalStudents = yearData.totalStudents;
            }
        });


        res.json(absencesData);
    } catch (error) {
        console.error('Error calculating absences and total students per year:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export const calculateAverageAbsences = expressAsyncHandler(async (req, res) => {
try {
  const absenceCount = await Absence.countDocuments({});
  const attendanceCount = await Attendance.countDocuments({});

  const total = attendanceCount + absenceCount;
  const averageAbsencesPercentage = (absenceCount / total) * 100;

  res.json({ 
      totalAbsences: absenceCount, 
      totalAttendances: attendanceCount, 
      averageAbsencesPercentage: averageAbsencesPercentage.toFixed(2) 
  });
} catch (error) {
  res.status(500).json({ error: 'An error occurred while calculating average absences' });
}
});
