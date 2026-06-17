"use client";

import { useState } from "react";
import LimeButton from "@/components/LimeButton";
import {
  calculateTDEE,
  ftInchesToCm,
  lbsToKg,
  ACTIVITY_LABELS,
  type TDEEGender,
  type TDEEActivityLevel,
  type TDEEResult,
} from "@/lib/tdee";

// ─── Ghost button styles (matches fitness page pattern) ───────────────────────
const ghostBtn =
  "bg-transparent border py-2.5 px-4 font-heading font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer";
const ghostBtnActive = `${ghostBtn} text-foreground border-foreground/25 hover:border-primary hover:text-primary`;
const ghostBtnSelected = `${ghostBtn} text-primary border-primary bg-primary/[0.08]`;

// ─── Unit system ──────────────────────────────────────────────────────────────
type UnitSystem = "metric" | "imperial";

// ─── Calorie goal card ───────────────────────────────────────────────────────
interface GoalCardProps {
  label: string;
  cal: number;
  description: string;
  highlight?: boolean;
}

function GoalCard({ label, cal, description, highlight }: GoalCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-1 ${
        highlight
          ? "border-primary bg-primary/[0.06]"
          : "border-border bg-background"
      }`}
    >
      <div className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-heading text-2xl font-extrabold leading-none ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {cal.toLocaleString()}
        <span className="text-sm font-bold ml-1 opacity-60">kcal</span>
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{description}</div>
    </div>
  );
}

// ─── Insight block ────────────────────────────────────────────────────────────
interface InsightProps {
  text: string;
}

function Insight({ text }: InsightProps) {
  return (
    <div className="border-l-[3px] border-primary bg-white/[0.03] border border-border px-4 py-3 rounded-sm">
      <p className="text-[12px] text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
const TDEECalculator = () => {
  // Unit system
  const [units, setUnits] = useState<UnitSystem>("metric");

  // Metric inputs
  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");

  // Imperial inputs
  const [weightLbs, setWeightLbs] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");

  const [gender, setGender] = useState<TDEEGender>("male");
  const [activityLevel, setActivityLevel] = useState<TDEEActivityLevel>("moderate");

  const [result, setResult] = useState<TDEEResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors";
  const selectCls =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors";
  const labelCls =
    "flex flex-col gap-2 text-[11px] font-heading font-bold uppercase tracking-wide text-muted-foreground";

  const handleCalculate = () => {
    setError(null);
    const parsedAge = Number(age);

    let resolvedWeightKg: number;
    let resolvedHeightCm: number;

    if (units === "metric") {
      resolvedWeightKg = Number(weightKg);
      resolvedHeightCm = Number(heightCm);
    } else {
      resolvedWeightKg = lbsToKg(Number(weightLbs));
      resolvedHeightCm = ftInchesToCm(Number(heightFt), Number(heightIn || "0"));
    }

    if (
      !parsedAge || parsedAge < 15 || parsedAge > 100 ||
      !resolvedWeightKg || resolvedWeightKg < 30 || resolvedWeightKg > 300 ||
      !resolvedHeightCm || resolvedHeightCm < 100 || resolvedHeightCm > 250
    ) {
      setError("Please enter valid values. Age: 15–100, Weight: 30–300 kg, Height: 100–250 cm.");
      return;
    }

    const tdeeResult = calculateTDEE({
      age: parsedAge,
      weightKg: resolvedWeightKg,
      heightCm: resolvedHeightCm,
      gender,
      activityLevel,
    });

    setResult(tdeeResult);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setAge("");
    setWeightKg("");
    setHeightCm("");
    setWeightLbs("");
    setHeightFt("");
    setHeightIn("");
  };

  const buildInsights = (r: TDEEResult): string[] => {
    const insights: string[] = [];

    if (r.bmi < 18.5) {
      insights.push(`Your BMI of ${r.bmi} is below healthy range. Focus on a calorie surplus with quality protein to support healthy weight gain.`);
    } else if (r.bmi >= 25 && r.bmi < 30) {
      insights.push(`Your BMI of ${r.bmi} is in the overweight range. A consistent 500 kcal daily deficit puts you on track to lose ~0.5 kg per week without sacrificing muscle.`);
    } else if (r.bmi >= 30) {
      insights.push(`Your BMI of ${r.bmi} suggests a more aggressive deficit could be beneficial. Consider a 750 kcal deficit while prioritising protein (≥1.6 g/kg body weight).`);
    } else {
      insights.push(`Your BMI of ${r.bmi} is in the healthy range. Maintaining at ${r.maintenance.toLocaleString()} kcal supports your current body composition.`);
    }

    if (r.tdee > 3000) {
      insights.push("Your high TDEE reflects significant activity. Ensure adequate carbohydrate intake around training to fuel performance.");
    }

    insights.push(
      `Your BMR of ${r.bmr.toLocaleString()} kcal represents the calories your body burns at complete rest — this is your absolute floor. Never eat below this for extended periods.`
    );

    insights.push(
      "These estimates are based on the Mifflin-St Jeor formula — the most validated equation for general use. Individual metabolisms vary; adjust by ±100–200 kcal based on 2-week real-world results."
    );

    return insights;
  };

  return (
    <div className="rounded-2xl border border-border bg-background p-5 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-heading text-xs font-extrabold uppercase tracking-[0.25em] text-primary">
            TDEE Calculator
          </div>
          <p className="text-xs text-muted-foreground mt-2 max-w-lg">
            Calculate your Total Daily Energy Expenditure — the exact calories you need to maintain,
            lose, or gain weight based on your body and lifestyle.
          </p>
        </div>
        <span className="tag-pill shrink-0">FREE</span>
      </div>

      {/* Unit toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUnits("metric")}
          className={units === "metric" ? ghostBtnSelected : ghostBtnActive}
        >
          Metric (kg / cm)
        </button>
        <button
          type="button"
          onClick={() => setUnits("imperial")}
          className={units === "imperial" ? ghostBtnSelected : ghostBtnActive}
        >
          Imperial (lbs / ft)
        </button>
      </div>

      {/* Form */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Gender */}
        <div className="sm:col-span-2">
          <div className="text-[11px] font-heading font-bold uppercase tracking-wide text-muted-foreground mb-2">
            Gender
          </div>
          <div className="flex gap-2">
            {(["male", "female"] as TDEEGender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={gender === g ? ghostBtnSelected : ghostBtnActive}
              >
                {g === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <label className={labelCls}>
          Age (years)
          <input
            type="number"
            min={15}
            max={100}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 35"
            className={inputCls}
          />
        </label>

        {/* Weight */}
        {units === "metric" ? (
          <label className={labelCls}>
            Weight (kg)
            <input
              type="number"
              min={30}
              max={300}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 85"
              className={inputCls}
            />
          </label>
        ) : (
          <label className={labelCls}>
            Weight (lbs)
            <input
              type="number"
              min={66}
              max={660}
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              placeholder="e.g. 185"
              className={inputCls}
            />
          </label>
        )}

        {/* Height */}
        {units === "metric" ? (
          <label className={labelCls}>
            Height (cm)
            <input
              type="number"
              min={100}
              max={250}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="e.g. 178"
              className={inputCls}
            />
          </label>
        ) : (
          <div className={labelCls}>
            Height (ft / in)
            <div className="flex gap-2">
              <input
                type="number"
                min={3}
                max={8}
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                placeholder="ft"
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                max={11}
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                placeholder="in"
                className={inputCls}
              />
            </div>
          </div>
        )}

        {/* Activity level */}
        <label className={`${labelCls} sm:col-span-2`}>
          Activity level
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as TDEEActivityLevel)}
            className={selectCls}
          >
            {(Object.keys(ACTIVITY_LABELS) as TDEEActivityLevel[]).map((level) => (
              <option key={level} value={level}>
                {ACTIVITY_LABELS[level]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <LimeButton onClick={handleCalculate}>CALCULATE TDEE →</LimeButton>
        {result && (
          <button type="button" onClick={handleReset} className={ghostBtnActive}>
            RESET
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 pt-2 border-t border-border">
          {/* BMR + TDEE headline stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "BMR", value: result.bmr.toLocaleString(), unit: "kcal/day" },
              { label: "TDEE", value: result.tdee.toLocaleString(), unit: "kcal/day" },
              { label: "BMI", value: String(result.bmi), unit: result.bmiCategory },
              { label: "Activity", value: activityLevel.replace("_", " ").toUpperCase(), unit: "" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border rounded-lg p-3.5"
              >
                <div className="font-heading text-xl font-extrabold text-primary leading-none">
                  {stat.value}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">
                  {stat.label}
                </div>
                {stat.unit && (
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.unit}</div>
                )}
              </div>
            ))}
          </div>

          {/* Calorie goal cards */}
          <div>
            <div className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-primary mb-3">
              CALORIE TARGETS
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <GoalCard
                label="Maintenance"
                cal={result.maintenance}
                description="Eat this to hold your current weight."
                highlight
              />
              <GoalCard
                label="Fat loss (–500 kcal)"
                cal={result.fatLoss}
                description="Lose ~0.5 kg/week. Sustainable deficit."
              />
              <GoalCard
                label="Aggressive cut (–750 kcal)"
                cal={result.aggressiveFatLoss}
                description="Lose ~0.7 kg/week. Keep protein high."
              />
              <GoalCard
                label="Lean bulk (+300 kcal)"
                cal={result.muscleGain}
                description="Gradual muscle gain with minimal fat."
              />
            </div>
          </div>

          {/* Insights */}
          <div>
            <div className="font-heading text-[11px] font-bold uppercase tracking-[0.28em] text-primary mb-3">
              INSIGHTS
            </div>
            <div className="space-y-2">
              {buildInsights(result).map((text, i) => (
                <Insight key={i} text={text} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TDEECalculator;