// give me teacher model with the following fields:
// - Teacher_id:generated automatically by the system
// - CIN : String , required , unique , match(/^[0-9]{8}$/)
// - FirstName : String , required , match(/^[a-zA-Z]+$/)
// - LastName : String , required , match(/^[a-zA-Z]+$/)
// - Email : String , required , match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
// - Department : String , required , unique enumerate (Génie Informatique et Mathématiques,Génie Physique et Instrumentation,Génie Biologique et Chimie, Sciences Sociales, Langues et Formation Générale)

// add error messages for each field
import mongoose from 'mongoose';


// function generateTeacherId() {
//     return Math.floor(2100000 + Math.random() * 2100000);
//   }
  

// Define schema
const TeacherSchema = new mongoose.Schema({
    Teacher_id: {
        type: String,
        unique: true,
        validate: {
            validator: function(v) {
            return /^\d{7}$/.test(v);
            },
        message: props => `${props.value} is not a valid Student ID! It should be exactly 7 digits.`
    }
      },
    CIN: {
        type: String,
        required: [true, 'CIN is required'],
        unique: true,
        match: [/^[0-9]{8}$/, 'CIN must be an 8-digit number']
    },
    FirstName: {
        type: String,
        required: [true, 'First Name is required'],
        match: [/^[a-zA-Z \ ]+$/, 'First Name must contain only letters']
    },
    LastName: {
        type: String,
        required: [true, 'Last Name is required'],
        match: [/^[a-zA-Z \ ]+$/, 'Last Name must contain only letters']
    },
    Email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format']
    },
    Department: {
        type: String,
        required: [true, 'Department is required'],
        unique: true,
       // enum: ['Génie Informatique et Mathématiques', 'Génie Physique et Instrumentation', 'Génie Biologique et Chimie', 'Sciences Sociales', 'Langues et Formation Générale']
    }
    });

// Compile the schema into a model
const Teacher = mongoose.model("Teacher", TeacherSchema, "Teacher");

export default Teacher;
