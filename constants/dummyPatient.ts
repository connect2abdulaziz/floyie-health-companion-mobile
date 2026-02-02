import { Patient, PatientStatus } from "@/services/doctor";

// Static dummy patient ID for testing
export const DUMMY_PATIENT_ID = "dummy-patient-001";

// Static dummy patient for doctor dashboard
export const DUMMY_PATIENT: Patient = {
  user_id: DUMMY_PATIENT_ID,
  name: "John Smith",
  patient_status: "needs_follow_up" as PatientStatus,
  lastReading: {
    systolic: 142,
    diastolic: 88,
    heart_rate: 76,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
};

// Static dummy profile for patient detail
export const DUMMY_PATIENT_PROFILE = {
  id: DUMMY_PATIENT_ID,
  name: "John Smith",
  age: 58,
  gender: "male",
};

// Static dummy metrics for patient detail
export const DUMMY_PATIENT_METRICS = {
  avgSystolic: 138,
  avgDiastolic: 86,
  avgHeartRate: 74,
  riskLevel: "moderate" as const,
  trend: "stable" as const,
  variability: "low" as const,
  readingsCount: 12,
  floScore: 72,
  lastReadingAge: "2h ago",
  compliance: 86,
};

// Static dummy readings for patient detail
export const DUMMY_PATIENT_READINGS = [
  {
    id: "reading-1",
    systolic: 142,
    diastolic: 88,
    heart_rate: 76,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "reading-2",
    systolic: 136,
    diastolic: 84,
    heart_rate: 72,
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "reading-3",
    systolic: 140,
    diastolic: 86,
    heart_rate: 78,
    timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "reading-4",
    systolic: 134,
    diastolic: 82,
    heart_rate: 70,
    timestamp: new Date(Date.now() - 74 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "reading-5",
    systolic: 138,
    diastolic: 88,
    heart_rate: 74,
    timestamp: new Date(Date.now() - 98 * 60 * 60 * 1000).toISOString(),
  },
];

// Static clinical summary for patient detail
export const DUMMY_CLINICAL_SUMMARY =
  "Over the last 7 days, average BP is 138/86, slightly elevated. BP readings remain stable. Moderate variability in readings. Flo Score: 72 (good).";
