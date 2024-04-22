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

app.use("/api/subjects", subjectRouter);
app.use("/api/admin", AdminRouter);
app.use("/students", StudentRouter);
app.use("/classes", ClassRouter);
app.use("/teachers", TeacherRouter);
app.use("/timetables", TimeTableRouter);

connectDb();
app.listen(process.env.PORT , ()=>{
   console.log("Server is running")});