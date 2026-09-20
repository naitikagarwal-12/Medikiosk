import mongoose, { Schema, Document } from "mongoose";


export interface IConsent extends Document {
  _id: mongoose.Types.ObjectId;
  consentId: string;
  kioskSessionId: string;
  patientRef?: mongoose.Types.ObjectId;
  categories: string[];
  agreed: boolean;
  version: string;
  content: string;
  withdrawn: boolean;
  withdrawnAt?: Date;
  withdrawnReason?: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    timestamp?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConsentSchema = new Schema<IConsent>(
  {
    consentId: {
      type: String,
      required: true,
      unique: true,
    },
    kioskSessionId: {
      type: String,
      required: true,
      index: true,
    },
    patientRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    categories: {
      type: [String],
      default: [],
    },
    agreed: {
      type: Boolean,
      required: true,
    },
    version: {
      type: String,
      required: true,
      default: "1.0",
    },
    content: {
      type: String,
      required: true,
    },
    withdrawn: {
      type: Boolean,
      default: false,
    },
    withdrawnAt: {
      type: Date,
    },
    withdrawnReason: {
      type: String,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      timestamp: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

ConsentSchema.index({ kioskSessionId: 1, createdAt: 1 });
ConsentSchema.index({ patientRef: 1 });
ConsentSchema.index({ agreed: 1 });

export const Consent = mongoose.model<IConsent>("Consent", ConsentSchema);
