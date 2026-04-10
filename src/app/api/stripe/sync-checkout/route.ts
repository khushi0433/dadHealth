import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { syncUserProfile } from "@/lib/stripe/sync-user-profile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const body = (await request.json()) as { sessionId?: string };
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid checkout session" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.mode !== "subscription") {
      return NextResponse.json({ error: "Not a subscription checkout" }, { status: 400 });
    }

    const sessionUserId =
      session.client_reference_id ?? session.metadata?.supabase_user_id ?? undefined;
    if (!sessionUserId || sessionUserId !== user.id) {
      return NextResponse.json({ error: "Session does not belong to this account" }, { status: 403 });
    }

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subExpanded = session.subscription;
    const subId =
      typeof subExpanded === "string"
        ? subExpanded
        : subExpanded && typeof subExpanded === "object" && "id" in subExpanded
          ? (subExpanded as Stripe.Subscription).id
          : null;

    let status: string | null = null;
    if (typeof subExpanded === "object" && subExpanded && "status" in subExpanded) {
      status = (subExpanded as Stripe.Subscription).status;
    } else if (subId) {
      const sub = await stripe.subscriptions.retrieve(subId);
      status = sub.status;
    }

    if (!customerId || !subId || !status) {
      return NextResponse.json({ error: "Subscription not ready yet" }, { status: 422 });
    }

    await syncUserProfile(user.id, {
      stripe_customer_id: customerId,
      stripe_subscription_id: subId,
      subscription_status: status,
    });

    return NextResponse.json({ ok: true, status });
  } catch (e) {
    console.error("[stripe/sync-checkout]", e);
    return NextResponse.json({ error: "Could not sync subscription" }, { status: 500 });
  }
}
