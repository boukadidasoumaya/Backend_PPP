import mongoose from "mongoose";
import multer from 'multer';
import path from 'path';

const CSV_PATH = path.join('/uploads/csv');

const StudentFileSchema = mongoose.Schema({
    FirstName: {
        type: String,
        required: [true, "Please add first name"]
    },
    LastName: {
        type: String,
        required: [true, "Please add last name"]
    },
    Email: {
        type: String,
        required: [true, "Please add email"],
        unique: true
    },
    CIN: {
        type: String,
        required: [true, "Please add CIN"],
        unique: true
    },
    Birthday: {
        type: Date,
        required: [true, "Please add birthday"]
    },
    Major: {
        type: String,
        required: [true, "Please add major"]
    },
    Year: {
        type: String,
        required: [true, "Please add year"]
    },
    Group: {
        type: String,
        required: [true, "Please add group"]
    }
});


//multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../uploads');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix)
    }
  });
  
  //static functions
  uploadedCSV = multer({storage: storage, limits:{fileSize: 1 * 1024 * 1024}}).single('csv');
  csvPath = CSV_PATH;

const CSVFile = mongoose.model('CSVFile', StudentFileSchema);
export default CSVFile;

