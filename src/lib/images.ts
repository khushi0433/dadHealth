/**
 * Splash / section imagery (client-provided).
 * Files should live in /public so the app can reference them by absolute path.
 */
export const IMAGES = {
  // Home page hero
  hero: "/Hero.jpeg",

  // Dad Strength section
  workout: "/Fitness.jpeg",

  // Pillars / landing thumbnails
  mind: "/MentalHealth.jpeg",
  run: "/Fitness.jpeg",
  food: "/nuttrion.jpeg",
  bond: "/parents.jpeg",
  fitness: "/Fitness.jpeg",
  gym: "/Fitness.jpeg",

  // Keep other keys for compatibility (not currently used on the landing page)
  journal: "/placeholder.svg",
  community: "/placeholder.svg",
  cooking: "/placeholder.svg",
  sleep: "/placeholder.svg",
  meal: "/placeholder.svg",
  park: "/placeholder.svg",
  therapy: "/placeholder.svg",
} as const;

/** Same hero image, wider for Open Graph / Twitter cards */
export const OG_HERO_IMAGE = "/Hero.jpeg";

