import { createContext, useCallback, useContext, useMemo, useState, ReactNode, useEffect } from "react";

export type AuthMethod = "abha" | "aadhaar" | null;

export type KioskLanguage = "en" | "hi" | "bn" | "mr" | "ta" | "te" | "kn" | "ml" | "gu" | "pa" | "or" | "as" | "ur";

export interface FetchedRecord {
  id: string;
  label: string;
  count: string;
  icon: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  category: string;
  capturedAt: string;
}

export type QuestionnaireAnswers = Record<number, string[]>;

export interface TriageResult {
  queue: "red" | "white";
  score: number;
  flags: string[];
  tokenPrefix: string;
  token?: string;
}

interface KioskState {
  authMethod: AuthMethod;
  setAuthMethod: (m: AuthMethod) => void;

  identifier: string;
  setIdentifier: (v: string) => void;

  sessionId: string;
  setSessionId: (v: string) => void;

  fetchedRecords: FetchedRecord[];
  setFetchedRecords: (r: FetchedRecord[]) => void;

  selectedRecordIds: string[];
  setSelectedRecordIds: (ids: string[]) => void;
  toggleSelectedRecord: (id: string) => void;

  uploadedDocuments: UploadedDocument[];
  addUploadedDocument: (doc: UploadedDocument) => void;

  questionnaireAnswers: QuestionnaireAnswers;
  setQuestionnaireAnswers: (a: QuestionnaireAnswers) => void;

  triageResult: TriageResult | null;
  computeTriage: () => Promise<TriageResult>;

  consent: { eye: boolean; tongue: boolean; voice: boolean };
  setConsent: (c: { eye: boolean; tongue: boolean; voice: boolean }) => void;

  language: KioskLanguage;
  setLanguage: (l: KioskLanguage) => void;

  reset: () => void;
}

const KioskContext = createContext<KioskState | undefined>(undefined);

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

const APPETITE_WEIGHTS: Record<string, number> = {
  Normal: 0,
  Reduced: 1,
  "No appetite": 2,
  Increased: 0,
  "Nausea when eating": 1,
};

const CONDITION_WEIGHTS: Record<string, number> = {
  Diabetes: 1,
  Hypertension: 1,
  "Asthma / Respiratory": 2,
  "Heart disease": 3,
  Thyroid: 1,
  "None known": 0,
};

const RED_FLAG_THRESHOLD = 8;

export function KioskProvider({ children }: { children: ReactNode }) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [identifier, setIdentifier] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [fetchedRecords, setFetchedRecords] = useState<FetchedRecord[]>([]);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswers>({});
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [consent, setConsent] = useState<{ eye: boolean; tongue: boolean; voice: boolean }>({
    eye: false,
    tongue: false,
    voice: false,
  });
  const [language, setLanguage] = useState<KioskLanguage>("en");

  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/kiosk/session?language=English", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (data.success && data.data?.kioskSessionId) {
          setSessionId(data.data.kioskSessionId);
        }
      } catch (error) {
        console.error("Failed to initialize session:", error);
      }
    };
    init();
  }, []);

  const toggleSelectedRecord = useCallback((id: string) => {
    setSelectedRecordIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }, []);

  const addUploadedDocument = useCallback((doc: UploadedDocument) => {
    setUploadedDocuments((docs) => [...docs, doc]);
  }, []);

  const computeTriage = useCallback(async (): Promise<TriageResult> => {
    if (consent.eye || consent.tongue || consent.voice) {
      await fetch("http://localhost:3001/api/kiosk/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          agreed: true,
          categories: [
            consent.eye && "eye",
            consent.tongue && "tongue",
            consent.voice && "voice",
          ].filter(Boolean),
        }),
      });
    }

    let score = 0;
    const flags: string[] = [];

    const symptoms = questionnaireAnswers[0] || [];
    symptoms.forEach((s) => {
      score += SYMPTOM_WEIGHTS[s] ?? 1;
    });
    if (symptoms.includes("🌡 Fever")) flags.push("Fever reported by patient");

    const duration = (questionnaireAnswers[1] || [])[0];
    if (duration) {
      score += DURATION_WEIGHTS[duration] ?? 1;
      if (duration === "More than 2 weeks" || duration === "1–2 weeks") {
        flags.push(`Symptoms persisting for ${duration.toLowerCase()}`);
      }
    }

    const severity = (questionnaireAnswers[2] || [])[0];
    if (severity) {
      score += SEVERITY_WEIGHTS[severity] ?? 0;
      if (severity === "Severe — I cannot function normally") {
        flags.push("Patient-reported severity: Severe");
      }
    }

    const appetite = (questionnaireAnswers[3] || [])[0];
    if (appetite) {
      score += APPETITE_WEIGHTS[appetite] ?? 0;
      if (appetite === "No appetite") flags.push("No appetite reported");
    }

    const digestion = questionnaireAnswers[4] || [];
    digestion.forEach((d) => {
      if (d !== "Normal") score += 1;
    });

    const conditions = questionnaireAnswers[5] || [];
    conditions.forEach((c) => {
      score += CONDITION_WEIGHTS[c] ?? 1;
      if (c === "Heart disease" || c === "Asthma / Respiratory") {
        flags.push(`Existing condition: ${c}`);
      }
    });

    const queue: "red" | "white" = score >= RED_FLAG_THRESHOLD ? "red" : "white";

    if (flags.length === 0) {
      flags.push(queue === "red" ? "Multiple moderate risk indicators combined" : "No significant red-flag indicators detected");
    }

    const result: TriageResult = {
      queue,
      score,
      flags,
      tokenPrefix: queue === "red" ? "R" : "A",
      token: `${queue === "red" ? "R" : "A"}-${Math.floor(100 + Math.random() * 900)}`,
    };
    setTriageResult(result);

    try {
      await fetch("http://localhost:3001/api/kiosk/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          duration,
          severity,
          appetite,
          digestion,
          conditions,
        }),
      });
    } catch (e) {
      console.log("Triage computed locally, backend storage failed:", e);
    }

    return result;
  }, [questionnaireAnswers, consent, sessionId]);

  const reset = useCallback(() => {
    setAuthMethod(null);
    setIdentifier("");
    setSessionId("");
    setFetchedRecords([]);
    setSelectedRecordIds([]);
    setUploadedDocuments([]);
    setQuestionnaireAnswers({});
    setTriageResult(null);
    setConsent({ eye: false, tongue: false, voice: false });
    setLanguage("en");
  }, []);

  const value = useMemo<KioskState>(
    () => ({
      authMethod,
      setAuthMethod,
      identifier,
      setIdentifier,
      sessionId,
      setSessionId,
      fetchedRecords,
      setFetchedRecords,
      selectedRecordIds,
      setSelectedRecordIds,
      toggleSelectedRecord,
      uploadedDocuments,
      addUploadedDocument,
      questionnaireAnswers,
      setQuestionnaireAnswers,
      triageResult,
      computeTriage,
      consent,
      setConsent,
      language,
      setLanguage,
      reset,
    }),
    [
      authMethod,
      identifier,
      sessionId,
      fetchedRecords,
      selectedRecordIds,
      toggleSelectedRecord,
      uploadedDocuments,
      addUploadedDocument,
      questionnaireAnswers,
      triageResult,
      computeTriage,
      consent,
      language,
      reset,
    ]
  );

  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>;
}

export function useKiosk() {
  const ctx = useContext(KioskContext);
  if (!ctx) throw new Error("useKiosk must be used within KioskProvider");
  return ctx;
}
