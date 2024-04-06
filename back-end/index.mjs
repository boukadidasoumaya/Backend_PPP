import express  from "express";
import dotenv from "dotenv";
import connectDb from "./configs/dbConnection.mjs";
import subjectRouter from "./routes/SubjectRouter.mjs";
dotenv.config();
app.use('/api/subjects', subjectRouter);
const app =express();
connectDb();

app.listen(process.env.PORT , ()=>{
    console.log("Server is running")
})
