import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import {
  getStripePlanIdentifier,
  getTrialDays,
  isStripePriceId,
  isStripeProductId,
} from "@/lib/stripe/config";
import { getSiteUrl } from "@/lib/site-url";

async function resolveCheckoutPriceId(
  rawIdentifier: string,
  stripe: ReturnType<typeof getStripe>
): Promise<string> {
  if (isStripePriceId(rawIdentifier)) return rawIdentifier;

  if (isStripeProductId(rawIdentifier)) {
    const product = await stripe.products.retrieve(rawIdentifier, { expand: ["default_price"] });
    const defaultPrice = product.default_price;
    if (typeof defaultPrice === "string" && defaultPrice.startsWith("price_")) {
      return defaultPrice;
    }
    if (
      defaultPrice &&
      typeof defaultPrice === "object" &&
      "id" in defaultPrice &&
      typeof defaultPrice.id === "string" &&
      defaultPrice.id.startsWith("price_")
    ) {
      return defaultPrice.id;
    }
    throw new Error(`Product ${rawIdentifier} has no default Stripe price`);
  }

  throw new Error(`Unsupported Stripe plan identifier: ${rawIdentifier}`);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { plan?: "monthly" | "annual" };
    const plan = body.plan === "monthly" ? "monthly" : "annual";
    const rawIdentifier = getStripePlanIdentifier(plan);

    if (!rawIdentifier) {
      return NextResponse.json(
        { error: "Stripe pricing is not configured for this plan." },
        { status: 503 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const stripe = getStripe();
    const priceId = await resolveCheckoutPriceId(rawIdentifier, stripe);
    const origin = getSiteUrl();
    const trialDays = getTrialDays();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=canceled`,
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
        ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout session missing URL" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[stripe/checkout]", e);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
