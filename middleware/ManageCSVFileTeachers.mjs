import fs from "fs";
import papaparse from "papaparse";
import multer from "multer";
import path from "path";
import joi from "joi";
import mongoose from "mongoose"; // Assumant que vous utilisez Mongoose
import Teacher from "../models/TeacherModel.mjs"; // Importez le modèle Teacher

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

// Initialisez multer pour le téléchargement de fichiers CSV
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
// Définissez le schéma de validation à l'aide de Joi
const teacherSchema = joi.object({
Teacher_id: joi.string().required(),
  FirstName: joi.string().required(),
  LastName: joi.string().required(),
  Email: joi.string().email().required(),
  CIN: joi
    .string()
    .length(8)
    .pattern(/^[0-9]+$/)
    .required(), // Assurez-vous que le CIN comporte 8 chiffres
  Department: joi.string().required(),
});

// Validation supplémentaire pour l'e-mail unique
const validateEmailUnique = async (value, helpers) => {
  try {
    const existingEmail = await Teacher.findOne({ Email: value });
    if (existingEmail) {
        console.error("Email must be unique");
    }
    return value;
  } catch (error) {
    console.error(error.message);
  }
};

// Ajoutez la validation de l'e-mail au schéma
teacherSchema.validateEmailUnique = () =>
  joi.string().email().required().custom(validateEmailUnique);

const validateCINUnique = async (value, helpers) => {
  try {
    // Vérifiez si le CIN est composé de 8 chiffres
    if (!/^\d{8}$/.test(value)) {
      console.log("CIN must be composed of 8 digits");
    }

    const existingCIN = await Teacher.findOne({ CIN: value });
    if (existingCIN) {
        console.error("CIN must be unique");
    }
    return value;
  } catch (error) {
    console.error(error.message);
  }
};

// Ajoutez la validation du CIN au schéma
teacherSchema.validateCINUnique = () =>
  joi.string().required().custom(validateCINUnique);

// Usage :
const teacherValidationSchema = teacherSchema.keys({
  CIN: teacherSchema.validateCINUnique(),
  Email: teacherSchema.validateEmailUnique(),
});

export const createTeachersByCSV = async (req, res) => {
    uploadedCSV(req, res, async (err) => {
      try {
        let ok = true;
        const problematicLines = []; // Tableau pour stocker les numéros de ligne avec des problèmes
        // Parsage du CSV à l'aide de papaparse
        const CSVFileUP = req.file.path;
        const csvData = fs.readFileSync(CSVFileUP, "utf8");
        const parsedData = papaparse.parse(csvData, { header: true });
  
        // Vérifiez si le fichier est de type CSV
        if (!(req.file && req.file.mimetype === "text/csv")) {
          return res
            .status(400)
            .json({ success: false, error: "Invalid file type" });
        }
  
        // Bouclez à travers chaque donnée d'enseignant
        for (let i = 0; i < parsedData.data.length; i++) {
          const teacherData = parsedData.data[i];
          try {
            // Validez les données de l'enseignant en utilisant Joi
            const { error } = await teacherValidationSchema.validateAsync(
              teacherData
            );
            if (error) {
              const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");
              problematicLines.push(i + 1); // Ajoutez le numéro de ligne avec des problèmes au tableau
              continue;
            }
  
            // Vérifiez l'unicité de l'e-mail et du CIN dans la base de données avant de créer l'enseignant
            const existingEmail = await Teacher.findOne({
              Email: teacherData.Email,
            });
            const existingCIN = await Teacher.findOne({ CIN: teacherData.CIN });
            let formatCIN = true;
            if (!/^\d{8}$/.test(teacherData.CIN)) {
              formatCIN = false;
            }
            if (existingEmail || existingCIN || !formatCIN) {
              // Gérez l'e-mail ou le CIN non unique
              ok = false;
              problematicLines.push(i + 1); // Ajoutez le numéro de ligne avec des problèmes au tableau
            
            }
          } catch (error) {
            console.error("Error validating teacher data:", error);
            return res.status(500).json({
              success: false,
              error: "Error validating teacher data",
            });
          }
        }
  
        // Si aucune erreur, insérez les enseignants dans la base de données
        if (ok) {
          for (const teacherData of parsedData.data) {
            try {
              // Créez le document de l'enseignant
              const teacher = await Teacher.create(teacherData);
            } catch (error) {
              console.error("Error inserting teacher into database:", error);
              return res.status(500).json({
                success: false,
                error: "Error inserting teacher into database",
              });
            }
          }
          return res.status(201).json({
            success: true,
            message: "Teachers created successfully",
          });
        } else {
          return res.status(500).json({
            success: false,
            error: "Error inserting teacher into database. Check for uniqueness.",
            problematicLines: problematicLines // Retournez les numéros de ligne avec des problèmes
          });
        }
      } catch (err) {
        console.error("Error processing CSV file:", err);
        return res
          .status(500)
          .json({ success: false, error: "Error processing CSV file" });
      }
    });
  };
  