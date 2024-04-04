import mongoose from "mongoose";
const musicSchema= mongoose.Schema({
 name:{
    type :String,
    required: [true, "Please add name "]
 }, 
 link:{
    type:String,
    required: [true, "Please add link"]

 },
 singer:{
type: String,
required:[true ,"Please add author"]
 }
},{
    timestamps:true },



  
)
export default mongoose.model("Music", musicSchema)