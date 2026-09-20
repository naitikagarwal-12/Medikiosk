import mongoose, { Schema, Document } from "mongoose";


export interface IPrescriptionItem {
  medicine: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface IEncounter extends Document {
  _id: mongoose.Types.ObjectId;
  encounterId: string;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  token: string;
  queueType: "red" | "white";
  physicianId?: mongoose.Types.ObjectId;
  physicianName?: string;
  chiefComplaint: string;
  history: string;
  aiSummary: string;
  examination: string;
  assessment: string;
  plan: string;
  redFlags: string[];
  ayurvedicObservations: {
    tongue?: string;
    eye?: string;
    voice?: string;
  };
  historyData: {
    previousMedication?: string;
    existingConditions?: string;
    allergies?: string;
  };
  status: "in_progress" | "completed" | "saved_draft";
  notes: string;
  prescriptionId?: mongoose.Types.ObjectId;
  completedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EncounterSchema = new Schema<IEncounter>(
  {
    encounterId: {
      type: String,
      required: true,
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    queueType: {
      type: String,
      enum: ["red", "white"],
      required: true,
    },
    physicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    physicianName: {
      type: String,
    },
    chiefComplaint: {
      type: String,
      default: "",
    },
    history: {
      type: String,
      default: "",
    },
    aiSummary: {
      type: String,
      default: "",
    },
    examination: {
      type: String,
      default: "",
    },
    assessment: {
      type: String,
      default: "",
    },
    plan: {
      type: String,
      default: "",
    },
    redFlags: {
      type: [String],
      default: [],
    },
    ayurvedicObservations: {
      tongue: String,
      eye: String,
      voice: String,
    },
    historyData: {
      previousMedication: String,
      existingConditions: String,
      allergies: String,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "saved_draft"],
      default: "in_progress",
    },
    notes: {
      type: String,
      default: "",
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
    completedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

EncounterSchema.index({ patientId: 1 });
EncounterSchema.index({ token: 1 });
EncounterSchema.index({ physicianId: 1 });
EncounterSchema.index({ queueType: 1 });
EncounterSchema.index({ status: 1 });
EncounterSchema.index({ createdAt: -1 });

export const Encounter = mongoose.model<IEncounter>("Encounter", EncounterSchema);
