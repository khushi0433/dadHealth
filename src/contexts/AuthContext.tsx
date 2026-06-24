"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabaseClient";
import AuthModal from "@/components/AuthModal";
import { identifyAnalyticsUser, resetAnalyticsUser, trackEvent } from "@/lib/analytics";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  openAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  openAuthModal: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // refreshSession is kept for components that explicitly need to force a
  // refresh (e.g. after Stripe checkout returns). It is no longer called on
  // mount — onAuthStateChange handles initial session hydration below.
  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("was released because another request stole it")) {
        return;
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    // onAuthStateChange fires synchronously with INITIAL_SESSION on first
    // subscribe, so it both initialises state AND listens for future changes.
    // A separate getSession() call on mount would cause two auth round-trips —
    // that was the source of duplicate auth requests and random session loss.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN") {
        trackEvent("login", {
          method: session?.user?.app_metadata?.provider ?? "password",
        });

        // Associate user profile with white-label client slug if present.
        (async () => {
          try {
            if (!session?.user?.id) return;
            if (typeof document === "undefined") return;
            const m = document.cookie.match(/(?:^|; )client_slug=([^;]+)/);
            const slug = m ? decodeURIComponent(m[1]) : null;
            if (!slug || slug === "dadhealth") return;
            const { data: clientRow, error: clientErr } = await supabase
              .from("clients")
              .select("id")
              .or(`slug.eq.${slug},subdomain.eq.${slug}`)
              .maybeSingle();
            if (clientErr || !clientRow) return;
            await supabase
              .from("user_profile")
              .upsert(
                { user_id: session.user.id, client_id: clientRow.id },
                { onConflict: "user_id" }
              );
          } catch (e) {
            console.error("AuthContext: failed to set user_profile.client_id", e);
          }
        })();
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      identifyAnalyticsUser(user.id, { email: user.email });
      return;
    }
    resetAnalyticsUser();
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signOut, refreshSession, openAuthModal }}
    >
      {children}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </AuthContext.Provider>
  );
}