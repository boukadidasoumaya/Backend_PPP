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
      return res
        .status(400)
        .json({ success: false, error: "Type de fichier invalide" });
    }

    const timeTableEntries = [];

    // Boucle à travers chaque entrée d'emploi du temps
    for (const entry of parsedData.data) {
      try {
        // Cherchez le subject_id dans la table des matières en fonction du SubjectName
        const subject = await Subject.findOne({ SubjectName: entry.SubjectName });
        if (!subject) {
          throw new Error(`Le sujet '${entry.SubjectName}' n'existe pas`);
        }

        // Cherchez le teacher_id dans la table des enseignants en fonction du Teacher_id
        const teacher = await Teacher.findOne({ Teacher_id: entry.Teacher_id });
      
       
        if (!teacher) {
          throw new Error(`L'enseignant avec l'ID '${entry.Teacher_id}' n'existe pas`);
        }

        // Cherchez le class_id dans la table des classes en fonction de Major, Year et Group
        const classObj = await Class.findOne({ Major: entry.Major, Year: entry.Year, Group: entry.Group });
        if (!classObj) {
          throw new Error(`La classe avec Major '${entry.Major}', Année '${entry.Year}' et Groupe '${entry.Group}' n'existe pas`);
        }

        // Créez une nouvelle entrée d'emploi du temps
        const newEntry = {
          Day: entry.Day,
          StartTime: entry.StartTime,
          EndTime: entry.EndTime,
          Type: entry.Type,
          subject_id: subject._id,
          teacher_id: teacher._id,
          class_id: classObj._id,
          Room: entry.Room,
          Semester: entry.Semester,
        };

        // Ajoutez l'entrée à la liste des entrées d'emploi du temps
        timeTableEntries.push(newEntry);
      } catch (error) {
        console.error("Erreur lors de la création de l'entrée d'emploi du temps:", error);
        return res.status(500).json({ success: false, error: "Erreur lors de la création de l'entrée d'emploi du temps" });
      }
    }

    // Insérez les entrées d'emploi du temps dans la base de données
    await TimeTable.insertMany(timeTableEntries);

    return res.status(201).json({ success: true, message: "Emplois du temps importés avec succès" });
  } catch (error) {
    console.error("Erreur lors du traitement du fichier CSV:", error);
    return res.status(500).json({ success: false, error: "Erreur lors du traitement du fichier CSV" });
  }
};
