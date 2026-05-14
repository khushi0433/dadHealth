export type DadDaysBudget = "free" | "under_20" | "over_20";
export type DadDaysChildAge = "toddler" | "primary" | "teen";

export type DadDaysSearchResult = {
  name: string;
  description: string;
  address: string;
  distanceMiles: number;
  estimatedCost: string;
  ageRange: string;
  websiteUrl: string;
  requiresBooking: boolean;
};

