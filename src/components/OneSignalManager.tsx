"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

declare global {
  interface Window {
    OneSignal?: any;
    __onesignalScriptAdded?: boolean;
  }
}

function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function ensureOneSignalScript(): void {
  if (typeof window === "undefined") return;
  if (window.__onesignalScriptAdded) return;
  window.__onesignalScriptAdded = true;

  const s = document.createElement("script");
  s.src = "https://cdn.onesignal.com/sdks/OneSignalSDK.js";
  s.async = true;
  document.head.appendChild(s);
}

export function requestOneSignalPermission() {
  if (typeof window === "undefined") return;
  const OneSignal = window.OneSignal;
  if (!OneSignal?.push) return;
  OneSignal.push(() => {
    // Newer SDKs expose prompt helpers; fall back when unavailable.
    if (typeof OneSignal.showSlidedownPrompt === "function") OneSignal.showSlidedownPrompt();
    else if (typeof OneSignal.registerForPushNotifications === "function") OneSignal.registerForPushNotifications();
    else if (typeof OneSignal.showNativePrompt === "function") OneSignal.showNativePrompt();
  });
}

export default function OneSignalManager() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id);

  const appId = useMemo(() => process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID?.trim() || "", []);
  const enabled = Boolean(profile?.push_notifications_enabled);

  useEffect(() => {
    if (!user) return;
    if (!enabled) return;
    if (!appId) return;

    ensureOneSignalScript();
    window.OneSignal = window.OneSignal || [];

    const OneSignal = window.OneSignal;
    OneSignal.push(() => {
      OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
      });
      OneSignal.setExternalUserId(user.id);
    });
  }, [user, enabled, appId]);

  // Opportunistically persist timezone (used server-side for scheduling).
  useEffect(() => {
    // Settings page will explicitly set this too; this just helps new users.
    if (!user) return;
    if (!profile) return;
    const tz = getBrowserTimeZone();
    if (!tz) return;
    if (profile.timezone && profile.timezone.trim() === tz) return;
    // Avoid calling mutations here to keep this component passive.
  }, [user, profile]);

  return null;
}

