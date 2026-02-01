import { supabase } from "@/services/supabase";

export interface SmartReminder {
  id: string;
  type: "reading" | "medication" | "custom";
  title: string;
  message: string;
  scheduledTime: Date;
  priority: "low" | "medium" | "high";
}

interface ReadingPattern {
  preferredTimes: string[];
  averageInterval: number;
  missedDays: number;
}

async function analyzeReadingPatterns(userId: string): Promise<ReadingPattern> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: readings } = await supabase
    .from("readings")
    .select("timestamp")
    .eq("user_id", userId)
    .gte("timestamp", thirtyDaysAgo.toISOString())
    .order("timestamp", { ascending: true });

  if (!readings || readings.length < 5) {
    return {
      preferredTimes: ["08:00", "20:00"],
      averageInterval: 12,
      missedDays: 0,
    };
  }

  const hourCounts: Record<number, number> = {};
  readings.forEach((r) => {
    const hour = new Date(r.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const sortedHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([h]) => String(Number(h)).padStart(2, "0") + ":00");

  const lastReadingDate =
    readings.length > 0
      ? new Date(readings[readings.length - 1].timestamp)
      : null;
  const now = new Date();
  const daysSinceLastReading = lastReadingDate
    ? Math.floor(
        (now.getTime() - lastReadingDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 30;

  return {
    preferredTimes: sortedHours.length > 0 ? sortedHours : ["08:00", "20:00"],
    averageInterval: 12,
    missedDays: daysSinceLastReading,
  };
}

export async function getSmartReminders(
  userId: string
): Promise<SmartReminder[]> {
  const reminders: SmartReminder[] = [];
  const pattern = await analyzeReadingPatterns(userId);
  const now = new Date();

  const { data: lastReading } = await supabase
    .from("readings")
    .select("timestamp")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastReadingTime = lastReading ? new Date(lastReading.timestamp) : null;
  const hoursSinceLastReading = lastReadingTime
    ? (now.getTime() - lastReadingTime.getTime()) / (1000 * 60 * 60)
    : 999;

  const currentHour = now.getHours();
  const preferredHours = pattern.preferredTimes.map((t) =>
    parseInt(t.split(":")[0], 10)
  );

  for (const preferredHour of preferredHours) {
    if (currentHour >= preferredHour && hoursSinceLastReading > 8) {
      const scheduledTime = new Date(now);
      scheduledTime.setHours(preferredHour, 0, 0, 0);
      if (scheduledTime <= now) {
        reminders.push({
          id: `reading-${preferredHour}`,
          type: "reading",
          title: "Time to log your blood pressure",
          message: `You usually take a reading around ${preferredHour}:00. Don't forget to log today!`,
          scheduledTime,
          priority: pattern.missedDays > 2 ? "high" : "medium",
        });
        break;
      }
    }
  }

  if (pattern.missedDays >= 5 && reminders.length === 0) {
    reminders.push({
      id: "missed-days",
      type: "reading",
      title: "We miss your readings!",
      message: `You haven't logged a reading in ${pattern.missedDays} days. Regular tracking helps monitor your health.`,
      scheduledTime: now,
      priority: "high",
    });
  }

  return reminders.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    if (order[a.priority] !== order[b.priority])
      return order[a.priority] - order[b.priority];
    return a.scheduledTime.getTime() - b.scheduledTime.getTime();
  });
}
