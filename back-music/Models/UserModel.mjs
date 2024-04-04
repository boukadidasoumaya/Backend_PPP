import mongoose from "mongoose";
const userSchema= mongoose.Schema({
    user_id :{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    name:{
        type :String,
        required: [true, "Please add name "]
    }, 
    email:{
        type:String,
        required: [true, "Please add email"],
        unique:[true, "Email already exists"]
    },
    password:{
        type: String,
        required:[true ,"Please add password"]
    }
},{
    timestamps:true
})
export default mongoose.model("User", userSchema)