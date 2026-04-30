import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

type Params = { resource: string };

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key);
}

async function verifyAdmin(): Promise<boolean> {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!adminKey) return false;
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return session === adminKey;
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  context: { params: Promise<Params> },
) {
  const ok = await verifyAdmin();
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { resource } = await context.params;
  const supabase = getAdminSupabase();

  try {
    switch (resource) {
      case "challenges": {
        const { data: challenges, error } = await supabase
          .from("weekly_challenges")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (!challenges || challenges.length === 0) return NextResponse.json([]);

        // Compute real participant counts: distinct users who checked in (mood log)
        // on or after each challenge's created_at date.
        const counts = await Promise.all(
          challenges.map(async (c) => {
            const { count } = await supabase
              .from("mood_logs")
              .select("user_id", { count: "exact", head: true })
              .gte("created_at", c.created_at);
            return { id: c.id, participants_count: count ?? 0 };
          }),
        );

        const countMap = Object.fromEntries(counts.map((r) => [r.id, r.participants_count]));
        const enriched = challenges.map((c) => ({
          ...c,
          participants_count: countMap[c.id] ?? 0,
        }));

        return NextResponse.json(enriched);
      }

      case "recipes": {
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "workouts": {
        const { data, error } = await supabase
          .from("workouts")
          .select("*")
          .eq("source", "admin")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "therapists": {
        const { data, error } = await supabase
          .from("therapists")
          .select("*")
          .order("name");
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "dad_dates": {
        const { data, error } = await supabase
          .from("dad_dates")
          .select("*")
          .order("name");
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "expert_events": {
        const { data, error } = await supabase
          .from("expert_events")
          .select("*")
          .order("event_date", { ascending: true });
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "posts": {
        const { data, error } = await supabase
          .from("posts")
          .select("id, content, tag, anonymous, author_name, author_meta, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "analytics": {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
          .toISOString()
          .slice(0, 10);

        // Run all counts in parallel
        const [dauRes, proRes, weeklyCheckinsRes, totalUsersRes, workoutsRes] =
          await Promise.all([
            // DAU: distinct users with a mood log today
            supabase
              .from("mood_logs")
              .select("user_id", { count: "exact", head: true })
              .eq("date", todayStr),
            // Pro: active or trialing subscriptions
            supabase
              .from("user_profile")
              .select("user_id", { count: "exact", head: true })
              .in("subscription_status", ["active", "trialing"]),
            // Check-ins: mood logs in last 7 days (distinct by date+user)
            supabase
              .from("mood_logs")
              .select("user_id", { count: "exact", head: true })
              .gte("date", weekAgo),
            // Total registered users
            supabase
              .from("user_profile")
              .select("user_id", { count: "exact", head: true }),
            // Workouts logged this week
            supabase
              .from("workout_sessions")
              .select("user_id", { count: "exact", head: true })
              .gte("performed_at", new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()),
          ]);

        return NextResponse.json({
          dau: dauRes.count ?? 0,
          pro_users: proRes.count ?? 0,
          checkins_this_week: weeklyCheckinsRes.count ?? 0,
          total_users: totalUsersRes.count ?? 0,
          workouts_this_week: workoutsRes.count ?? 0,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
    }
  } catch (err) {
    console.error(`[admin GET ${resource}]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── POST (create) ────────────────────────────────────────────────────────────

export async function POST(
  req: Request,
  context: { params: Promise<Params> },
) {
  const ok = await verifyAdmin();
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { resource } = await context.params;
  const supabase = getAdminSupabase();
  const body = await req.json();

  try {
    switch (resource) {
      case "challenges": {
        const { data, error } = await supabase
          .from("weekly_challenges")
          .insert({
            title: body.title,
            description: body.description ?? null,
            active: body.active ?? true,
          })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "recipes": {
        const { data, error } = await supabase
          .from("recipes")
          .insert({
            title: body.title,
            description: body.description ?? null,
            difficulty: body.difficulty,
            age_min: body.age_min,
            prep_mins: body.prep_mins,
            ingredients: body.ingredients ?? [],
            steps: body.steps ?? [],
            cook_together: body.cook_together ?? true,
            image_url: body.image_url ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "workouts": {
        const { data, error } = await supabase
          .from("workouts")
          .insert({
            user_id: null,
            title: body.title,
            duration_mins: body.duration_mins,
            equipment: body.equipment,
            focus: body.focus,
            exercises: body.exercises ?? [],
            source: "admin",
          })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "therapists": {
        const { data, error } = await supabase
          .from("therapists")
          .insert({
            name: body.name,
            spec: body.spec ?? null,
            availability: body.availability ?? null,
            price_per_hour: body.price_per_hour,
          })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "dad_dates": {
        const { data, error } = await supabase
          .from("dad_dates")
          .insert({
            icon: body.icon,
            name: body.name,
            age_range: body.age_range,
            budget: body.budget,
            duration_minutes: body.duration_minutes,
            time_of_day: body.time_of_day ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      case "expert_events": {
        const { data, error } = await supabase
          .from("expert_events")
          .insert({
            title: body.title,
            description: body.description ?? null,
            expert_name: body.expert_name,
            event_date: body.event_date,
            booking_url: body.booking_url ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
    }
  } catch (err) {
    console.error(`[admin POST ${resource}]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── PATCH (update) ───────────────────────────────────────────────────────────

export async function PATCH(
  req: Request,
  context: { params: Promise<Params> },
) {
  const ok = await verifyAdmin();
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { resource } = await context.params;
  const supabase = getAdminSupabase();
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const TABLE_MAP: Record<string, string> = {
    challenges: "weekly_challenges",
    recipes: "recipes",
    workouts: "workouts",
    therapists: "therapists",
    dad_dates: "dad_dates",
    expert_events: "expert_events",
  };

  const table = TABLE_MAP[resource];
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error(`[admin PATCH ${resource}]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(
  req: Request,
  context: { params: Promise<Params> },
) {
  const ok = await verifyAdmin();
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { resource } = await context.params;
  const supabase = getAdminSupabase();
  const { id } = await req.json();

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const TABLE_MAP: Record<string, string> = {
    challenges: "weekly_challenges",
    recipes: "recipes",
    workouts: "workouts",
    therapists: "therapists",
    dad_dates: "dad_dates",
    expert_events: "expert_events",
    posts: "posts",
  };

  const table = TABLE_MAP[resource];
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

  try {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[admin DELETE ${resource}]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
