import fs from "fs";
import papaparse from "papaparse";
import multer from "multer";
import path from "path";
import joi from "joi";
import mongoose from "mongoose"; // Assuming you're using Mongoose
import Class from "../models/ClassModel.mjs"; // Import the Class model
import Student from "../models/StudentModel.mjs"; // Import the Student model

const CSV_PATH = path.join("/uploads/csv");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix);
  },
});

// Initialize multer for CSV upload
const uploadedCSV = multer({ storage: storage }).single("csv");

// Extend Joi with unique validation
joi.extend((joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.unique": "{{#label}} must be unique",
  },
  validate(value, helpers) {
    return new Promise(async (resolve, reject) => {
      try {
        const count = await mongoose
          .model("Student")
          .countDocuments({ [helpers.schema.path]: value });
        if (count > 0) {
          return reject(helpers.error("string.unique", { value }));
        }
        resolve(value);
      } catch (error) {
        reject(error);
      }
    });
  },
}));

// Define the validation schema using Joi
const studentSchema = joi.object({
  Student_id: joi.string().required(),
  FirstName: joi.string().required(),
  LastName: joi.string().required(),
  Email: joi.string().email().required(),
  CIN: joi
    .string()
    .length(8)
    .pattern(/^[0-9]+$/)
    .required(), // Ensure CIN is 8 digits
  Birthday: joi.date().required(),
  Major: joi
    .string()
    .valid(
      "MPI",
      "RT",
      "GL",
      "IIA",
      "IMI",
      "BIO",
      "CBA",
      "CH",
      "MASTER",
      "DOCTORAT"
    )
    .required(), // Ensure Major is one of the specified values
  Year: joi.number().integer().min(1).max(5).required(), // Ensure Year is between 1 and 5
  Group: joi.number().integer().min(1).max(4).required(), // Ensure Group is between 1 and 4
});

// Additional validation for unique email
const validateEmailUnique = async (value, helpers) => {
  try {
    const existingEmail = await Student.findOne({ Email: value });
    if (existingEmail) {
      console.error("Email must be unique");
    }
    return value;
  } catch (error) {
    console.error(error.message);
  }
};

// Add email validation to the schema
studentSchema.validateEmailUnique = () =>
  joi.string().email().required().custom(validateEmailUnique);

const validateCINUnique = async (value, helpers) => {
  try {
    // Check if the CIN consists of 8 digits
    if (!/^\d{8}$/.test(value)) {
      throw new Error("CIN must be composed of 8 digits");
    }

    const existingCIN = await Student.findOne({ CIN: value });
    if (existingCIN) {
      console.error("CIN must be unique");
    }
    return value;
  } catch (error) {
    console.error(error.message);
  }
};

// Add CIN validation to the schema
studentSchema.validateCINUnique = () =>
  joi.string().required().custom(validateCINUnique);

const validateIDUnique = async (value, helpers) => {
  try {
    // Check if the ID consists of 7 digits
    if (!/^\d{7}$/.test(value)) {
      throw new Error("ID must be composed of 7 digits");
    }

    const existingID = await Student.findOne({ Student_id: value });
    if (existingID) {
      console.error("ID must be unique");
    }
    return value;
  } catch (error) {
    console.error(error.message);
  }
};
studentSchema.validateIDUnique = () =>
  joi.string().required().custom(validateIDUnique);

// Usage:
const studentValidationSchema = studentSchema.keys({
  CIN: studentSchema.validateCINUnique(),
  Email: studentSchema.validateEmailUnique(),
  Student_id: studentSchema.validateIDUnique(),
});

export const createStudentsByCSV = async (req, res) => {
  uploadedCSV(req, res, async (err) => {
    try {
      let ok = true;
      const problematicLines = [];
      const validationErrors = [];
      
      // Parsing CSV using papaparse
      const CSVFileUP = req.file.path;
      const csvData = fs.readFileSync(CSVFileUP, "utf8");
      const parsedData = papaparse.parse(csvData, { header: true });

      // Check if the file is of CSV type
      if (!(req.file && req.file.mimetype === "text/csv")) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid file type" });
      }

      // Loop through each student data
      for (let i = 0; i < parsedData.data.length; i++) {
        const studentData = parsedData.data[i];
        try {
          // Validate student data using Joi
          const { error } = await studentValidationSchema.validateAsync(
            studentData
          );
          if (error) {
            // Collect all validation error messages
            const errorMessage = error.details.map((detail) => detail.message);
            validationErrors.push(`Ligne ${i + 1}: ${errorMessage.join(", ")}`);
            problematicLines.push(i + 1);
            ok = false;
            continue; // Skip to next student if validation fails
          }

          // Check for unique Email and CIN in the database before creating the student
          const existingEmail = await Student.findOne({
            Email: studentData.Email,
          });
          if(existingEmail){
            validationErrors.push(`Ligne ${i + 1}: Email '${studentData.Email}' existe déjà`);}

          const existingCIN = await Student.findOne({ CIN: studentData.CIN });
          if (existingCIN) {
            validationErrors.push(`Ligne ${i + 1}: CIN '${studentData.CIN }' existe déjà`);
          }
          const existingID =  await Student.findOne({ Student_id: studentData.Student_id });
          if (existingID) {
            validationErrors.push(`Ligne ${i + 1}: ID '${studentData.Student_id}' existe déjà`);
          }
          let formatCIN = true;
          if (!/^\d{8}$/.test(studentData.CIN)) {
            formatCIN = false;
          }
          let formatID = true;
          if (!/^\d{7}$/.test(studentData.Student_id)) {
            formatID =false;
          }

          if (existingEmail || existingCIN || !formatCIN || !formatID || existingID) {
            problematicLines.push(i + 1);
            ok = false;
            continue;
          }
        } catch (error) {
          console.error("Error validating student data:", error);
          return res.status(500).json({ success: false, error: error.message });
        }
      }

      // If there are validation errors, return them along with problematic lines
      if (!ok) {
        return res.status(400).json({
          success: false,
          error: "Invalid student data",
          problematicLines: problematicLines,
          validationErrors: validationErrors,
        });
      }

      // If no errors, insert the students into the database
      for (const studentData of parsedData.data) {
        // Insert logic to create students
      }

      // Return success response if all students are created successfully
      return res.status(201).json({
        success: true,
        message: "Students created successfully",
      });
    } catch (err) {
      console.error("Error processing CSV file:", err);
      return res
        .status(500)
        .json({ success: false, error: "Error processing CSV file" });
    }
  });
};

