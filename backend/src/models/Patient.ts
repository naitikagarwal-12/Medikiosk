import mongoose, { Schema, Document } from "mongoose";


export interface IPhysicianRecord extends Document {
  id: string;
  label: string;
  count: string;
  icon: string;
}

export interface IUploadedDocument extends Document {
  id: string;
  name: string;
  category: string;
  capturedAt: string;
}

export interface IQuestionnaireAnswers {
  [step: number]: string[];
}

export interface IPhysicianData {
  chiefComplaint?: string;
  history?: string;
  aiSummary?: string;
  examination?: string;
  assessment?: string;
  plan?: string;
  previousMedication?: string;
  existingConditions?: string;
  allergies?: string;
  dataSources?: string[];
}

export interface IAyurvedicObservation {
  tongue?: {
    coating?: string;
    color?: string;
    moisture?: string;
    shape?: string;
  };
  eyes?: {
    redness?: string;
    pallor?: string;
    dryness?: string;
  };
  voice?: {
    quality?: string;
    pitch?: string;
    hoarseness?: string;
  };
}

export interface ITriageResult {
  queue: "red" | "white";
  score: number;
  flags: string[];
  tokenPrefix: string;
}

export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  mobile: string;
  abhaId?: string;
  aadhaarId?: string;
  role: "patient";
  authMethod: "abha" | "aadhaar" | "walkin";
  identifier: string;
  language: string;
  profileImage?: string;
  fetchedRecords: IPhysicianRecord[];
  selectedRecordIds: string[];
  uploadedDocuments: IUploadedDocument[];
  questionnaireAnswers: IQuestionnaireAnswers;
  triageResult: ITriageResult | null;
  assessmentData?: {
    tongueObservation?: string;
    eyeObservation?: string;
    voiceObservation?: string;
    summary: string;
    confidence: string;
  };
  ayurvedicObservations?: IAyurvedicObservation;
  physicianData?: IPhysicianData;
  token: string;
  queueType: "red" | "white";
  estimatedWait?: number;
  assignedRoom?: string;
  consent: {
    eye: boolean;
    tongue: boolean;
    voice: boolean;
    dataProcessing: boolean;
    consentId?: string;
    agreedAt?: Date;
  };
  encounterId?: mongoose.Types.ObjectId;
  prescriptionId?: mongoose.Types.ObjectId;
  dispensaryNotified: boolean;
  isActive: boolean;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    patientId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    abhaId: {
      type: String,
    },
    aadhaarId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["patient"],
      default: "patient",
    },
    authMethod: {
      type: String,
      enum: ["abha", "aadhaar", "walkin"],
      default: "walkin",
    },
    identifier: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    profileImage: {
      type: String,
    },
    fetchedRecords: {
      type: [{
        id: String,
        label: String,
        count: String,
        icon: String,
      }],
      default: [],
    },
    selectedRecordIds: {
      type: [String],
      default: [],
    },
    uploadedDocuments: {
      type: [{
        id: String,
        name: String,
        category: String,
        capturedAt: String,
      }],
      default: [],
    },
    questionnaireAnswers: {
      type: Map,
      of: [String],
      default: {},
    },
    triageResult: {
      type: {
        queue: { type: String, enum: ["red", "white"] },
        score: Number,
        flags: [String],
        tokenPrefix: String,
      },
      default: null,
    },
    assessmentData: {
      tongueObservation: String,
      eyeObservation: String,
      voiceObservation: String,
      summary: String,
      confidence: String,
    },
    ayurvedicObservations: {
      tongue: {
        coating: String,
        color: String,
        moisture: String,
        shape: String,
      },
      eyes: {
        redness: String,
        pallor: String,
        dryness: String,
      },
      voice: {
        quality: String,
        pitch: String,
        hoarseness: String,
      },
    },
    physicianData: {
      chiefComplaint: String,
      history: String,
      aiSummary: String,
      examination: String,
      assessment: String,
      plan: String,
      previousMedication: String,
      existingConditions: String,
      allergies: String,
      dataSources: [String],
    },
    token: {
      type: String,
    },
    queueType: {
      type: String,
      enum: ["red", "white"],
    },
    estimatedWait: {
      type: Number,
    },
    assignedRoom: {
      type: String,
    },
    consent: {
      eye: { type: Boolean, default: false },
      tongue: { type: Boolean, default: false },
      voice: { type: Boolean, default: false },
      dataProcessing: { type: Boolean, default: false },
      consentId: String,
      agreedAt: Date,
    },
    encounterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Encounter",
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
    dispensaryNotified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PatientSchema.index({ patientId: 1 });
PatientSchema.index({ token: 1 });
PatientSchema.index({ mobile: 1 });
PatientSchema.index({ createdAt: 1 });

export const Patient = mongoose.model<IPatient>("Patient", PatientSchema);
