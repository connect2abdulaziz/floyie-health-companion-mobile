import { supabase } from "../supabase";

export type PatientStatus = "stable" | "needs_follow_up" | "priority";

export interface Patient {
  user_id: string;
  name: string;
  patient_status: PatientStatus;
  lastReading?: {
    systolic: number;
    diastolic: number;
    heart_rate: number;
    timestamp: string;
  };
}

export interface DoctorAccess {
  user_id: string;
  patient_status: PatientStatus;
  doctor_notes: string | null;
}

/**
 * Get all patients assigned to a doctor
 */
export async function getPatients(doctorId: string): Promise<{
  data: Patient[] | null;
  error: Error | null;
}> {
  // Get all users this doctor has access to
  const { data: accessList, error: accessError } = await supabase
    .from("doctor_access")
    .select("user_id, patient_status")
    .eq("doctor_id", doctorId);

  if (accessError) {
    return { data: null, error: accessError as Error };
  }

  if (!accessList || accessList.length === 0) {
    return { data: [], error: null };
  }

  const userIds = accessList.map((a) => a.user_id);

  // Get profiles for these users
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", userIds);

  if (profilesError) {
    return { data: null, error: profilesError as Error };
  }

  if (!profiles) {
    return { data: [], error: null };
  }

  // Get latest reading for each patient
  const patients: Patient[] = await Promise.all(
    profiles.map(async (profile) => {
      const accessInfo = accessList.find((a) => a.user_id === profile.id);

      const { data: latestReading } = await supabase
        .from("readings")
        .select("systolic, diastolic, heart_rate, timestamp")
        .eq("user_id", profile.id)
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        user_id: profile.id,
        name: profile.name || "Unknown",
        patient_status: (accessInfo?.patient_status as PatientStatus) || "stable",
        lastReading: latestReading || undefined,
      };
    })
  );

  return { data: patients, error: null };
}

/**
 * Add a patient to the doctor's list by patient ID
 */
export async function addPatient(
  doctorId: string,
  patientId: string
): Promise<{ success: boolean; error: Error | null }> {
  // Check if patient exists
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", patientId)
    .maybeSingle();

  if (profileError) {
    return { success: false, error: profileError as Error };
  }

  if (!profile) {
    return { success: false, error: new Error("Patient not found") };
  }

  // Check if already added
  const { data: existing } = await supabase
    .from("doctor_access")
    .select("user_id")
    .eq("doctor_id", doctorId)
    .eq("user_id", patientId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: new Error("Patient already added") };
  }

  // Add access
  const { error: insertError } = await supabase.from("doctor_access").insert({
    doctor_id: doctorId,
    user_id: patientId,
    patient_status: "stable",
  });

  if (insertError) {
    return { success: false, error: insertError as Error };
  }

  return { success: true, error: null };
}

/**
 * Update patient status and notes
 */
export async function updatePatientStatus(
  doctorId: string,
  patientId: string,
  status: PatientStatus,
  notes?: string
): Promise<{ success: boolean; error: Error | null }> {
  const updateData: { patient_status: PatientStatus; doctor_notes?: string; updated_at: string } = {
    patient_status: status,
    updated_at: new Date().toISOString(),
  };

  if (notes !== undefined) {
    updateData.doctor_notes = notes;
  }

  const { error } = await supabase
    .from("doctor_access")
    .update(updateData)
    .eq("doctor_id", doctorId)
    .eq("user_id", patientId);

  if (error) {
    return { success: false, error: error as Error };
  }

  return { success: true, error: null };
}

/**
 * Get doctor's notes for a specific patient
 */
export async function getDoctorNotes(
  doctorId: string,
  patientId: string
): Promise<{ data: DoctorAccess | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("doctor_access")
    .select("user_id, patient_status, doctor_notes")
    .eq("doctor_id", doctorId)
    .eq("user_id", patientId)
    .maybeSingle();

  if (error) {
    return { data: null, error: error as Error };
  }

  return { data: data as DoctorAccess | null, error: null };
}

/**
 * Remove a patient from doctor's list
 */
export async function removePatient(
  doctorId: string,
  patientId: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from("doctor_access")
    .delete()
    .eq("doctor_id", doctorId)
    .eq("user_id", patientId);

  if (error) {
    return { success: false, error: error as Error };
  }

  return { success: true, error: null };
}
