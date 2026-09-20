import { Request, Response } from "express";
import { Patient } from "../models/Patient";
import { Consent } from "../models/Consent";
import { Encounter } from "../models/Encounter";
import { User } from "../models/User";
import crypto from "crypto";



export const initSession = async (req: Request, res: Response) => {
  try {
    const { language } = req.query;

    console.log(`✓ New kiosk session initialized: lang=${language || "English"}`);

    return res.status(200).json({
      success: true,
      data: {
        kioskSessionId: `session-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
        language: language || "English",
      },
    });
  } catch (error: any) {
    console.error("Session init error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to initialize session.",
    });
  }
};


export const updateSession = async (req: Request, res: Response) => {
  try {
    const { lang, authMethod, identifier, authId } = req.body;

    return res.status(200).json({
      success: true,
      message: "Session data updated.",
      data: {
        kioskSessionId: req.kioskSessionId,
        lang,
        authMethod,
        identifier,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to update session.",
    });
  }
};


export const recordConsent = async (req: Request, res: Response) => {
  try {
    const { sessionId, agreed, categories } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID required.",
      });
    }

    const consentId = `consent-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

    const consent = new Consent({
      consentId,
      kioskSessionId: sessionId,
      categories: categories || [],
      agreed,
      version: "1.0",
      content: "Optional Clinical Assessment - Eye, Tongue, Voice",
    });

    await consent.save();

    return res.status(201).json({
      success: true,
      data: { consentId },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to record consent.",
    });
  }
};


export const fetchRecords = async (req: Request, res: Response) => {
  try {
    const { authMethod, abhaId, aadhaarId } = req.query;

    const mockRecords = [
      { id: "rec-visits", label: "Previous visits", count: "4 records", icon: "🏥" },
      { id: "rec-diagnoses", label: "Diagnoses", count: "2 records", icon: "📋" },
      { id: "rec-medications", label: "Medications", count: "3 records", icon: "💊" },
      { id: "rec-labs", label: "Lab reports", count: "1 record", icon: "🧪" },
      { id: "rec-allergies", label: "Allergies", count: "None reported", icon: "⚠️" },
    ];

    return res.status(200).json({
      success: true,
      data: { records: mockRecords },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch records.",
    });
  }
};


export const processOCR = async (req: Request, res: Response) => {
  try {
    const { docType, imageData } = req.body;

    if (!docType) {
      return res.status(400).json({
        success: false,
        error: "Document type required.",
      });
    }

    const steps = [
      { label: "Image captured", done: true },
      { label: "Text extraction", done: true },
      { label: "Document classification", done: true },
      { label: "Added to patient record", done: true },
    ];

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const docRecord = {
      id: `doc-${Date.now()}`,
      name: `${docType} — ${new Date().toLocaleTimeString()}`,
      category: docType,
      capturedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      data: {
        document: docRecord,
        steps,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "OCR processing failed.",
    });
  }
};


export const computeTriage = async (req: Request, res: Response) => {
  try {
    const {
      symptoms,
      duration,
      severity,
      appetite,
      digestion,
      conditions,
    } = req.body;

    let score = 0;
    const flags: string[] = [];

    const SYMPTOM_WEIGHTS: Record<string, number> = {
      "🌡 Fever": 2,
      "🤧 Cough / Cold": 1,
      "😣 Pain": 1,
      "🫁 Stomach / Digestion": 1,
      "🩹 Skin problem": 0,
      "😴 Weakness / Fatigue": 1,
      "🤕 Headache": 1,
      Other: 1,
    };

    const DURATION_WEIGHTS: Record<string, number> = {
      "Less than 1 day": 0,
      "1–3 days": 1,
      "3–7 days": 2,
      "1–2 weeks": 2,
      "More than 2 weeks": 3,
    };

    const SEVERITY_WEIGHTS: Record<string, number> = {
      "Mild — I can carry on with daily activities": 0,
      "Moderate — It affects my daily routine": 2,
      "Severe — I cannot function normally": 5,
    };

    const CONDITION_WEIGHTS: Record<string, number> = {
      Diabetes: 1,
      Hypertension: 1,
      "Asthma / Respiratory": 2,
      "Heart disease": 3,
      Thyroid: 1,
      "None known": 0,
    };

    const symptomList = symptoms || [];
    symptomList.forEach((s: string) => {
      score += SYMPTOM_WEIGHTS[s] ?? 1;
      if (s === "🌡 Fever") flags.push("Fever reported by patient");
    });

    if (duration) {
      score += DURATION_WEIGHTS[duration] ?? 1;
      if (duration === "More than 2 weeks" || duration === "1–2 weeks") {
        flags.push(`Symptoms persisting for ${duration.toLowerCase()}`);
      }
    }

    if (severity) {
      score += SEVERITY_WEIGHTS[severity] ?? 0;
      if (severity === "Severe — I cannot function normally") {
        flags.push("Patient-reported severity: Severe");
      }
    }

    const digestionList = digestion || [];
    digestionList.forEach((d: string) => {
      if (d !== "Normal") score += 1;
    });

    const conditionList = conditions || [];
    conditionList.forEach((c: string) => {
      score += CONDITION_WEIGHTS[c] ?? 1;
      if (c === "Heart disease" || c === "Asthma / Respiratory") {
        flags.push(`Existing condition: ${c}`);
      }
    });

    const RED_FLAG_THRESHOLD = 8;
    const queue: "red" | "white" = score >= RED_FLAG_THRESHOLD ? "red" : "white";

    if (flags.length === 0) {
      flags.push(
        queue === "red"
          ? "Multiple moderate risk indicators combined"
          : "No significant red-flag indicators detected"
      );
    }

    const tokenPrefix = queue === "red" ? "R" : "A";
    const token = `${tokenPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    return res.status(200).json({
      success: true,
      data: {
        queue,
        score,
        flags,
        tokenPrefix,
        token,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Triage computation failed.",
    });
  }
};


export const logVoiceCommand = async (req: Request, res: Response) => {
  try {
    const { transcript, route } = req.body;

    return res.status(200).json({
      success: true,
      message: "Voice command logged.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to log voice command.",
    });
  }
};


export const getPatientSummary = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: "Patient ID required.",
      });
    }

    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: "Patient not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        patientId: patient.patientId,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        mobile: patient.mobile,
        authMethod: patient.authMethod,
        queueType: patient.queueType,
        token: patient.token,
        triageResult: patient.triageResult,
        consent: patient.consent,
        estimatedWait: patient.estimatedWait,
        assignedRoom: patient.assignedRoom,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get patient summary.",
    });
  }
};
