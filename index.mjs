import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./configs/dbConnection.mjs";
import subjectRouter from "./routes/SubjectRouter.mjs";
import AdminRouter from "./routes/AdminRouter.mjs";
import StudentRouter from "./routes/StudentRouter.mjs";
import ClassRouter from "./routes/ClassRouter.mjs";
import TeacherRouter from "./routes/TeacherRouter.mjs";
import TimeTableRouter from "./routes/TimeTableRouter.mjs";
import AttendanceRouter  from "./routes/AttendanceRouter.mjs";
import validationToken from './middleware/ValidateToken.mjs';

dotenv.config();
const app = express();
app.use(express.json());

// Utiliser le middleware cors pour gérer les en-têtes CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


app.use("/api/subjects",validationToken, subjectRouter);
app.use("/api/admin", AdminRouter);
app.use("/students", validationToken,StudentRouter);
app.use("/classes",validationToken, ClassRouter);
app.use("/teachers", validationToken,TeacherRouter);
app.use("/timetables",validationToken, TimeTableRouter);
app.use("/api/attendance",validationToken, AttendanceRouter);

connectDb();
app.listen(process.env.PORT, () => {
  console.log("Server is running");
});
