/**
 * BP classification (AHA guidelines). Used for Latest Reading badge and alerts.
 */
export type BPCategory = "normal" | "elevated" | "stage1" | "stage2" | "crisis";

export interface BPClassification {
  category: BPCategory;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export function classifyBP(systolic: number, diastolic: number): BPClassification {
  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: "crisis",
      label: "Hypertensive Crisis",
      color: "text-red-700",
      bgColor: "bg-red-100",
      borderColor: "border-red-300",
      description: "Seek emergency medical attention immediately",
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: "stage2",
      label: "High BP Stage 2",
      color: "text-orange-700",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-300",
      description: "Consult your doctor about medication and lifestyle changes",
    };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return {
      category: "stage1",
      label: "High BP Stage 1",
      color: "text-amber-700",
      bgColor: "bg-amber-100",
      borderColor: "border-amber-300",
      description: "Lifestyle changes recommended; medication may be needed",
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: "elevated",
      label: "Elevated",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-300",
      description: "Risk of developing high blood pressure; lifestyle changes advised",
    };
  }
  return {
    category: "normal",
    label: "Normal",
    color: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    description: "Your blood pressure is within a healthy range",
  };
}
