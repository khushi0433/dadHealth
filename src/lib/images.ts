/**
 * Splash / section imagery (client-provided).
 * Files should live in /public so the app can reference them by absolute path.
 */
export const IMAGES = {
  // Home page hero
  hero: "/Hero.png",

  // Dad Strength section
  workout: "/Fitness.png",

  // Pillars / landing thumbnails
  mind: "/MentalHealth.png",
  run: "/Fitness.png",
  food: "/nuttrion.png",
  bond: "/parents.jpeg",
  fitness: "/Fitness.png",
  gym: "/Fitness.png",

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
export const OG_HERO_IMAGE = "/Hero.png";

