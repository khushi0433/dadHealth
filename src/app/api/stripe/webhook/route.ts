import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminSupabaseClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";

const DAD_HEALTH_CLIENT_ID = "00000000-0000-0000-0000-000000000001";

async function syncUserProfile(
  userId: string,
  fields: {
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    subscription_status?: string | null;
  }
) {
  const admin = createAdminSupabaseClient();

  const { data: row } = await admin.from("user_profile").select("id").eq("user_id", userId).maybeSingle();

  const payload = {
    ...fields,
    updated_at: new Date().toISOString(),
  };

  if (row) {
    const { error } = await admin.from("user_profile").update(payload).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await admin.from("user_profile").insert({
      user_id: userId,
      client_id: DAD_HEALTH_CLIENT_ID,
      ...payload,
    });
    if (error) throw error;
  }
}

function getUserIdFromSubscription(sub: Stripe.Subscription): string | undefined {
  return sub.metadata?.supabase_user_id;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId =
          session.metadata?.supabase_user_id ?? session.client_reference_id ?? undefined;
        if (!userId) break;

        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (!customerId || !subId) break;

        const stripe = getStripe();
        const sub = await stripe.subscriptions.retrieve(subId);

        await syncUserProfile(userId, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subId,
          subscription_status: sub.status,
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = getUserIdFromSubscription(sub);
        if (!userId) break;

        const cust = sub.customer;
        const customerId = typeof cust === "string" ? cust : cust.id;
        const status = event.type === "customer.subscription.deleted" ? "canceled" : sub.status;

        await syncUserProfile(userId, {
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          subscription_status: status,
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[stripe/webhook] Handler error", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
