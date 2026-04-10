import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { isProSubscriptionStatus } from "@/lib/stripe/subscription";
import { syncUserProfile } from "@/lib/stripe/sync-user-profile";

async function persistSubscription(userId: string, sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  try {
    await syncUserProfile(userId, {
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
    });
  } catch (e) {
    console.error("[stripe/subscription] Could not persist profile (check SUPABASE_SERVICE_ROLE_KEY)", e);
  }
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ isPro: false, isSubscribed: false, status: null });
  }

  const { data: profile } = await supabase
    .from("user_profile")
    .select("subscription_status, stripe_subscription_id, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const p = profile as {
    subscription_status?: string | null;
    stripe_subscription_id?: string | null;
    stripe_customer_id?: string | null;
  } | null;

  let status = p?.subscription_status ?? null;

  if (isProSubscriptionStatus(status)) {
    return NextResponse.json({ isPro: true, isSubscribed: true, status });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      isPro: false,
      isSubscribed: false,
      status,
    });
  }

  const stripe = getStripe();

  try {
    if (p?.stripe_subscription_id) {
      try {
        const sub = await stripe.subscriptions.retrieve(p.stripe_subscription_id);
        await persistSubscription(user.id, sub);
        status = sub.status;
        if (isProSubscriptionStatus(sub.status)) {
          return NextResponse.json({ isPro: true, isSubscribed: true, status });
        }
      } catch {
        // Invalid or removed subscription id — try customer / email lookup
      }
    }

    let customerId = p?.stripe_customer_id ?? null;
    if (!customerId && user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = customers.data[0]?.id ?? null;
    }

    if (customerId) {
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 15,
      });
      const activeSub = subs.data.find((s) => isProSubscriptionStatus(s.status));
      if (activeSub) {
        await persistSubscription(user.id, activeSub);
        return NextResponse.json({ isPro: true, isSubscribed: true, status: activeSub.status });
      }
    }
  } catch (e) {
    console.error("[stripe/subscription]", e);
  }

  const active = isProSubscriptionStatus(status);
  return NextResponse.json({
    isPro: active,
    isSubscribed: active,
    status,
  });
}
