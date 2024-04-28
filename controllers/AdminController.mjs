import jwt from "jsonwebtoken"; // Importing the jsonwebtoken package
import bcrypt from "bcrypt"; // Importing the bcrypt package
import Admin from "../models/AdminModel.mjs"; // Importing the Admin model
import expressAsyncHandler from "express-async-handler";
import asyncHandler from "express-async-handler";
import Token from "../models/TokenModel.mjs";
import sendEmail from "./EmailSender.mjs";
// Function to handle user login

const hashPassword = async (password) => {
  const saltRounds = 10; // Number of salt rounds for bcrypt
  return await bcrypt.hash(password, saltRounds);
};

// GET all admins
export const getAllAdmins = asyncHandler(async (req, res) => {
  try {
    // Retrieve all admins from the database
    const admins = await Admin.find();

    // Hash the passwords for each admin
    const hashedAdmins = await Promise.all(
      admins.map(async (admin) => {
        const hashedPassword = await hashPassword(admin.password);
        return { ...admin.toObject(), password: hashedPassword };
      })
    );

    res.status(200).json({ success: true, data: hashedAdmins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET an admin by ID
export const getAdminById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Hash the password of the retrieved admin
    const hashedPassword = await hashPassword(admin.password);
    const hashedAdmin = { ...admin.toObject(), password: hashedPassword };

    res.status(200).json({ success: true, data: hashedAdmin });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const resetverif = expressAsyncHandler(async (req, res) => {
  const { password, confirmpassword, userId, token } = req.body;
  console.log(userId);
  try {
    // Find the password reset token
    let passwordResetToken = await Token.findOne({ userId });

    // If token does not exist or is expired
    if (!passwordResetToken) {
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token" });
    }

    // Compare the provided token with the stored token
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token" });
    }

    // Find the admin by userId
    const admin = await Admin.findOne({ _id: userId });

    // If password is provided, update admin's password
    if (password) {
      admin.password = password;
    }

    // Save the updated admin
    await admin.save();
    // Delete the password reset token
    await passwordResetToken.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
export const login = expressAsyncHandler(async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find the user by username
    const admin = await Admin.findOne({ username });
    console.log({ username, password });
    console.log(admin);
    if (!admin) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export const register = expressAsyncHandler(async (req, res) => {
  try {
    // Extract data from request body
    const { username, password, cin, mail, num } = req.body;

    // Check if the username or email already exists in the database
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { mail }, { num }],
    });
    console.log(existingAdmin);
    if (existingAdmin) {
      return res
        .status(400)
        .json({ error: "Username, email, or num already exists" });
    }
    // Create a new user
    const admin = await Admin.create(req.body);
    console.log(admin);

    // Create JWT token for the newly registered user
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Respond with success and JWT token
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export const deleteAdmin = expressAsyncHandler(async (req, res) => {
  try {
    // Extract user ID from request parameters
    const adminId = req.params.id;

    // Check if the user exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "admin not found" });
    }

    // Perform any additional authorization checks if needed
    // For example, you might want to check if the current admin has permission to delete this admin

    // Delete the admin from the database
    await admin.findByIdAndDelete(adminId);

    res.json({ message: "admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export const resetPassword = expressAsyncHandler(async (req, res) => {
  try {
    const { cin } = req.body;
    const admin = await Admin.findOne({ cin });
    console.log(admin);
    const generateRandomToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, (byte) => byte.toString(16)).join("");
    };

    if (!admin) {
      throw new Error("admin does not exist");
    }
    const token = await Token.findOne({ userId: admin._id });
    if (token) {
      await Token.deleteOne();
    }
    const existingToken = await Token.findOne({ userId: admin._id });
    if (existingToken) {
      await existingToken.deleteOne();
    }

    // Generate a new reset token
    const resetToken = generateRandomToken();
    const hash = await bcrypt.hash(resetToken, 10);

    const token2 = await Token.create({
      userId: admin._id,
      token: hash,
      createdAt: Date.now(),
    });
    console.log(admin.mail);

    const link = `http://localhost:3000/forgot/passwordReset/verif?token=${resetToken}&id=${admin._id}`;
    sendEmail(admin.mail, "Password Reset Request", {
      name: admin.name,
      link: link,
    });
    res.status(200).json({
      success: true,
      message: "Password reset token generated and email sent successfully",
      resetToken,
      admin: {
        _id: admin._id,
        name: admin.name,
        mail: admin.mail,
        // Add other admin properties as needed
      },
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export const updateAdmin = expressAsyncHandler(async (req, res) => {
  try {
    const adminId = req.params.id;
    const { username, password, cin, mail, num } = req.body;

    // Find the admin by ID
    let admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Update admin fields if provided in the request body
    if (username) admin.username = username;
    if (password) admin.password = password;
    if (cin) admin.cin = cin;
    if (mail) admin.mail = mail;
    if (num) admin.num = num;

    // Save the updated admin
    await admin.save();

    res.json({ message: "Admin updated successfully", admin });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
