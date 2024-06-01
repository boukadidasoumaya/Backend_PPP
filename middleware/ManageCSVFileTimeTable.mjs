import fs from "fs";
import papaparse from "papaparse";
import TimeTable from "../models/TimeTableModel.mjs"; // Importez le modèle TimeTable
import Subject from "../models/SubjectModel.mjs"; // Importez le modèle Subject
import Teacher from "../models/TeacherModel.mjs"; // Importez le modèle Teacher
import Class from "../models/ClassModel.mjs"; // Importez le modèle Class

export const importTimeTableFromCSV = async (req, res) => {
  try {
    // Parsing CSV using papaparse
    const CSVFile = req.file.path;
    const csvData = fs.readFileSync(CSVFile, "utf8");
    const parsedData = papaparse.parse(csvData, { header: true });

    // Vérifiez si le fichier est de type CSV
    if (!(req.file && req.file.mimetype === "text/csv")) {
      return res.status(400).json({ success: false, error: "Type de fichier invalide" });
    }

    const timeTableEntries = [];
    const problematicLines = []; // Tableau pour stocker les numéros de ligne avec des problèmes
    const nonExistingEntities = []; // Tableau pour stocker les informations sur les entités non existantes

    // Boucle à travers chaque entrée d'emploi du temps
    for (let i = 0; i < parsedData.data.length; i++) {
      const entry = parsedData.data[i];
      try {
        // Cherchez le subject_id dans la table des matières en fonction du SubjectName
        const subject = await Subject.findOne({ SubjectName: entry.SubjectName });
        if (!subject) {
          nonExistingEntities.push(`Ligne ${i + 1}: Le sujet '${entry.SubjectName}' n'existe pas`);
        }

        // Cherchez le teacher_id dans la table des enseignants en fonction du Teacher_id
        const teacher = await Teacher.findOne({ Teacher_id: entry.teacher_id });
        if (!teacher) {
          nonExistingEntities.push(`Ligne ${i + 1}: L'enseignant avec l'ID '${entry.teacher_id}' n'existe pas`);
        }

        // Cherchez le class_id dans la table des classes en fonction de Major, Year et Group
        const classObj = await Class.findOne({ Major: entry.Major, Year: entry.Year, Group: entry.Group });
        if (!classObj) {
          nonExistingEntities.push(`Ligne ${i + 1}: La classe avec Major '${entry.Major}', Année '${entry.Year}' et Groupe '${entry.Group}' n'existe pas`);
        }

        // Créez une nouvelle entrée d'emploi du temps
        const newEntry = {
          Day: entry.Day,
          StartTime: entry.StartTime,
          EndTime: entry.EndTime,
          Type: entry.Type,
          subject_id: subject ? subject._id : null, // Stockez null si le sujet n'existe pas
          teacher_id: teacher ? teacher._id : null, // Stockez null si l'enseignant n'existe pas
          class_id: classObj ? classObj._id : null, // Stockez null si la classe n'existe pas
          Room: entry.Room,
          Semester: entry.Semester,
        };

        // Ajoutez l'entrée à la liste des entrées d'emploi du temps
        timeTableEntries.push(newEntry);
      } catch (error) {
        console.error("Erreur lors de la création de l'entrée d'emploi du temps:", error);
        problematicLines.push(i + 1); // Ajoutez le numéro de ligne avec des problèmes au tableau
      }
    }

    // Insérez les entrées d'emploi du temps dans la base de données
    if (nonExistingEntities.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Certaines entités n'existent pas",
        problematicLines: problematicLines,
        nonExistingEntities: nonExistingEntities,
      });
    }
    else await TimeTable.insertMany(timeTableEntries);


    return res.status(201).json({ success: true, message: "Emplois du temps importés avec succès" });
  } catch (error) {
    console.error("Erreur lors du traitement du fichier CSV:", error);
    return res.status(500).json({ success: false, error: "Erreur lors du traitement du fichier CSV" });
  }
};
