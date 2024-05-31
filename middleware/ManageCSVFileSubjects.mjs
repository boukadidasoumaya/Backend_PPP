import fs from "fs";
import papaparse from "papaparse";
import Subject from "../models/SubjectModel.mjs";
import expressAsyncHandler from "express-async-handler";

// Function to trim whitespace from keys and values in an object
const trimObject = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key.trim()] = typeof obj[key] === "string" ? obj[key].trim() : obj[key];
    return acc;
  }, {});
};

export const importSubjectsFromCSV = expressAsyncHandler(async (req, res) => {
  try {
    // Ensure a file is uploaded and it is of type CSV
    if (!(req.file && req.file.mimetype === "text/csv")) {
      return res
        .status(400)
        .json({ success: false, error: "Type de fichier invalide" });
    }

    // Read the CSV file
    const CSVFile = req.file.path;
    const csvData = fs.readFileSync(CSVFile, "utf8");

    // Parse the CSV data
    const parsedData = papaparse.parse(csvData, { header: true });
    if (parsedData.errors.length > 0) {
      console.error("CSV Parsing errors:", parsedData.errors);
      return res.status(400).json({
        success: false,
        error: "Erreur lors du parsing du fichier CSV",
        details: parsedData.errors,
      });
    }

    const subjectsEntries = [];
    const errors = [];
    let count = 0;
    // Process each entry in the CSV data
    for (const entry of parsedData.data) {
      try {
        // Trim whitespace from the entry
        const trimmedEntry = trimObject(entry);

        // Validate the presence of required fields
        if (
          !trimmedEntry.SubjectName ||
          !trimmedEntry.Module ||
          !trimmedEntry.Coeff
        ) {
          console.error(
            `Missing required fields in entry: ${JSON.stringify(trimmedEntry)}`
          );
        }

        // Check for redundancy
        const existingSubject = await Subject.findOne({
          SubjectName: trimmedEntry.SubjectName,
          Module: trimmedEntry.Module,
          Coeff: trimmedEntry.Coeff,
        });

        if (existingSubject) {
          count++;
          throw new Error(
            `Duplicate entry found: ${JSON.stringify(trimmedEntry)}`
          );
        } else {
          // Create a new subject entry
          const newEntry = {
            SubjectName: trimmedEntry.SubjectName,
            Module: trimmedEntry.Module,
            Coeff: trimmedEntry.Coeff,
          };

          // Add the entry to the list
          subjectsEntries.push(newEntry);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la création de l'entrée des matières:",
          error
        );
        errors.push(`Erreur: ${error}`);
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la création",
          error: error.message,
        });}
    }

    // Insert the entries into the database
    if (!count) {
      await Subject.insertMany(subjectsEntries);

      return res.status(201).json({
        success: true,
        message: "Matières importées avec succès",
        error: errors.length > 0 ? errors : null,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Subject Duplicated",
        error: errors.length > 0 ? errors : null,
      });
    }
  } catch (error) {
    console.error("Erreur lors du traitement du fichier CSV:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du traitement du fichier CSV",
      error: error.message,
    });
  }
});
