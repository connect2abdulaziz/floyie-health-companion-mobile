import { supabase } from "./supabase";

export type MemberRole = "doctor" | "caregiver";

export interface CareTeamMember {
  id: string;
  memberId: string;
  name: string;
  role: MemberRole;
  addedAt: string;
}

/**
 * Get all care team members for a patient
 */
export async function getCareTeam(
  userId: string
): Promise<{ data: CareTeamMember[] | null; error: Error | null }> {
  try {
    const members: CareTeamMember[] = [];

    // Load doctors
    const { data: doctorAccess, error: doctorError } = await supabase
      .from("doctor_access")
      .select("id, doctor_id, created_at")
      .eq("user_id", userId);

    if (doctorError) throw doctorError;

    // Load caregivers
    const { data: caregiverAccess, error: caregiverError } = await supabase
      .from("caregiver_access")
      .select("id, caregiver_id, created_at")
      .eq("user_id", userId);

    if (caregiverError) throw caregiverError;

    // Get doctor profiles
    if (doctorAccess && doctorAccess.length > 0) {
      const doctorIds = doctorAccess.map((d) => d.doctor_id);
      const { data: doctorProfiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", doctorIds);

      doctorAccess.forEach((access) => {
        const profile = doctorProfiles?.find((p) => p.id === access.doctor_id);
        members.push({
          id: access.id,
          memberId: access.doctor_id,
          name: profile?.name || "Unknown Doctor",
          role: "doctor",
          addedAt: access.created_at || "",
        });
      });
    }

    // Get caregiver profiles
    if (caregiverAccess && caregiverAccess.length > 0) {
      const caregiverIds = caregiverAccess.map((c) => c.caregiver_id);
      const { data: caregiverProfiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", caregiverIds);

      caregiverAccess.forEach((access) => {
        const profile = caregiverProfiles?.find(
          (p) => p.id === access.caregiver_id
        );
        members.push({
          id: access.id,
          memberId: access.caregiver_id,
          name: profile?.name || "Unknown Caregiver",
          role: "caregiver",
          addedAt: access.created_at || "",
        });
      });
    }

    return { data: members, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Add a member to the care team
 */
export async function addCareTeamMember(
  userId: string,
  memberId: string,
  role: MemberRole
): Promise<{ success: boolean; error: string | null }> {
  // Validate UUID format
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      memberId
    );
  if (!isUUID) {
    return { success: false, error: "Please enter a valid ID (UUID format)" };
  }

  try {
    // Check if user exists and has correct role
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("user_id", memberId)
      .maybeSingle();

    if (roleError) throw roleError;

    if (!userRole) {
      return { success: false, error: "No user found with that ID" };
    }

    if (role === "doctor" && userRole.role !== "doctor") {
      return { success: false, error: "This user is not registered as a doctor" };
    }

    if (role === "caregiver" && userRole.role !== "caregiver") {
      return {
        success: false,
        error: "This user is not registered as a caregiver",
      };
    }

    // Check if already added
    if (role === "doctor") {
      const { data: existing } = await supabase
        .from("doctor_access")
        .select("id")
        .eq("user_id", userId)
        .eq("doctor_id", memberId)
        .maybeSingle();

      if (existing) {
        return { success: false, error: "This doctor is already in your care team" };
      }

      // Add doctor
      const { error: insertError } = await supabase
        .from("doctor_access")
        .insert({ user_id: userId, doctor_id: memberId, patient_status: "stable" });

      if (insertError) throw insertError;
    } else {
      const { data: existing } = await supabase
        .from("caregiver_access")
        .select("id")
        .eq("user_id", userId)
        .eq("caregiver_id", memberId)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: "This caregiver is already in your care team",
        };
      }

      // Add caregiver
      const { error: insertError } = await supabase
        .from("caregiver_access")
        .insert({ user_id: userId, caregiver_id: memberId });

      if (insertError) throw insertError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding care team member:", error);
    return { success: false, error: "Failed to add to care team" };
  }
}

/**
 * Remove a member from the care team
 */
export async function removeCareTeamMember(
  accessId: string,
  role: MemberRole
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (role === "doctor") {
      const { error } = await supabase
        .from("doctor_access")
        .delete()
        .eq("id", accessId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("caregiver_access")
        .delete()
        .eq("id", accessId);

      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
