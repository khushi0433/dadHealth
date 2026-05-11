import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { isProSubscriptionStatus } from '@/lib/stripe/subscription'
import { createServerSupabaseClient } from '@/utils/supabase/server'

const CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
  { category: 'Produce', keywords: ['spinach', 'broccoli', 'tomato', 'lettuce', 'avocado', 'banana', 'apple', 'berry', 'carrot', 'onion', 'zucchini', 'courgette', 'pepper', 'lemon', 'asparagus', 'cucumber', 'kale', 'aubergine'] },
  { category: 'Protein', keywords: ['chicken', 'turkey', 'beef', 'pork', 'salmon', 'tuna', 'shrimp', 'egg', 'yogurt', 'cottage cheese', 'protein powder', 'tofu'] },
  { category: 'Grains', keywords: ['rice', 'quinoa', 'pasta', 'oat', 'bread', 'wrap', 'tortilla', 'granola'] },
  { category: 'Dairy', keywords: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'cottage cheese'] },
  { category: 'Pantry', keywords: ['oil', 'salt', 'pepper', 'soy sauce', 'broth', 'honey', 'almond butter', 'maple syrup', 'nuts', 'seeds', 'hummus'] },
  { category: 'Herbs & Spices', keywords: ['garlic', 'basil', 'cumin', 'paprika', 'oregano', 'turmeric', 'ginger'] },
]

const classifyIngredient = (ingredient: string) => {
  const normalized = ingredient.toLowerCase();
  const match = CATEGORY_RULES.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  return match?.category ?? 'Other';
}

const groupIngredients = (ingredients: string[]) => {
  const cleanMap = new Map<string, string>()
  ingredients.forEach((ingredient) => {
    const key = ingredient.trim()
    if (key) {
      const normalized = key.toLowerCase()
      if (!cleanMap.has(normalized)) {
        cleanMap.set(normalized, key)
      }
    }
  })

  const buckets: Record<string, string[]> = {}

  Array.from(cleanMap.values()).forEach((ingredient) => {
    const category = classifyIngredient(ingredient)
    buckets[category] = buckets[category] ?? []
    buckets[category].push(ingredient)
  })

  return Object.entries(buckets).map(([category, items]) => ({ category, items }))
}

const getJsonFromText = (text: string) => {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const firstArray = cleaned.indexOf('[')
    const lastArray = cleaned.lastIndexOf(']')
    if (firstArray >= 0 && lastArray > firstArray) {
      return JSON.parse(cleaned.slice(firstArray, lastArray + 1))
    }
    throw new Error('AI returned invalid JSON')
  }
}

const getMealPlanErrorDetails = (err: unknown) => {
  const error = err as {
    name?: string
    message?: string
    status?: number
    code?: string
    type?: string
    request_id?: string
    response?: {
      status?: number
      data?: {
        error?: {
          message?: string
          type?: string
          code?: string
          status?: number
          request_id?: string
        }
      }
    }
    error?: {
      message?: string
      type?: string
      code?: string
      status?: number
      request_id?: string
    }
  }

  const providerError = error?.response?.data?.error ?? error?.error
  const message = [
    error?.message,
    providerError?.message,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || String(err)

  return {
    name: error?.name,
    status: error?.status ?? error?.response?.status ?? providerError?.status,
    type: error?.type ?? providerError?.type,
    code: error?.code ?? providerError?.code,
    requestId: error?.request_id ?? providerError?.request_id,
    message,
  }
}

const getPublicMealPlanError = (err: unknown) => {
  const details = getMealPlanErrorDetails(err)
  const lowerMessage = details.message.toLowerCase()
  const lowerType = String(details.type ?? '').toLowerCase()
  const lowerCode = String(details.code ?? '').toLowerCase()

  if (
    lowerMessage.includes('credit balance') ||
    lowerMessage.includes('balance is too low') ||
    lowerMessage.includes('purchase credits') ||
    lowerMessage.includes('insufficient credits') ||
    lowerMessage.includes('quota') ||
    lowerType.includes('billing') ||
    lowerCode.includes('billing') ||
    lowerCode.includes('quota') ||
    (
      details.status === 400 &&
      (lowerMessage.includes('billing') ||
        lowerMessage.includes('credit') ||
        lowerMessage.includes('balance'))
    ) ||
    (
      details.status === 403 &&
      (lowerMessage.includes('billing') ||
        lowerMessage.includes('credit') ||
        lowerMessage.includes('balance'))
    )
  ) {
    return {
      status: 503,
      message:
        'Meal planner is temporarily unavailable. Please try again later or contact support.',
    }
  }

  if (
    details.status === 401 ||
    details.status === 403 ||
    lowerType.includes('authentication') ||
    lowerType.includes('permission') ||
    lowerMessage.includes('api key') ||
    lowerMessage.includes('x-api-key') ||
    lowerMessage.includes('not authorized') ||
    lowerMessage.includes('permission')
  ) {
    return {
      status: 503,
      message: 'Meal planner is temporarily unavailable because the AI service is not configured correctly.',
    }
  }

  if (
    details.status === 429 ||
    lowerType.includes('rate') ||
    lowerCode.includes('rate') ||
    lowerMessage.includes('rate limit')
  ) {
    return {
      status: 429,
      message: 'Meal planner is busy right now. Please wait a minute and try again.',
    }
  }

  if (lowerMessage.includes('invalid json') || lowerMessage.includes('ai returned invalid json')) {
    return {
      status: 502,
      message: 'Meal planner returned an unreadable plan. Please try again.',
    }
  }

  if (lowerMessage.includes('server is missing required configuration')) {
    return {
      status: 503,
      message: 'Meal planner is temporarily unavailable because the server is not configured correctly.',
    }
  }

  return {
    status: 500,
    message: 'We could not generate your meal plan right now. Please try again shortly.',
  }
}

const logMealPlanError = (err: unknown) => {
  const details = getMealPlanErrorDetails(err)

  console.error('[generate-meal-plan] failed', {
    ...details,
    raw: err,
  })
}

const isLikelyBillingProviderError = (details: ReturnType<typeof getMealPlanErrorDetails>) => {
  const raw = JSON.stringify(details).toLowerCase()
  const hasBillingKeyword =
    raw.includes('credit') ||
    raw.includes('balance') ||
    raw.includes('billing') ||
    raw.includes('quota') ||
    raw.includes('insufficient')

  const status = Number(details.status ?? 0)
  const hasBillingStatus = status === 400 || status === 402 || status === 403 || status === 429
  const fromAnthropic =
    raw.includes('anthropic') ||
    raw.includes('claude') ||
    String(details.name ?? '').toLowerCase().includes('anthropic')

  return hasBillingKeyword && (hasBillingStatus || fromAnthropic)
}

type MealEntry = {
  name: string
  ingredients: string[]
  macros: Record<string, number>
  prep_time: string
}

type MealPlanDay = {
  day: string
  meals: {
    breakfast: MealEntry
    lunch: MealEntry
    dinner: MealEntry
    snack: MealEntry
  }
}

const buildFallbackMealPlan = (calorieTarget: number, adults: number): MealPlanDay[] => {
  const safeAdults = Math.max(1, Number.isFinite(adults) ? adults : 1)
  const calories = Math.max(1600, Number.isFinite(calorieTarget) ? calorieTarget : 2200)
  const perMeal = Math.round(calories / 4)
  const proteinPerMeal = Math.max(20, Math.round((calories * 0.3) / 4 / 4))
  const carbsPerMeal = Math.max(20, Math.round((calories * 0.4) / 4 / 4))
  const fatPerMeal = Math.max(8, Math.round((calories * 0.3) / 4 / 9))
  const portions = safeAdults > 1 ? ` (x${safeAdults})` : ''

  const dayMeals = [
    ['Greek yoghurt bowl', ['Greek yoghurt', 'Mixed berries', 'Oats', 'Honey']],
    ['Chicken rice bowl', ['Chicken breast', 'Brown rice', 'Spinach', 'Olive oil']],
    ['Turkey chilli', ['Turkey mince', 'Kidney beans', 'Tomatoes', 'Onion']],
    ['Apple and nut butter', ['Apple', 'Almond butter']],
    ['Protein oats', ['Rolled oats', 'Milk', 'Protein powder', 'Banana']],
    ['Tuna wrap', ['Tuna', 'Wholemeal wrap', 'Lettuce', 'Greek yoghurt']],
    ['Salmon tray bake', ['Salmon', 'Potatoes', 'Broccoli', 'Olive oil']],
    ['Cottage cheese snack', ['Cottage cheese', 'Pineapple']],
    ['Egg scramble toast', ['Eggs', 'Wholemeal toast', 'Spinach', 'Tomato']],
    ['Turkey pasta', ['Turkey mince', 'Wholewheat pasta', 'Tomato sauce', 'Parmesan']],
    ['Beef stir fry', ['Lean beef', 'Rice', 'Peppers', 'Soy sauce']],
    ['Yoghurt and nuts', ['Greek yoghurt', 'Mixed nuts']],
    ['Smoothie bowl', ['Protein powder', 'Banana', 'Berries', 'Chia seeds']],
    ['Chicken quinoa salad', ['Chicken breast', 'Quinoa', 'Cucumber', 'Avocado']],
    ['Prawn noodle stir fry', ['Prawns', 'Noodles', 'Broccoli', 'Garlic']],
    ['Hummus and carrots', ['Hummus', 'Carrots']],
    ['Overnight oats', ['Rolled oats', 'Greek yoghurt', 'Blueberries', 'Honey']],
    ['Chicken fajita bowl', ['Chicken breast', 'Rice', 'Peppers', 'Onion']],
    ['Beef and veg skillet', ['Lean beef', 'Courgette', 'Tomatoes', 'Garlic']],
    ['Protein shake', ['Protein powder', 'Milk', 'Banana']],
  ] as const

  const makeMeal = (idx: number): MealEntry => {
    const [name, ingredients] = dayMeals[idx]
    return {
      name: `${name}${portions}`,
      ingredients: [...ingredients],
      macros: {
        protein: proteinPerMeal,
        carbs: carbsPerMeal,
        fat: fatPerMeal,
      },
      prep_time: '15-25 min',
    }
  }

  return Array.from({ length: 5 }, (_, i) => ({
    day: `Day ${i + 1}`,
    meals: {
      breakfast: makeMeal(i * 4),
      lunch: makeMeal(i * 4 + 1),
      dinner: makeMeal(i * 4 + 2),
      snack: makeMeal(i * 4 + 3),
    },
  }))
}

export const maxDuration = 60

export async function POST(req: Request) {
  let requestBody: {
    calorieTarget?: number
    preferences?: string
    mealsPerDay?: number
    adults?: number
  } | null = null

  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!anthropicKey || !supabaseUrl || !serviceRoleKey) {
      const missing = [
        !anthropicKey && 'ANTHROPIC_API_KEY',
        !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
        !serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY',
      ].filter(Boolean)

      console.error('[generate-meal-plan] Missing env vars:', missing)
      return NextResponse.json(
        { error: `Server is missing required configuration: ${missing.join(', ')}` },
        { status: 503 },
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const authSupabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await authSupabase
      .from('user_profile')
      .select('subscription_status')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('PROFILE DEBUG', {
      userId: user.id,
      subscription_status: (profile as { subscription_status?: string | null } | null)?.subscription_status,
    })

    if (!isProSubscriptionStatus((profile as { subscription_status?: string | null } | null)?.subscription_status)) {
      return NextResponse.json({ error: 'Meal planner is a Pro feature' }, { status: 403 })
    }

    const { calorieTarget, preferences, mealsPerDay, adults } = await req.json()
    requestBody = { calorieTarget, preferences, mealsPerDay, adults }

    console.info('[generate-meal-plan] request', {
      userId: user.id,
      calorieTarget,
      mealsPerDay,
      adults,
      hasPreferences: Boolean(preferences),
      nodeEnv: process.env.NODE_ENV,
    })

    const anthropic = new Anthropic({
  apiKey: anthropicKey,
  timeout: 40000,
  maxRetries: 0,
})

    const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

    // ── Variety seed: unique per request so Claude never returns a cached/similar plan ──
    const varietySeed = Math.random().toString(36).substring(2, 8)
    const weekOffset = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7))

    const prompt = `
Create a 5-day meal plan. Session: ${varietySeed}-${weekOffset}

Requirements:
- Calories per day: ${calorieTarget}
- Preferences: ${preferences}
- Meals per day: ${mealsPerDay}
- Adults: ${adults}
- Use British English spelling and wording only (for example: favourite, yoghurt, courgette, aubergine, mince, wholemeal).
- Use UK context where examples are needed, with a natural Manchester/United Kingdom tone.
- Use metric measurements for ingredients and prep directions (g, kg, ml, l, tsp, tbsp).
- Keep meal names and ingredient choices realistic for UK supermarkets.
- Keep the response culturally neutral and practical for families living in the UK.
- IMPORTANT: Generate COMPLETELY DIFFERENT meals each time — never repeat the same meal twice across the 5 days.
- Vary cuisines across the week: include at least 2 different cultural influences (e.g. Italian, Asian, Mexican, Middle Eastern, British).
- Vary protein sources each day — do not use the same main protein on consecutive days.
- Keep every ingredient list under 4 items.
- Keep meal names short.
- Keep macros compact using only protein, carbs, fat.
- Do not include explanations or notes.

Return ONLY JSON in this format:
[
  {
    "day": "Day 1",
    "meals": {
      "breakfast": { "name": "", "ingredients": [], "macros": {}, "prep_time": "" },
      "lunch": { "name": "", "ingredients": [], "macros": {}, "prep_time": "" },
      "dinner": { "name": "", "ingredients": [], "macros": {}, "prep_time": "" },
      "snack": { "name": "", "ingredients": [], "macros": {}, "prep_time": "" }
    }
  }
]
`

    const response = await anthropic.messages.create({
  model: anthropicModel,
  max_tokens: 4000,
  temperature: 0.2,
  system: 'You are a meal planning API. Return ONLY valid JSON.',
  messages: [{ role: 'user', content: prompt }],
}) as Anthropic.Message


    const textBlock = response.content.find((block) => {
      return (block && typeof block === 'object' && (block as { type?: unknown }).type === 'text')
    }) as { type: 'text'; text: string } | undefined

    const text = textBlock?.text ?? ''
    console.log(text);
    const plan = getJsonFromText(text)

    if (!Array.isArray(plan)) {
      throw new Error('Invalid meal plan response from AI')
    }

    const ingredients: string[] = []
    type AiMeal = { ingredients?: unknown }
    type AiDay = { meals?: Record<string, AiMeal> }

    plan.forEach((day: AiDay) => {
      Object.values(day.meals ?? {}).forEach((meal) => {
        if (Array.isArray(meal.ingredients)) {
          meal.ingredients.forEach((ingredient) => {
            if (typeof ingredient === 'string') ingredients.push(ingredient)
          })
        }
      })
    })


    const groceryList = groupIngredients(ingredients)

    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        user_id: user.id,
        source: 'ai_generated',
        plan,
        grocery_list: groceryList,
        preferences: preferences ? { text: preferences } : null,
        adults: Number(adults) || 1,
      })
      .select()
      .single()

    if (error) throw error

    console.info('[generate-meal-plan] saved', {
      userId: user.id,
      mealPlanId: data?.id,
      grocerySections: Array.isArray(groceryList) ? groceryList.length : 0,
    })

    return NextResponse.json(data)
  } catch (err) {
    // Add extra context for Anthropic issues (helps diagnose prod 404s)
    const details = getMealPlanErrorDetails(err)
    console.error('[generate-meal-plan] context', {
      anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
      supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      providerStatus: details.status,
      providerType: details.type,
      providerCode: details.code,
      providerRequestId: details.requestId,
      providerMessage: details.message,
      raw: err,
    })

    logMealPlanError(err)

    const isBillingIssue = isLikelyBillingProviderError(details)

    if (isBillingIssue) {
      try {

        const calorieTarget = Number(requestBody?.calorieTarget) || 2200
        const adults = Number(requestBody?.adults) || 1
        const preferences =
          typeof requestBody?.preferences === 'string'
            ? requestBody.preferences.trim()
            : ''

        const plan = buildFallbackMealPlan(calorieTarget, adults)
        const ingredients: string[] = []

        plan.forEach((day) => {
          Object.values(day.meals).forEach((meal) => {
            meal.ingredients.forEach((ingredient) => ingredients.push(ingredient))
          })
        })

        const groceryList = groupIngredients(ingredients)

        return NextResponse.json(
          {
            source: 'fallback',
            plan,
            grocery_list: groceryList,
            preferences: preferences ? { text: preferences } : null,
            adults,
            warning: 'Fallback meal plan used because AI credits are unavailable.',
          },
          { status: 200 },
        )
      } catch (fallbackErr) {
        console.error('Fallback failed:', fallbackErr)
      }
    }

    const publicError = getPublicMealPlanError(err)

    let extraMessage: string | null = null

    const message = String(details.message ?? '').toLowerCase()

    if (details.status === 404) {
      extraMessage =
        'The meal planning service is temporarily unavailable. Please try again in a few minutes.'
    } else if (details.status === 401 || details.status === 403) {
      extraMessage =
        'The AI service is currently unavailable. Please try again later.'
    } else if (details.status === 429) {
      extraMessage =
        'Too many requests right now. Please wait a minute and try again.'
    } else if (message.includes('timeout')) {
      extraMessage =
        'The meal planner took too long to respond. Please try again.'
    } else if (message.includes('invalid json')) {
      extraMessage =
        'The AI returned an invalid meal plan. Please try again.'
    }

    return NextResponse.json(
      { error: extraMessage ?? publicError.message },
      { status: publicError.status },
    )

  }
}