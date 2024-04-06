import express  from "express";
import dotenv from "dotenv";
import connectDb from "./configs/dbConnection.mjs";
import subjectRouter from "./routes/SubjectRouter.mjs";
dotenv.config();
const app =express();
app.use('/api/subjects', subjectRouter);

connectDb();

app.listen(process.env.PORT , ()=>{
    console.log("Server is running")
})
