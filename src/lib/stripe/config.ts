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

export function getPriceId(plan: "monthly" | "annual"): string {
  const id =
    plan === "monthly"
      ? process.env.STRIPE_PRICE_PRO_MONTHLY
      : process.env.STRIPE_PRICE_PRO_ANNUAL;
  return id?.trim() ?? "";
}

export function getTrialDays(): number {
  const raw = process.env.STRIPE_TRIAL_DAYS;
  if (raw === undefined || raw === "") return 7;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 7;
}
