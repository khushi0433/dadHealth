export type WearableProvider = "garmin" | "fitbit";

export function getWearableRedirectUri(provider: WearableProvider, requestUrl: string) {
  const explicit =
    provider === "fitbit"
      ? process.env.FITBIT_REDIRECT_URI
      : process.env.GARMIN_REDIRECT_URI;

  if (explicit) return explicit;

  const url = new URL(requestUrl);
  return `${url.origin}/api/integrations/${provider}/callback`;
}
