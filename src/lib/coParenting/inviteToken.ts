import jwt from "jsonwebtoken";

const INVITE_TYPE = "co_parent_invite";
/** Invite links are valid for 7 days. */
const INVITE_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface CoParentInvitePayload {
  /** The inviting dad's auth user id. */
  dadUserId: string;
  /** The email address the invite was sent to (lower-cased). */
  email: string;
}

interface SignedInvitePayload extends CoParentInvitePayload {
  type: typeof INVITE_TYPE;
}

function requireSecret(): string {
  const secret = process.env.CO_PARENT_INVITE_SECRET?.trim();
  if (!secret) throw new Error("Missing CO_PARENT_INVITE_SECRET");
  return secret;
}

/** Create a signed, self-contained co-parent invite token. */
export function signInviteToken(payload: CoParentInvitePayload): string {
  const body: SignedInvitePayload = {
    dadUserId: payload.dadUserId,
    email: payload.email.toLowerCase(),
    type: INVITE_TYPE,
  };
  return jwt.sign(body, requireSecret(), { expiresIn: INVITE_TTL_SECONDS });
}

/**
 * Verify an invite token. Returns the payload, or null if the token is
 * invalid, expired, or not a co-parent invite.
 */
export function verifyInviteToken(token: string): CoParentInvitePayload | null {
  try {
    const decoded = jwt.verify(token, requireSecret()) as SignedInvitePayload;
    if (decoded.type !== INVITE_TYPE || !decoded.dadUserId || !decoded.email) {
      return null;
    }
    return { dadUserId: decoded.dadUserId, email: decoded.email };
  } catch {
    return null;
  }
}
