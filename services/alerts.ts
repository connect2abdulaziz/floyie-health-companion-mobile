import { supabase } from "@/services/supabase";
import { classifyBP } from "@/lib/bpZones";

interface AlertConfig {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
}

export interface Alert {
  id: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  created_at: string;
}

export async function analyzeAndGenerateAlerts(userId: string): Promise<AlertConfig[]> {
  const alerts: AlertConfig[] = [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: readings, error } = await supabase
    .from("readings")
    .select("*")
    .eq("user_id", userId)
    .gte("timestamp", thirtyDaysAgo.toISOString())
    .order("timestamp", { ascending: false });

  if (error || !readings || readings.length === 0) return alerts;

  const latest = readings[0];
  const latestClassification = classifyBP(latest.systolic, latest.diastolic);

  if (latestClassification.category === "crisis") {
    alerts.push({
      type: "crisis",
      severity: "critical",
      message: `⚠️ Critical: Your latest reading (${latest.systolic}/${latest.diastolic}) indicates a hypertensive crisis. Seek immediate medical attention.`,
    });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7Days = readings.filter((r) => new Date(r.timestamp) >= sevenDaysAgo);

  if (last7Days.length >= 3) {
    const highReadings = last7Days.filter((r) => {
      const c = classifyBP(r.systolic, r.diastolic);
      return c.category === "stage1" || c.category === "stage2";
    });
    if (highReadings.length >= Math.ceil(last7Days.length * 0.7)) {
      alerts.push({
        type: "persistent_high",
        severity: "high",
        message: `${highReadings.length} of your last ${last7Days.length} readings show elevated blood pressure. Consider consulting your doctor.`,
      });
    }
  }

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const recentReadings = readings.filter((r) => new Date(r.timestamp) >= threeDaysAgo);
  if (recentReadings.length === 0) {
    alerts.push({
      type: "missing_readings",
      severity: "low",
      message: "No readings recorded in the last 3 days. Remember to track your blood pressure regularly.",
    });
  }

  return alerts;
}

export async function saveAlerts(userId: string, alerts: AlertConfig[]): Promise<void> {
  if (alerts.length === 0) return;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existingAlerts } = await supabase
    .from("health_alerts")
    .select("alert_type")
    .eq("user_id", userId)
    .gte("created_at", since);
  const existingTypes = new Set(existingAlerts?.map((a) => a.alert_type) || []);
  const newAlerts = alerts.filter((a) => a.type === "crisis" || !existingTypes.has(a.type));
  if (newAlerts.length === 0) return;
  await supabase.from("health_alerts").insert(
    newAlerts.map((a) => ({
      user_id: userId,
      alert_type: a.type,
      severity: a.severity,
      message: a.message,
    }))
  );
}

export async function getActiveAlerts(userId: string): Promise<Alert[]> {
  const { data } = await supabase
    .from("health_alerts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data as Alert[]) || [];
}

export async function markAlertAsRead(alertId: string): Promise<void> {
  await supabase.from("health_alerts").update({ is_read: true }).eq("id", alertId);
}
