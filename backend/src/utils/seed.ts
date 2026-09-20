import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Patient } from "../models/Patient";
import crypto from "crypto";
import { connectDB } from "../config/database";

dotenv.config();


export const seedUsers = async (): Promise<void> => {
  try {
    const defaultUsers = [
      {
        username: "admin",
        password: "admin123",
        name: "Hospital Admin",
        role: "admin" as const,
        department: "Administration",
        email: "admin@medikiosk.hospital",
      },
      {
        username: "physician",
        password: "physician123",
        name: "Dr. R. Sharma",
        role: "physician" as const,
        department: "General Medicine",
        qualifications: "MBBS, MD General Medicine",
        licenseNumber: "MC-12345",
        email: "physician@medikiosk.hospital",
      },
      {
        username: "drsharma",
        password: "physician123",
        name: "Dr. R. Sharma",
        role: "physician" as const,
        department: "General Medicine",
        qualifications: "MBBS, MD General Medicine",
        licenseNumber: "MC-12345",
        email: "drsharma@medikiosk.hospital",
      },
      {
        username: "drpriya",
        password: "physician123",
        name: "Dr. Priya Patel",
        role: "physician" as const,
        department: "Pediatrics",
        qualifications: "MBBS, DCH",
        licenseNumber: "MC-54321",
        email: "drpriya@medikiosk.hospital",
      },
      {
        username: "janaushadhi",
        password: "janaushadhi123",
        name: "Jan Aushadhi Staff",
        role: "jan_aushadhi" as const,
        department: "Pharmacy",
        email: "pharmacy@medikiosk.hospital",
      },
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdCount++;
        console.log(`  ✓ Created user: ${userData.username} (${userData.role})`);
      } else {
        existingCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`✓ Default users seeded: ${createdCount} created, ${existingCount} already existed`);
    } else {
      console.log(`✓ Users already seeded (${existingCount} existing)`);
    }

    await seedDemoPatients();
  } catch (error: any) {
    console.error("✗ Error seeding users:", error.message);
  }
};

const seedDemoPatients = async (): Promise<void> => {
  try {
    const existingPatients = await Patient.countDocuments();
    if (existingPatients > 0) {
      console.log(`  ✓ Demo patients already exist (${existingPatients})`);
      return;
    }

    const demoPatients = [
      {
        patientId: `OPD-${Date.now()}-A1`,
        name: "Ananya Sharma",
        age: 34,
        gender: "female" as const,
        mobile: "9876543210",
        abhaId: "14-3344-5566-7788",
        authMethod: "abha" as const,
        identifier: "14-3344-5566-7788",
        language: "English",
        queueType: "red" as const,
        token: "R-027",
        estimatedWait: 2,
        assignedRoom: "OPD Room 1",
        triageResult: {
          queue: "red" as const,
          score: 12,
          flags: ["Fever reported by patient", "Patient-reported severity: Severe"],
          tokenPrefix: "R",
        },
        consent: {
          eye: true,
          tongue: true,
          voice: true,
          dataProcessing: true,
          agreedAt: new Date(),
        },
        physicianData: {
          chiefComplaint: "Fever and fatigue for 3 days, mild cough",
          history: "No significant past medical history",
        },
        isActive: true,
      },
      {
        patientId: `OPD-${Date.now()}-A2`,
        name: "Rajesh Kumar",
        age: 58,
        gender: "male" as const,
        mobile: "9876543211",
        abhaId: "14-3344-5566-7789",
        authMethod: "abha" as const,
        identifier: "14-3344-5566-7789",
        language: "Hindi",
        queueType: "red" as const,
        token: "R-028",
        estimatedWait: 5,
        assignedRoom: "OPD Room 1",
        triageResult: {
          queue: "red" as const,
          score: 15,
          flags: ["Existing condition: Heart disease", "Patient-reported severity: Severe"],
          tokenPrefix: "R",
        },
        consent: {
          eye: true,
          tongue: true,
          voice: true,
          dataProcessing: true,
          agreedAt: new Date(),
        },
        physicianData: {
          chiefComplaint: "Chest tightness and shortness of breath",
        },
        isActive: true,
      },
      {
        patientId: `OPD-${Date.now()}-A3`,
        name: "Priya Singh",
        age: 27,
        gender: "female" as const,
        mobile: "9876543212",
        authMethod: "walkin" as const,
        identifier: "9876543212",
        language: "English",
        queueType: "white" as const,
        token: "A-142",
        estimatedWait: 18,
        assignedRoom: "OPD Room 4",
        triageResult: {
          queue: "white" as const,
          score: 4,
          flags: ["No significant red-flag indicators detected"],
          tokenPrefix: "A",
        },
        consent: {
          eye: true,
          tongue: true,
          voice: false,
          dataProcessing: true,
          agreedAt: new Date(),
        },
        physicianData: {
          chiefComplaint: "Cough and mild fever for 2 days",
        },
        isActive: true,
      },
      {
        patientId: `OPD-${Date.now()}-A4`,
        name: "Mohan Das",
        age: 45,
        gender: "male" as const,
        mobile: "9876543213",
        authMethod: "abha" as const,
        identifier: "14-3344-5566-7790",
        language: "English",
        queueType: "white" as const,
        token: "A-140",
        estimatedWait: 12,
        assignedRoom: "OPD Room 4",
        triageResult: {
          queue: "white" as const,
          score: 3,
          flags: ["No significant red-flag indicators detected"],
          tokenPrefix: "A",
        },
        consent: {
          eye: false,
          tongue: false,
          voice: false,
          dataProcessing: true,
          agreedAt: new Date(),
        },
        isActive: true,
      },
      {
        patientId: `OPD-${Date.now()}-A5`,
        name: "Sunita Rao",
        age: 62,
        gender: "female" as const,
        mobile: "9876543214",
        authMethod: "walkin" as const,
        identifier: "9876543214",
        language: "Marathi",
        queueType: "white" as const,
        token: "A-141",
        estimatedWait: 14,
        assignedRoom: "OPD Room 4",
        triageResult: {
          queue: "white" as const,
          score: 5,
          flags: ["No significant red-flag indicators detected"],
          tokenPrefix: "A",
        },
        consent: {
          eye: true,
          tongue: true,
          voice: true,
          dataProcessing: true,
          agreedAt: new Date(),
        },
        isActive: true,
      },
    ];

    for (const patientData of demoPatients) {
      const patient = new Patient(patientData);
      await patient.save();
    }

    console.log(`  ✓ Created ${demoPatients.length} demo patients`);
  } catch (error: any) {
    console.error("  ✗ Error seeding demo patients:", error.message);
  }
};


async function main() {
  console.log("🌱 MediKiosk database seeder\n");
  await connectDB();
  await seedUsers();
  await mongoose.disconnect();
  console.log("\n✓ Seed complete — connection closed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
