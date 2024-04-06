import mongoose from "mongoose";

const SubjectSchema = mongoose.Schema({
    SubjectName: {
        type: String,
        required: [true, "Please add subject name"]
    },
    Module: {
        type: String,
        required: [true, "Please add module"]
    },
    Coeff: {
        type: String,
        required: [true, "Please add coefficient"]
    }
});

export default mongoose.model("Subject", SubjectSchema,'Subject');
