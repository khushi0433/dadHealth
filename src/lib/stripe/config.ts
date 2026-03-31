/**
 * Stripe placeholders — install `stripe` and wire Checkout or Billing when ready.
 *
 * - Use NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in the browser (Checkout, Elements).
 * - Keep STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET only in server code (Route Handlers,
 *   Server Actions). Do not pass secrets to client components.
 */

export const stripePublishableKey =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "" : "";

export const isStripeConfigured = Boolean(stripePublishableKey);
