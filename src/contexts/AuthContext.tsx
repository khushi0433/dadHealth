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

  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Supabase lock races can happen under concurrent auth reads in development/hot reload.
      if (message.includes("was released because another request stole it")) {
        return;
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN") {
        trackEvent("login", { method: session?.user?.app_metadata?.provider ?? "password" });
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshSession]);

  useEffect(() => {
    if (user) {
      identifyAnalyticsUser(user.id, {
        email: user.email,
      });
      return;
    }
    resetAnalyticsUser();
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshSession, openAuthModal }}>
      {children}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => setAuthModalOpen(false)} />
    </AuthContext.Provider>
  );
}

