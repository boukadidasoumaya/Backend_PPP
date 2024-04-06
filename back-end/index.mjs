import express  from "express";
import dotenv from "dotenv";
import connectDb from "./configs/dbConnection.mjs";
dotenv.config();
const app =express();
connectDb();

app.listen(process.env.PORT , ()=>{
    console.log("Server is running")
})
