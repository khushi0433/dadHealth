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
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [refreshSession]);

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

