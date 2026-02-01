/**
 * Validate blood pressure reading (same ranges as web).
 */
export function validateReading(
  systolic: number,
  diastolic: number,
  heartRate: number
): string | null {
  if (systolic < 70 || systolic > 250) {
    return "Systolic must be between 70 and 250 mmHg";
  }
  if (diastolic < 40 || diastolic > 150) {
    return "Diastolic must be between 40 and 150 mmHg";
  }
  if (heartRate < 40 || heartRate > 200) {
    return "Heart rate must be between 40 and 200 bpm";
  }
  if (diastolic >= systolic) {
    return "Diastolic must be lower than systolic";
  }
  return null;
}
