import jwt from 'jsonwebtoken'; // Importing the jsonwebtoken package
import bcrypt from 'bcrypt'; // Importing the bcrypt package
import Admin   from '../models/AdminModel.mjs'; // Importing the Admin model
import expressAsyncHandler from 'express-async-handler';
// Function to handle user login
export const login = expressAsyncHandler(async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find the user by username
    const admin = await Admin.findOne({ username });
    console.log({username,password});
    console.log(admin);
    if (!admin) {

      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
export const register=expressAsyncHandler(async (req, res) => {
    try {
      // Extract data from request body
      const { username, password, cin, mail, num } = req.body;
  
      // Check if the username or email already exists in the database
      const existingAdmin = await Admin.findOne({ $or: [{ username }, { mail }, { num }] });
      console.log(existingAdmin);
      if (existingAdmin) {
        return res.status(400).json({ error: 'Username, email, or num already exists' });
      }
        // Create a new user
        const admin =await Admin.create(req.body);
        console.log(admin);

      // Create JWT token for the newly registered user
      const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Respond with success and JWT token
      res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  export const deleteAdmin =expressAsyncHandler( async (req, res) => {
    try {
      // Extract user ID from request parameters
      const adminId = req.params.id;
  
      // Check if the user exists
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ error: 'admin not found' });
      }
  
      // Perform any additional authorization checks if needed
      // For example, you might want to check if the current admin has permission to delete this admin
  
      // Delete the admin from the database
      await admin.findByIdAndDelete(adminId);
  
      res.json({ message: 'admin deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

export const updateAdmin =expressAsyncHandler( async (req, res) => {
  try {
    const adminId = req.params.id;
    const { username, password, cin, mail, num } = req.body;

    // Find the admin by ID
    let admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Update admin fields if provided in the request body
    if (username) admin.username = username;
    if (password) admin.password = password;
    if (cin) admin.cin = cin;
    if (mail) admin.mail = mail;
    if (num) admin.num = num;

    // Save the updated admin
    await admin.save();

    res.json({ message: 'Admin updated successfully', admin });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  
