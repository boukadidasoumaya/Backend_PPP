import express  from "express";
import dotenv from "dotenv";
import connectDb from "./configs/dbConnection.mjs";
import subjectRouter from "./routes/SubjectRouter.mjs";
import AdminRouter from "./routes/AdminRouter.mjs";
dotenv.config();
const app =express();
app.use(express.json());
app.use('/api/subjects', subjectRouter);
app.use('/api/admin', AdminRouter);

connectDb();

app.listen(process.env.PORT , ()=>{
    console.log("Server is running")
})
