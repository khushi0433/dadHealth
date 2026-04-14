"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import LimeButton from "@/components/LimeButton";
import { supabase } from "@/utils/supabaseClient";
import type { Provider } from "@supabase/supabase-js";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const OAUTH_PROVIDERS: { provider: Provider; label: string }[] = [
  { provider: "google", label: "Continue with Google" },
  { provider: "apple", label: "Continue with Apple" },
];

export default function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setMessage(null);
    setLoading(false);
    setOauthLoading(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleOAuthSignIn = async (provider: Provider) => {
    setError(null);
    setOauthLoading(provider);
    try {
      const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (oauthError) throw oauthError;
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setOauthLoading(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
        });
        if (signUpError) throw signUpError;
        setMessage("Check your email to confirm your account.");
        setTimeout(handleClose, 2000);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        handleClose();
        onSuccess?.();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-extrabold uppercase tracking-wide">
            {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {mode === "login" ? "Sign in with email or a provider." : "Create an account with email or a provider."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* OAuth buttons */}
          <div className="space-y-2">
            {OAUTH_PROVIDERS.map(({ provider, label }) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleOAuthSignIn(provider)}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 h-11 px-4 border border-border font-heading text-sm font-bold tracking-wide uppercase bg-background text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                {provider === "google" ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13 2.36 1.02 3.85-.14 5.05-1.03 1.2-1.02 2.31-2.09 3.3-3.19 1.08-1.13 2.19-2.17 3.46-2.98.87-.56 1.79-.98 2.71-1.34-.97-.71-1.84-1.59-2.55-2.55-1.02-.07-2.04-.13-3.07-.19-1.03-.06-2.06-.1-3.08-.16-.59-.97-1.23-1.9-1.84-2.88-.6-1-.1-1.88.5-2.77.61-.89 1.12-1.77 1.71-2.65.37-.55.75-1.08 1.15-1.6-1.88-.08-3.77.21-5.55.85zM12.03 7.9c-.15-2.23 1.66-4.07 3.74-4.25 2.08-.18 3.91 1.55 4.05 3.79.12 2.15-1.58 4.18-3.74 4.35-2.16.17-4.06-1.66-4.2-3.89z" />
                  </svg>
                )}
                {oauthLoading === provider ? "..." : label}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-heading font-bold">or</span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-xs font-heading font-bold tracking-wider uppercase text-muted-foreground block mb-1.5">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="font-heading"
            />
          </div>
          <div>
            <label className="text-xs font-heading font-bold tracking-wider uppercase text-muted-foreground block mb-1.5">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="font-heading"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {message && <p className="text-xs text-primary">{message}</p>}
          <LimeButton type="submit" full disabled={loading}>
            {loading ? "..." : mode === "login" ? "SIGN IN" : "SIGN UP"}
          </LimeButton>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setMessage(null);
            }}
            className="w-full text-center font-heading text-[11px] font-bold tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === "login" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
