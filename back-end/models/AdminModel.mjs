// Importing necessary modules
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
// Define schema
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true // Assuming username should be unique
  },
  password: {
    type: String,
    required: true
  },
  cin: {
    type: String,
    required: true,
    unique: true // Assuming Cin should be unique
  },
  mail: {
    type: String,
    required: true,
    unique: true // Assuming email should be unique
  },
  num: {
    type: String,
    required: true,
    unique: true // Assuming num should be unique
  }
});

// Hash the password before saving
AdminSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

// Create model
export default mongoose.model('Admin', AdminSchema,'Admin');


