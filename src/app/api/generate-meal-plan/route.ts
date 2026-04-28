import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { isProSubscriptionStatus } from '@/lib/stripe/subscription'
import { createServerSupabaseClient } from '@/utils/supabase/server'

const CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
  { category: 'Produce', keywords: ['spinach', 'broccoli', 'tomato', 'lettuce', 'avocado', 'banana', 'apple', 'berry', 'carrot', 'onion', 'zucchini', 'pepper', 'lemon', 'asparagus', 'cucumber', 'kale'] },
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

const getPublicMealPlanError = (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  const status = typeof err === 'object' && err && 'status' in err ? (err as { status?: number }).status : undefined
  const lowerMessage = message.toLowerCase()

  if (
    status === 400 &&
    (lowerMessage.includes('credit balance') ||
      lowerMessage.includes('billing') ||
      lowerMessage.includes('purchase credits'))
  ) {
    return {
      status: 503,
      message:
        'Meal planner is temporarily unavailable because our AI provider needs billing credits. Please try again later or contact support.',
    }
  }

  if (status === 401 || lowerMessage.includes('api key')) {
    return {
      status: 503,
      message: 'Meal planner is temporarily unavailable because the AI service is not configured correctly.',
    }
  }

  if (status === 429 || lowerMessage.includes('rate limit')) {
    return {
      status: 429,
      message: 'Meal planner is busy right now. Please wait a minute and try again.',
    }
  }

  return {
    status: 500,
    message: 'We could not generate your meal plan right now. Please try again shortly.',
  }
}

const LOCAL_MOCK_PLAN = [
  {
    day: 'Day 1',
    meals: {
      breakfast: {
        name: 'Greek yogurt power bowl',
        ingredients: ['Greek yogurt', 'Blueberries', 'Granola', 'Chia seeds'],
        macros: { protein: 28, carbs: 42, fat: 11 },
        prep_time: '5 min',
      },
      lunch: {
        name: 'Chicken rice bowl',
        ingredients: ['Chicken breast', 'Brown rice', 'Spinach', 'Cherry tomatoes'],
        macros: { protein: 38, carbs: 52, fat: 12 },
        prep_time: '20 min',
      },
      dinner: {
        name: 'Turkey taco plates',
        ingredients: ['Ground turkey', 'Corn tortillas', 'Avocado', 'Lettuce'],
        macros: { protein: 34, carbs: 36, fat: 16 },
        prep_time: '25 min',
      },
      snack: {
        name: 'Apple with almond butter',
        ingredients: ['Apple', 'Almond butter'],
        macros: { protein: 6, carbs: 28, fat: 12 },
        prep_time: '2 min',
      },
    },
  },
  {
    day: 'Day 2',
    meals: {
      breakfast: {
        name: 'Egg and avocado toast',
        ingredients: ['Eggs', 'Whole grain bread', 'Avocado', 'Spinach'],
        macros: { protein: 24, carbs: 34, fat: 18 },
        prep_time: '10 min',
      },
      lunch: {
        name: 'Tuna pasta salad',
        ingredients: ['Tuna', 'Whole wheat pasta', 'Cucumber', 'Greek yogurt'],
        macros: { protein: 32, carbs: 45, fat: 10 },
        prep_time: '15 min',
      },
      dinner: {
        name: 'Beef and broccoli stir fry',
        ingredients: ['Lean beef', 'Broccoli', 'Brown rice', 'Soy sauce'],
        macros: { protein: 36, carbs: 48, fat: 14 },
        prep_time: '20 min',
      },
      snack: {
        name: 'Cottage cheese and pineapple',
        ingredients: ['Cottage cheese', 'Pineapple'],
        macros: { protein: 18, carbs: 20, fat: 3 },
        prep_time: '2 min',
      },
    },
  },
  {
    day: 'Day 3',
    meals: {
      breakfast: {
        name: 'Protein oats',
        ingredients: ['Rolled oats', 'Protein powder', 'Banana', 'Milk'],
        macros: { protein: 32, carbs: 58, fat: 9 },
        prep_time: '8 min',
      },
      lunch: {
        name: 'Chicken salad wrap',
        ingredients: ['Chicken breast', 'Whole wheat wrap', 'Lettuce', 'Tomato'],
        macros: { protein: 35, carbs: 38, fat: 11 },
        prep_time: '10 min',
      },
      dinner: {
        name: 'Salmon quinoa tray',
        ingredients: ['Salmon', 'Quinoa', 'Asparagus', 'Lemon'],
        macros: { protein: 36, carbs: 40, fat: 19 },
        prep_time: '25 min',
      },
      snack: {
        name: 'Hummus and carrots',
        ingredients: ['Hummus', 'Carrots'],
        macros: { protein: 7, carbs: 20, fat: 8 },
        prep_time: '2 min',
      },
    },
  },
  {
    day: 'Day 4',
    meals: {
      breakfast: {
        name: 'Smoothie bowl',
        ingredients: ['Protein powder', 'Banana', 'Mixed berries', 'Greek yogurt'],
        macros: { protein: 34, carbs: 46, fat: 8 },
        prep_time: '5 min',
      },
      lunch: {
        name: 'Turkey quinoa bowl',
        ingredients: ['Ground turkey', 'Quinoa', 'Kale', 'Bell pepper'],
        macros: { protein: 37, carbs: 44, fat: 13 },
        prep_time: '20 min',
      },
      dinner: {
        name: 'Shrimp noodle stir fry',
        ingredients: ['Shrimp', 'Whole wheat noodles', 'Broccoli', 'Garlic'],
        macros: { protein: 33, carbs: 50, fat: 9 },
        prep_time: '18 min',
      },
      snack: {
        name: 'Trail mix yogurt',
        ingredients: ['Greek yogurt', 'Mixed nuts', 'Honey'],
        macros: { protein: 20, carbs: 24, fat: 13 },
        prep_time: '3 min',
      },
    },
  },
  {
    day: 'Day 5',
    meals: {
      breakfast: {
        name: 'Scrambled eggs and greens',
        ingredients: ['Eggs', 'Spinach', 'Whole grain bread'],
        macros: { protein: 26, carbs: 30, fat: 15 },
        prep_time: '10 min',
      },
      lunch: {
        name: 'Chicken burrito bowl',
        ingredients: ['Chicken breast', 'Brown rice', 'Black beans', 'Salsa'],
        macros: { protein: 40, carbs: 56, fat: 10 },
        prep_time: '15 min',
      },
      dinner: {
        name: 'Dad chilli',
        ingredients: ['Lean beef', 'Kidney beans', 'Tomato', 'Onion'],
        macros: { protein: 38, carbs: 42, fat: 14 },
        prep_time: '30 min',
      },
      snack: {
        name: 'Protein shake',
        ingredients: ['Protein powder', 'Milk', 'Banana'],
        macros: { protein: 30, carbs: 32, fat: 5 },
        prep_time: '2 min',
      },
    },
  },
]

const getIngredientsFromPlan = (plan: typeof LOCAL_MOCK_PLAN) => {
  const ingredients: string[] = []
  plan.forEach((day) => {
    Object.values(day.meals || {}).forEach((meal) => {
      Array.isArray(meal.ingredients) && meal.ingredients.forEach((ingredient) => ingredients.push(ingredient))
    })
  })
  return ingredients
}

export async function POST(req: Request) {
  try {
    const useLocalMock = process.env.NODE_ENV !== 'production'
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey || (!useLocalMock && !anthropicKey)) {
      const missing = [
        !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
        !serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY',
        !useLocalMock && !anthropicKey && 'ANTHROPIC_API_KEY',
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

    if (!isProSubscriptionStatus((profile as { subscription_status?: string | null } | null)?.subscription_status)) {
      return NextResponse.json({ error: 'Meal planner is a Pro feature' }, { status: 403 })
    }

    const { calorieTarget, preferences, mealsPerDay, adults } = await req.json()

    if (useLocalMock) {
      const plan = LOCAL_MOCK_PLAN
      const groceryList = groupIngredients(getIngredientsFromPlan(plan))

      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          source: 'ai_generated',
          plan,
          grocery_list: groceryList,
          preferences: preferences || null,
          adults: Number(adults) || 1,
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data)
    }

    const prompt = `
Create a 5-day meal plan.

Requirements:
- Calories per day: ${calorieTarget}
- Preferences: ${preferences}
- Meals per day: ${mealsPerDay}
- Adults: ${adults}

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
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find((block) => (block as any)?.type === 'text') as { type: 'text'; text: string } | undefined
    const text = textBlock?.text ?? ''
    const plan = getJsonFromText(text)

    if (!Array.isArray(plan)) {
      throw new Error('Invalid meal plan response from AI')
    }

    const ingredients: string[] = []
    plan.forEach((day: any) => {
      Object.values(day.meals || {}).forEach((meal: any) => {
        Array.isArray(meal.ingredients) && meal.ingredients.forEach((ingredient: string) => ingredients.push(ingredient))
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
        preferences: preferences || null,
        adults: Number(adults) || 1,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    const publicError = getPublicMealPlanError(err)
    console.error('[generate-meal-plan]', err)
    return NextResponse.json({ error: publicError.message }, { status: publicError.status })
  }
}
