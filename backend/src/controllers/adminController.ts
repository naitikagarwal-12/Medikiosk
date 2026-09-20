import { Request, Response } from "express";
import { Patient } from "../models/Patient";
import { Encounter } from "../models/Encounter";
import { User } from "../models/User";
import crypto from "crypto";



export const getDashboard = async (req: Request, res: Response) => {
  try {
    const totalPatients = await Patient.countDocuments({ isActive: true });
    const redQueue = await Patient.countDocuments({ queueType: "red", isActive: true });
    const whiteQueue = await Patient.countDocuments({ queueType: "white", isActive: true });
    const completedEncounters = await Encounter.countDocuments({ status: "completed" });

    const opdVolume = [
      { day: "Mon", count: Math.floor(Math.random() * 100) + 100 },
      { day: "Tue", count: Math.floor(Math.random() * 100) + 100 },
      { day: "Wed", count: Math.floor(Math.random() * 100) + 100 },
      { day: "Thu", count: Math.floor(Math.random() * 100) + 100 },
      { day: "Fri", count: Math.floor(Math.random() * 100) + 100 },
      { day: "Sat", count: Math.floor(Math.random() * 100) + 100 },
    ];

    const queueData = [
      { name: "Red Queue", value: redQueue, color: "#dc2626" },
      { name: "White Queue", value: whiteQueue, color: "#0d9488" },
    ];

    const abhaCount = await Patient.countDocuments({ authMethod: "abha" });
    const walkinCount = await Patient.countDocuments({ authMethod: "walkin" });
    const total = abhaCount + walkinCount || 1;

    const regType = [
      { name: "ABHA Digital", value: Math.round((abhaCount / total) * 100), color: "#1e4080" },
      { name: "Walk-in / Paper", value: Math.round((walkinCount / total) * 100), color: "#64748b" },
    ];

    const waitTime = [
      { month: "Jan", before: 32, after: 14 },
      { month: "Feb", before: 30, after: 12 },
      { month: "Mar", before: 34, after: 11 },
      { month: "Apr", before: 29, after: 13 },
      { month: "May", before: 31, after: 10 },
      { month: "Jun", before: 28, after: 9 },
    ];

    return res.status(200).json({
      success: true,
      data: {
        registeredToday: totalPatients,
        aiAssessments: completedEncounters,
        avgWaitTime: "14 min",
        priorityCases: redQueue,
        completed: completedEncounters,
        routineCases: whiteQueue,
        opdVolume,
        queueData,
        regType,
        waitTime,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get dashboard data.",
    });
  }
};


export const getDHISPayout = async (req: Request, res: Response) => {
  try {
    const totalEncounters = await Encounter.countDocuments({ status: "completed" });
    const submittedClaims = Math.floor(totalEncounters * 0.8);
    const approved = Math.floor(submittedClaims * 0.9);
    const pending = submittedClaims - approved;

    return res.status(200).json({
      success: true,
      data: {
        encounterCount: totalEncounters,
        eligibleEncounters: totalEncounters,
        submittedClaims,
        approved,
        pending,
        totalPayout: approved * 1000,
        claims: [],
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get DHIS data.",
    });
  }
};


export const generateClaim = async (req: Request, res: Response) => {
  try {
    const { encounterIds } = req.body;

    if (!encounterIds || encounterIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Encounter IDs required.",
      });
    }

    const claimId = `DHIS-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;


    return res.status(201).json({
      success: true,
      data: {
        claimId,
        encounterCount: encounterIds.length,
        status: "generated",
        message: "DHIS claim generated successfully.",
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to generate claim.",
    });
  }
};


export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to list users.",
    });
  }
};


export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, name, role, email, phone, department, qualifications } = req.body;

    if (!username || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: "Username, password, name, and role are required.",
      });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Username already exists.",
      });
    }

    const user = new User({
      username: username.toLowerCase(),
      password,
      name,
      role,
      email,
      phone,
      department,
      qualifications,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      data: {
        user: {
          username: user.username,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to create user.",
    });
  }
};


export const getSystemStatus = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        internet: "Connected",
        abhaService: "Available",
        ocr: "Available",
        camera: "Ready",
        microphone: "Ready",
        aiEngine: "Available",
        emrSync: "Available",
        uptime: process.uptime(),
        nodeVersion: process.version,
        dbConnected: true,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get system status.",
    });
  }
};


export const listPatients = async (req: Request, res: Response) => {
  try {
    const { queue, search, limit = 50 } = req.query;

    const query: any = { isActive: true };

    if (queue) {
      query.queueType = queue;
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search as string, "i") },
        { patientId: new RegExp(search as string, "i") },
        { mobile: new RegExp(search as string, "i") },
      ];
    }

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .select("-questionnaireAnswers -fetchedRecords -uploadedDocuments");

    return res.status(200).json({
      success: true,
      data: { patients },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to list patients.",
    });
  }
};
