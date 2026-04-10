/**
 * Stripe configuration for Checkout + Billing.
 *
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — safe in the browser (Checkout, Elements).
 * - STRIPE_SECRET_KEY — server only (Route Handlers, webhooks).
 * - STRIPE_WEBHOOK_SECRET — verify webhook signatures.
 * - STRIPE_PRICE_PRO_MONTHLY / STRIPE_PRICE_PRO_ANNUAL — recurring Price IDs from Dashboard.
 */

export const stripePublishableKey =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "" : "";

/** True when the publishable key is set (safe to reference in client components). */
export const isStripePublishableConfigured = Boolean(stripePublishableKey);

const PRICE_ENV_ALIASES = {
  monthly: [
    "STRIPE_PRICE_PRO_MONTHLY",
    "STRIPE_PRICE_MONTHLY",
    "STRIPE_MONTHLY_PRICE_ID",
    "STRIPE_PRO_MONTHLY_PRICE_ID",
  ],
  annual: [
    "STRIPE_PRICE_PRO_ANNUAL",
    "STRIPE_PRICE_ANNUAL",
    "STRIPE_ANNUAL_PRICE_ID",
    "STRIPE_PRO_ANNUAL_PRICE_ID",
  ],
} as const;

export function getStripePlanIdentifier(plan: "monthly" | "annual"): string {
  for (const key of PRICE_ENV_ALIASES[plan]) {
    const value = process.env[key];
    if (value?.trim()) return value.trim();
  }
  return "";
}

export function isStripePriceId(value: string): boolean {
  return value.startsWith("price_");
}

export function isStripeProductId(value: string): boolean {
  return value.startsWith("prod_");
}

export function getTrialDays(): number {
  const raw = process.env.STRIPE_TRIAL_DAYS;
  if (raw === undefined || raw === "") return 7;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 7;
}
