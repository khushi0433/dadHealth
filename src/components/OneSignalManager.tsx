"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

declare global {
  interface Window {
    OneSignal?: any;
    OneSignalDeferred?: Array<(oneSignal: any) => void | Promise<void>>;
    __onesignalScriptAdded?: boolean;
    __onesignalInitialized?: boolean;
    __onesignalInitPromise?: Promise<void>;
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
  s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
  s.async = true;
  document.head.appendChild(s);
}

function queueOneSignal(cb: (oneSignal: any) => void | Promise<void>) {
  if (typeof window === "undefined") return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(cb);
}

function getOneSignalAppId(): string {
  return process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID?.trim() || "";
}

async function initOneSignalOnce(oneSignal: any, appId: string): Promise<void> {
  if (!appId) return;
  if (window.__onesignalInitialized) return;
  if (!window.__onesignalInitPromise) {
    window.__onesignalInitPromise = (async () => {
      await oneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
      });
      window.__onesignalInitialized = true;
    })();
  }
  await window.__onesignalInitPromise;
}

export function requestOneSignalPermission() {
  if (typeof window === "undefined") return;
  ensureOneSignalScript();
  const appId = getOneSignalAppId();

  queueOneSignal(async (OneSignal) => {
    await initOneSignalOnce(OneSignal, appId);

    // v16 path
    if (OneSignal?.Notifications?.requestPermission) {
      await OneSignal.Notifications.requestPermission();
      return;
    }
    // Older fallbacks
    if (typeof OneSignal?.showSlidedownPrompt === "function") OneSignal.showSlidedownPrompt();
    else if (typeof OneSignal?.registerForPushNotifications === "function") OneSignal.registerForPushNotifications();
    else if (typeof OneSignal?.showNativePrompt === "function") OneSignal.showNativePrompt();
  });
}

export default function OneSignalManager() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.id);

  const appId = useMemo(() => getOneSignalAppId(), []);
  const enabled = Boolean(profile?.push_notifications_enabled);

  useEffect(() => {
    if (!user) return;
    if (!enabled) return;
    if (!appId) return;

    ensureOneSignalScript();

    queueOneSignal(async (OneSignal) => {
      await initOneSignalOnce(OneSignal, appId);

      // v16 login identity, fallback for older SDK signatures.
      if (typeof OneSignal.login === "function") {
        await OneSignal.login(user.id);
      } else if (typeof OneSignal.setExternalUserId === "function") {
        OneSignal.setExternalUserId(user.id);
      }
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

