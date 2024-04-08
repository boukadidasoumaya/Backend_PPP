import express  from "express";
import dotenv from "dotenv";
import connectDb from "./configs/dbConnection.mjs";
import subjectRouter from "./routes/SubjectRouter.mjs";
import AdminRouter from "./routes/AdminRouter.mjs";
import StudentRouter from "./routes/StudentRouter.mjs";
import ClassRouter from "./routes/ClassRouter.mjs";
import TeacherRouter from "./routes/TeacherRouter.mjs";

dotenv.config();
const app =express();
app.use(express.json());
app.use('/api/subjects', subjectRouter);
app.use('/api/admin', AdminRouter);
app.use('/students', StudentRouter);
app.use('/classes', ClassRouter);
app.use('/teachers', TeacherRouter);


connectDb();

// app.listen(process.env.PORT , ()=>{
//     console.log("Server is running")
// })
app.listen(5000, () => {
    console.log('Server started!');
});