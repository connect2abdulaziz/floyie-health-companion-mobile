/**
 * Doctor-specific services
 */

export {
  getPatients,
  addPatient,
  updatePatientStatus,
  getDoctorNotes,
  removePatient,
  type Patient,
  type PatientStatus,
  type DoctorAccess,
} from "./patients";

export {
  calculatePatientMetrics,
  generateClinicalSummary,
  getPatientProfile,
  getPatientReadings,
  type PatientMetrics,
  type PatientProfile,
  type RiskLevel,
  type TrendDirection,
  type Variability,
} from "./patientAnalytics";
