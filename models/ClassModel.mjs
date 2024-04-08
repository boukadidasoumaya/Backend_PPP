// give me a class model with the following fields:
// - Class_id:generated automatically by the system
// - Major : String , required , unique enumerate   (MPI,GL,RT,IIA,IMI,MASTER,DOCTORAT)
// - Level : String , required , unique enumerate   (1,2,3,4,5)
// - Group : String , required , unique enumerate   (1,2,3,4)

import mongoose from 'mongoose';

// Define schema
const ClassSchema = new mongoose.Schema({
  Major: {
    type: String,
    required: [true, 'Major is required'],
    unique: true,
    enum: ['MPI', 'GL', 'RT', 'IIA', 'IMI', 'MASTER', 'DOCTORAT']
  },
  Level: {
    type: String,
    required: [true, 'Level is required'],
    unique: true,
    enum: ['1', '2', '3', '4', '5']
  },
  Group: {
    type: String,
    required: [true, 'Group is required'],
    unique: true,
    enum: ['1', '2', '3', '4']
  }
});

// Compile the schema into a model
const ClassModel = mongoose.model('Class', ClassSchema, 'Class');

export default ClassModel;

