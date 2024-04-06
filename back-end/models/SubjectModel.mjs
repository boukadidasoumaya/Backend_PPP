import mongoose from "mongoose";
const SubjectSchema= mongoose.Schema({
    Subject_id :{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Subject"
    },
    name:{
        type :String,
        required: [true, "Please add name "]
    }, 
    Module:{
        type:String,
        required: [true, "Please add module"],
    },
    Coef:{
        type: String,
        required:[true ,"Please add coef"]
    }
})
export default mongoose.model("Subject", SubjectSchema)