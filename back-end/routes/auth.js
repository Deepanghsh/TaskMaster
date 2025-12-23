import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

dotenv.config();
const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        errorCode: "USER_EXISTS",
        msg: "This email is already registered. Please log in."
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile: '',
      dob: '',
      gender: ''
    });

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          mobile: user.mobile || '',
          dob: user.dob || '',
          gender: user.gender || ''
        }
      });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        errorCode: "USER_NOT_FOUND",
        msg: "This email is not registered. Please sign up."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        errorCode: "INVALID_PASSWORD",
        msg: "Incorrect password. Please try again."
      });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          mobile: user.mobile || '',
          dob: user.dob || '',
          gender: user.gender || ''
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/auth/user
// @desc    Get logged in user
// @access  Private
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  const { name, email, mobile, dob, gender } = req.body;

  console.log("📝 Profile update request received");
  console.log("User ID:", req.user.id);
  console.log("Request body:", req.body);

  try {
    const user = await User.findById(req.user.id);
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        console.log("❌ Email already in use");
        return res.status(400).json({ msg: "Email already in use" });
      }
    }

    // Update fields - IMPORTANT: Handle empty strings properly
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (mobile !== undefined) user.mobile = mobile;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;

    await user.save();
    console.log("✅ User saved successfully");
    console.log("Updated user:", {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      dob: user.dob,
      gender: user.gender
    });

    const responseData = {
      msg: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        gender: user.gender,
      },
    };

    console.log("📤 Sending response:", responseData);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// @route   DELETE /api/auth/account
// @desc    Delete user account
// @access  Private
router.delete("/account", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: "Account deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/auth/export-data
// @desc    Export user data
// @access  Private
router.get("/export-data", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile || "",
        dob: user.dob || "",
        gender: user.gender || "",
      },
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    res.json(exportData);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Failed to export data" });
  }
});

// @route   POST /api/auth/import-data
// @desc    Import user data
// @access  Private
router.post("/import-data", auth, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !data.version) {
      return res.status(400).json({ msg: "Invalid backup file" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update user data from import
    if (data.user) {
      if (data.user.mobile !== undefined) user.mobile = data.user.mobile;
      if (data.user.dob !== undefined) user.dob = data.user.dob;
      if (data.user.gender !== undefined) user.gender = data.user.gender;

      await user.save();
    }

    res.json({
      msg: "Data imported successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Failed to import data" });
  }
});

export default router;