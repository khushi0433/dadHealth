// ─── TDEE Calculation Utilities ───────────────────────────────────────────────
// Mifflin-St Jeor BMR formula (most accurate for general population)

export type TDEEGender = "male" | "female";

export type TDEEActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export const ACTIVITY_LABELS: Record<TDEEActivityLevel, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Lightly active (1–3 days/week)",
  moderate: "Moderately active (3–5 days/week)",
  active: "Very active (6–7 days/week)",
  very_active: "Extra active (physical job or 2× training)",
};

const ACTIVITY_MULTIPLIERS: Record<TDEEActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export interface TDEEInputs {
  age: number;
  weightKg: number;
  heightCm: number;
  gender: TDEEGender;
  activityLevel: TDEEActivityLevel;
}

export interface TDEEResult {
  bmr: number;
  tdee: number;
  maintenance: number;
  fatLoss: number;
  aggressiveFatLoss: number;
  muscleGain: number;
  bmi: number;
  bmiCategory: string;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function calculateTDEE(inputs: TDEEInputs): TDEEResult {
  const { age, weightKg, heightCm, gender, activityLevel } = inputs;

  // Mifflin-St Jeor BMR
  const bmr =
    gender === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
  const maintenance = tdee;
  const fatLoss = Math.round(tdee - 500);           // moderate deficit
  const aggressiveFatLoss = Math.round(tdee - 750); // aggressive deficit
  const muscleGain = Math.round(tdee + 300);        // lean bulk surplus

  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCategory = getBMICategory(bmi);

  return {
    bmr: Math.round(bmr),
    tdee,
    maintenance,
    fatLoss,
    aggressiveFatLoss,
    muscleGain,
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
  };
}

/** Convert feet + inches to centimetres */
export function ftInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 30.48) + (inches * 2.54));
}

/** Convert pounds to kilograms */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.4536 * 10) / 10;
}
