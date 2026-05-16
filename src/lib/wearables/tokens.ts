import crypto from "node:crypto";

const PREFIX = "v1";
const ALGORITHM = "aes-256-gcm";

function getKey() {
  const configured = process.env.WEARABLE_TOKEN_ENCRYPTION_KEY;
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = configured || fallback;

  if (!secret) {
    throw new Error("Missing WEARABLE_TOKEN_ENCRYPTION_KEY or SUPABASE_SERVICE_ROLE_KEY");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptWearableToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [PREFIX, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}
