
import mongoose from 'mongoose';

// Define schema
const ClassSchema = new mongoose.Schema({
  Major: {
    type: String,
    required: [true, 'Major is required'],
    unique: true,
   
  },
  Year: {
    type: Number,
    required: [true, 'Level is required'],
    unique: true,

  },
  Group: {
    type: Number,
    required: [true, 'Group is required'],
    unique: true,

  }
});

// Compile the schema into a model
const ClassModel = mongoose.model('Class', ClassSchema, 'Class');

export default ClassModel;

