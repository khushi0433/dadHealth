/**
 * Public site origin for Stripe redirects and absolute URLs.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://dadhealth.co.uk).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:8080";
}
