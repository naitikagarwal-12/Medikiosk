import nodemailer from "nodemailer";

export const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP not configured - email functionality will be limited");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  });
};

export const emailTemplates = {
  prescriptionNotification: (
    patientName: string,
    token: string,
    medications: any[],
    doctorName: string
  ) => {
    return {
      subject: `Prescription Ready for Token ${token}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e4080;">MediKiosk - Prescription Ready</h2>
          <p>Dear ${patientName},</p>
          <p>Your prescription has been generated and is ready for collection.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Token: ${token}</h3>
            <p>Patient: ${patientName}</p>
            <p>Prescribed by: ${doctorName}</p>
          </div>
          <h3>Medications:</h3>
          <ul>
            ${medications
              .map(
                (med) => `
                  <li>
                    <strong>${med.medicine} ${med.strength}</strong><br/>
                    Dosage: ${med.dosage}<br/>
                    Frequency: ${med.frequency}<br/>
                    Duration: ${med.duration}
                  </li>
                `
              )
              .join("")}
          </ul>
          <p><strong>Instructions:</strong> ${medications[0]?.instructions || "Take as prescribed"}</p>
          <hr style="margin: 20px 0;"/>
          <p><em>This is an AI-assisted prescription and must be verified by a physician before dispensing.</em></p>
          <p><strong>IMPORTANT:</strong> This prescription is for your reference. Please present this token at the dispensary for collection.</p>
        </div>
      `,
    };
  },

  consentConfirmation: (patientName: string, consentId: string, categories: string[]) => {
    return {
      subject: `MediKiosk - Consent Confirmation (ID: ${consentId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e4080;">MediKiosk - Consent Recorded</h2>
          <p>Dear ${patientName},</p>
          <p>Your consent has been successfully recorded in our system.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Consent ID: ${consentId}</h3>
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Consented to:</strong> ${categories.join(", ")}</p>
          </div>
          <p>This consent is part of your MediKiosk patient journey and will be stored securely according to DPDP regulations.</p>
          <hr style="margin: 20px 0;"/>
          <p>For any questions about your data or to withdraw consent, please contact your healthcare provider.</p>
        </div>
      `,
    };
  },

  queueAlert: (patientName: string, token: string, queueType: "red" | "white", waitTime?: number) => {
    return {
      subject: queueType === "red" ? `⚠️ ${patientName} - Priority Queue Alert!` : `MediKiosk - ${patientName} - Queue Update`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${queueType === "red" ? "#dc2626" : "#0d9488"};">${queueType === "red" ? "🔴 Priority Queue" : "🟢 Routine Queue"}</h2>
          <p>Dear ${patientName},</p>
          <div style="background: ${queueType === "red" ? "#fef2f2" : "#f0fdf4e"}; padding: 20px; border-radius: 10px; border: 2px solid ${queueType === "red" ? "#fca5a5" : "#86efac"}; margin: 15px 0;">
            <h3 style="color: ${queueType === "red" ? "#991b1b" : "#166534"};">${queueType === "red" ? "Token: " + token : "Token: " + token}</h3>
            ${waitTime ? `<p><strong>Estimated Wait:</strong> ${waitTime} minutes</p>` : ""}
            <p><strong>Queue Type:</strong> ${queueType === "red" ? "Priority (Red)" : "Routine (White)"}</p>
          </div>
          <p>${queueType === "red"
            ? "Please proceed immediately to the priority clinical area. Your urgent assessment is required."
            : "Please wait in the designated waiting area. Your turn will be called soon."}
          </p>
          <hr style="margin: 20px 0;"/>
          <p>For real-time updates, use the MediKiosk mobile app or ask a staff member for assistance.</p>
        </div>
      `,
    };
  },
};

export const sendEmail = async (to: string, template: any, data: any): Promise<boolean> => {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `MediKiosk <${process.env.SMTP_USER}>`,
      to,
      ...template,
    });

    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
