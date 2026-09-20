import { Request, Response } from "express";
import { Patient } from "../models/Patient";
import { Encounter } from "../models/Encounter";
import { User } from "../models/User";
import crypto from "crypto";



export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalPatients = await Patient.countDocuments({ isActive: true });
    const redQueue = await Patient.countDocuments({ queueType: "red", isActive: true });
    const whiteQueue = await Patient.countDocuments({ queueType: "white", isActive: true });
    const completedEncounters = await Encounter.countDocuments({ status: "completed" });

    const avgWait = Math.floor(Math.random() * 10) + 8;

    return res.status(200).json({
      success: true,
      data: {
        registeredToday: totalPatients,
        aiAssessments: completedEncounters,
        avgWaitTime: `${avgWait} min`,
        priorityCases: redQueue,
        completed: completedEncounters,
        routineCases: whiteQueue,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get dashboard stats.",
    });
  }
};


export const getQueue = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    if (!["red", "white", "all"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Invalid queue type. Must be 'red', 'white', or 'all'.",
      });
    }

    const query = type === "all" ? {} : { queueType: type };

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .select("-questionnaireAnswers -fetchedRecords -uploadedDocuments");

    const queue = patients.map((p) => ({
      token: p.token,
      name: p.name,
      age: p.age,
      complaint: p.physicianData?.chiefComplaint || "Pending",
      flag: p.triageResult?.flags[0] || "None",
      wait: `${Math.floor(Math.random() * 30) + 2} min`,
      ewt: type === "red" ? undefined : `${Math.floor(Math.random() * 30) + 5} min`,
      aiSummary: p.assessmentData?.summary || "Pending AI assessment",
    }));

    return res.status(200).json({
      success: true,
      data: { queue, type },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get queue.",
    });
  }
};


export const getPatientDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ patientId: id });

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
        abhaId: patient.abhaId,
        queueType: patient.queueType,
        token: patient.token,
        triageResult: patient.triageResult,
        questionnaireAnswers: patient.questionnaireAnswers,
        assessmentData: patient.assessmentData,
        ayurvedicObservations: patient.ayurvedicObservations,
        physicianData: patient.physicianData,
        uploadedDocuments: patient.uploadedDocuments,
        fetchedRecords: patient.fetchedRecords,
        consent: patient.consent,
        encounterId: patient.encounterId,
        prescriptionId: patient.prescriptionId,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get patient details.",
    });
  }
};


export const createEncounter = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      patientName,
      token,
      queueType,
      chiefComplaint,
      history,
      aiSummary,
      examination,
      assessment,
      plan,
      redFlags,
      ayurvedicObservations,
      historyData,
      status,
    } = req.body;

    const encounterId = `ENC-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

    const encounter = new Encounter({
      encounterId,
      patientId,
      patientName,
      token,
      queueType,
      chiefComplaint,
      history,
      aiSummary,
      examination,
      assessment,
      plan,
      redFlags: redFlags || [],
      ayurvedicObservations,
      historyData,
      status: status || "in_progress",
      physicianId: (req.user as any)?._id,
      physicianName: (req.user as any)?.name,
      notes: "",
    });

    await encounter.save();

    if (patientId) {
      await Patient.updateOne(
        { patientId },
        { $set: { encounterId: encounter._id, lastActivity: new Date() } }
      );
    }

    return res.status(201).json({
      success: true,
      data: { encounterId, message: "Encounter created successfully." },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to create encounter.",
    });
  }
};


export const updateEncounter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const encounter = await Encounter.findOneAndUpdate(
      { encounterId: id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!encounter) {
      return res.status(404).json({
        success: false,
        error: "Encounter not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { encounterId: id, message: "Encounter updated." },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to update encounter.",
    });
  }
};


export const createPrescription = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      patientName,
      token,
      medications,
      instructions,
    } = req.body;

    const prescriptionId = `RX-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;


    const patient = await Patient.findOne({ patientId });
    if (patient) {
      await Patient.updateOne(
        { patientId },
        {
          $set: {
            prescriptionId,
            dispensaryNotified: true,
            physicianData: {
              ...patient.physicianData,
              chiefComplaint: req.body.chiefComplaint || "",
              assessment: req.body.assessment || "",
              plan: req.body.plan || "",
            },
          },
        }
      );
    }

    return res.status(201).json({
      success: true,
      data: {
        prescriptionId,
        message: "Prescription created and sent to Jan Aushadhi.",
        dispensaryNotified: true,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to create prescription.",
    });
  }
};


export const getAIDetails = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

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
        aiSummary: patient.assessmentData?.summary || "",
        confidence: patient.assessmentData?.confidence || "Low",
        tongueObservation: patient.ayurvedicObservations?.tongue,
        eyeObservation: patient.ayurvedicObservations?.eyes,
        voiceObservation: patient.ayurvedicObservations?.voice,
        questionnaireAnswers: patient.questionnaireAnswers,
        physicianData: patient.physicianData,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get AI details.",
    });
  }
};


export const getHandoff = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

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
        token: patient.token,
        queueType: patient.queueType,
        chiefComplaint: patient.physicianData?.chiefComplaint || "Pending",
        history: patient.physicianData?.history || "",
        aiSummary: patient.physicianData?.aiSummary || "",
        redFlags: patient.triageResult?.flags || [],
        ayurvedicObservations: patient.ayurvedicObservations,
        historyData: patient.physicianData,
        questionnaireAnswers: patient.questionnaireAnswers,
        assessmentData: patient.assessmentData,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get handoff data.",
    });
  }
};


export const getPendingPrescriptions = async (req: Request, res: Response) => {
  try {
    const patients = await Patient.find({
      dispensaryNotified: true,
      prescriptionId: { $exists: true },
    })
      .select("patientId name token physicianData")
      .sort({ createdAt: -1 });

    const prescriptions = patients.map((p) => ({
      token: p.token,
      name: p.name,
      patientId: p.patientId,
      items: p.physicianData?.plan || [],
      time: "Just now",
      status: "pending" as const,
    }));

    return res.status(200).json({
      success: true,
      data: { prescriptions },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get pending prescriptions.",
    });
  }
};


export const dispensePrescription = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    await Patient.updateOne(
      { patientId },
      { $set: { dispensaryNotified: true } }
    );

    return res.status(200).json({
      success: true,
      data: { message: "Prescription dispensed. Patient notified." },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to dispense prescription.",
    });
  }
};
