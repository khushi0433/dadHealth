import crypto from "node:crypto";

type StatePayload = {
  provider: "garmin" | "fitbit";
  userId: string;
  iat: number;
  nonce: string;
};

function getSecret() {
  const secret =
    process.env.OAUTH_STATE_SECRET ||
    process.env.WEARABLE_TOKEN_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Missing OAUTH_STATE_SECRET or SUPABASE_SERVICE_ROLE_KEY");
  }

  return secret;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

export function createOAuthState(provider: StatePayload["provider"], userId: string) {
  const payload: StatePayload = {
    provider,
    userId,
    iat: Math.floor(Date.now() / 1000),
    nonce: crypto.randomBytes(16).toString("base64url"),
  };
  const body = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");

  return `${body}.${signature}`;
}

export function verifyOAuthState(state: string | null, provider: StatePayload["provider"]) {
  if (!state) return null;

  const [body, signature] = state.split(".");
  if (!body || !signature) return null;

  const expected = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as StatePayload;
  const ageSeconds = Math.floor(Date.now() / 1000) - payload.iat;

  if (payload.provider !== provider || ageSeconds > 10 * 60) return null;
  return payload;
}
