import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Patient } from "../models/Patient";
import crypto from "crypto";


const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const JWT_EXPIRES_IN: jwt.SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN as any) || "1h";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const JWT_REFRESH_EXPIRES_IN: jwt.SignOptions["expiresIn"] = (process.env.JWT_REFRESH_EXPIRES_IN as any) || "7d";

const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { _id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { _id: user._id, type: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};


export const login = async (req: Request, res: Response) => {
  try {
    const { role, username, password } = req.body;

    if (!role || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "Role, username, and password are required.",
      });
    }

    console.log(`Login attempt: ${username} (${role})`);

    const user = await User.findOne({ username: username.toLowerCase(), role, isActive: true });

    if (!user) {
      console.log(`✗ User not found: ${username} (${role})`);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials.",
      });
    }

    const isMatch = await (user as any).comparePassword(password);

    if (!isMatch) {
      console.log(`✗ Invalid password for: ${username}`);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials.",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    console.log(`✓ Login successful: ${user.username} (${user.role})`);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          username: user.username,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
    });
  }
};


export const registerPatient = async (req: Request, res: Response) => {
  try {
    const { name, mobile, age, gender, abhaId, aadhaarId, authMethod } = req.body;

    console.log(`Patient registration attempt: ${name} (${mobile})`);

    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        error: "Name and mobile number are required.",
      });
    }

    if (mobile.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Invalid mobile number.",
      });
    }

    let patient = await Patient.findOne({ mobile });

    if (patient) {
      console.log(`✓ Patient already exists: ${patient.patientId} (${patient.name})`);
      return res.status(200).json({
        success: true,
        data: {
          patientId: patient.patientId,
          name: patient.name,
          mobile: patient.mobile,
          age: patient.age,
          gender: patient.gender,
          existing: true,
        },
      });
    }

    const patientId = `OPD-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    console.log(`✓ Creating new patient: ${patientId} (${name})`);

    patient = new Patient({
      patientId,
      name: name.trim(),
      mobile,
      age: age || 30,
      gender: gender || "other",
      abhaId: abhaId || undefined,
      aadhaarId: aadhaarId || undefined,
      authMethod: authMethod || "walkin",
      identifier: mobile,
      role: "patient",
      queueType: null,
      token: null,
      consent: {
        eye: false,
        tongue: false,
        voice: false,
        dataProcessing: true,
      },
      isActive: true,
      lastActivity: new Date(),
    });

    await patient.save();
    console.log(`✓ Patient saved to MongoDB: ${patient.patientId}`);

    return res.status(201).json({
      success: true,
      data: {
        patientId: patient.patientId,
        name: patient.name,
        mobile: patient.mobile,
        age: patient.age,
        gender: patient.gender,
        existing: false,
      },
    });
  } catch (error: any) {
    console.error("Patient registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Registration failed. Please try again.",
    });
  }
};


export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Refresh token required.",
      });
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;

    const user = await User.findById(decoded._id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Invalid refresh token.",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Refresh token expired. Please login again.",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Token refresh failed.",
    });
  }
};


export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        department: user.department,
        qualifications: user.qualifications,
      },
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get user info.",
    });
  }
};


export const logout = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Logout failed.",
    });
  }
};


export const debugUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select("-password");
    const patients = await Patient.find({}).limit(20);

    return res.status(200).json({
      success: true,
      data: {
        userCount: users.length,
        users: users.map(u => ({
          username: u.username,
          name: u.name,
          role: u.role,
          isActive: u.isActive,
          lastLogin: u.lastLogin,
        })),
        patientCount: await Patient.countDocuments(),
        recentPatients: patients.map(p => ({
          patientId: p.patientId,
          name: p.name,
          mobile: p.mobile,
          queueType: p.queueType,
          token: p.token,
        })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
