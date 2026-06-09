/**
 * Splash / section imagery (client-provided).
 * Files should live in /public so the app can reference them by absolute path.
 */
export const IMAGES = {
  // Home page hero
  hero: "/Hero.jpeg",

  // Dad Strength section
  workout: "/workout (1).jpg",

  // Pillars / landing thumbnails
  mind: "/MentalHealth.jpeg",
  run: "/runners.jpg",
  food: "/nuttrion.jpeg",
  bond: "/parents.jpeg",
  fitness: "/Fitness.jpeg",

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

