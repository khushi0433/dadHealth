"use client";

import posthog from "posthog-js";

type EventProperties = Record<string, unknown>;

let initialized = false;

function canUseAnalytics() {
  return typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

export function initAnalytics() {
  if (!canUseAnalytics() || initialized) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
  });

  initialized = true;
}

export function trackEvent(event: string, properties: EventProperties = {}) {
  if (!canUseAnalytics()) return;
  initAnalytics();
  posthog.capture(event, properties);
}

export function identifyAnalyticsUser(userId: string, properties: EventProperties = {}) {
  if (!canUseAnalytics()) return;
  initAnalytics();
  posthog.identify(userId, properties);
}

export function resetAnalyticsUser() {
  if (typeof window === "undefined" || !initialized) return;
  posthog.reset();
}
