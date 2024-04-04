import express  from "express";
import  router  from "./routes/MusicRouter.mjs"
import  routerUser  from "./routes/UsersRouter.mjs"
import errorHandler from "./middleware/errorHandler.mjs";
import { connect } from "mongoose";
import dotenv from "dotenv";
import connectDb from "./configs/dbConnection.mjs";
dotenv.config();
const app =express();
const port = 5000;
connectDb();
app.use(express.json())
app.use('/api',router)
app.use('/api',routerUser)
app.use(errorHandler)

app.listen(port , ()=>{
})
