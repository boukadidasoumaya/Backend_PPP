// import Student from "../models/StudentModel.mjs";
// import Class from '../models/ClassModel.mjs'; // Import the Class model
// import asyncHandler from "express-async-handler";
// import { isCinExists, isEmailExists } from "../controllers/StudentController.mjs";

// import multer from "multer";
// import csv from "csv-parser";
// import fs from "fs";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.originalname + "-" + uniqueSuffix);
//   },
// });

// const upload = multer({ storage: storage });

// // Corrected export using async/await for clarity
// export const createStudentsByCSV = async (req, res) => {
//     try {
//       const filePath = req.file.path;
//       const studentsData = [];
  
//       // Vérification de l'existence du fichier
//       if (!fs.existsSync(filePath)) {
//         return res.status(400).json({ success: false, error: 'CSV file not found' });
//       }
  
//       // Lecture du fichier CSV
//       fs.createReadStream(filePath)
//         .pipe(csv())
//         .on('data', (data) => studentsData.push(data))
//         .on('end', async () => {
//           try {
//             // Vérification des champs nécessaires et des doublons
//             for (const student of studentsData) {
//               // Vérification des champs nécessaires
//               const requiredFields = ['Major', 'Year', 'Group', 'CIN', 'Email']; // Liste des champs requis
//               const missingFields = requiredFields.filter(field => !Object.keys(student).includes(field));
//               if (missingFields.length > 0) {
//                 return res.status(400).json({ success: false, error: `Missing fields: ${missingFields.join(', ')}` });
//               }
  
//               // Vérification des doublons de CIN et d'email
//               const isCinDuplicate = await isCinExists(student.CIN);
//               const isEmailDuplicate = await isEmailExists(student.Email);
//               if (isCinDuplicate && isEmailDuplicate) {
//                 return res.status(400).json({ success: false, errors: { cin: "CIN already exists", email: "Email Already exists" } });
//               }
//               if (isCinDuplicate) {
//                 return res.status(400).json({ success: false, errors: { cin: "CIN already exists" } });
//               }
//               if (isEmailDuplicate) {
//                 return res.status(400).json({ success: false, errors: { email: "Email already exists" } });
//               }
//             }
  
//             // Insertion des étudiants dans la base de données
//             for (const student of studentsData) {
//               const { Major, Year, Group, CIN, Email, ...studentData } = student;
  
//               // Vérifie si la classe existe déjà
//               let classObject;
//               const existingClass = await Class.findOne({ Major, Year, Group });
  
//               if (existingClass) {
//                 // Si la classe existe, utilisez-la
//                 classObject = existingClass;
//               } else {
//                 // Si la classe n'existe pas, créez-la
//                 classObject = await Class.create({ Major, Year, Group });
//               }
  
//               // Créer le document de l'étudiant et l'associer à la classe
//               const createdStudent = await Student.create({ ...studentData, CIN, Email, class_id: classObject._id });
  
//               // Mettre à jour le document de la classe pour inclure le nouvel ID d'étudiant
//               if (!classObject.students) {
//                 classObject.students = []; // Initialiser le tableau d'étudiants s'il n'est pas déjà présent
//               }
//               classObject.students.push(createdStudent._id);
//               await classObject.save();
//             }
  
//             // Suppression du fichier CSV temporaire
//             fs.unlinkSync(filePath);
  
//             res.status(201).json({ success: true, message: 'Students created successfully' });
//           } catch (error) {
//             console.error(error);
//             res.status(500).json({ success: false, error: 'Internal server error' });
//           }
//         });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, error: 'Internal server error' });
//     }
//   };

import multer from 'multer';
const upload = multer({ dest: 'uploads/' })


export const createStudentsByCSV = async (req, res) => {
    console.log(req.file)
}