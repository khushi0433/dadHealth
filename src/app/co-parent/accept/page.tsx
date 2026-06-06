"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SitePageShell from "@/components/SitePageShell";
import LimeButton from "@/components/LimeButton";
import { useAuth } from "@/contexts/AuthContext";
import { useAcceptCoParentInvite } from "@/hooks/useCoParenting";

function AcceptInvite() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { user, loading, openAuthModal } = useAuth();
  const router = useRouter();
  const acceptInvite = useAcceptCoParentInvite();
  const attempted = useRef(false);

  // Once the co-parent is signed in, link the account automatically.
  useEffect(() => {
    if (loading || !user || !token || attempted.current) return;
    attempted.current = true;
    acceptInvite.mutate(token);
  }, [loading, user, token, acceptInvite]);

  let content: React.ReactNode;

  if (!token) {
    content = (
      <p className="text-sm text-muted-foreground">
        This invite link is missing its token. Ask your co-parent to resend the invite.
      </p>
    );
  } else if (loading) {
    content = <p className="text-sm text-muted-foreground">Loading…</p>;
  } else if (!user) {
    content = (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sign in or create your read-only account using the email this invite was sent to.
        </p>
        <LimeButton onClick={openAuthModal}>Sign in / create account</LimeButton>
      </div>
    );
  } else if (acceptInvite.isPending) {
    content = <p className="text-sm text-muted-foreground">Linking your shared calendar…</p>;
  } else if (acceptInvite.isSuccess) {
    content = (
      <div className="space-y-4">
        <p className="text-sm text-foreground">
          You're connected. You now have read-only access to the shared custody calendar.
        </p>
        <LimeButton onClick={() => router.push("/home")}>Continue</LimeButton>
      </div>
    );
  } else if (acceptInvite.isError) {
    content = (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{acceptInvite.error.message}</p>
        <LimeButton
          onClick={() => {
            attempted.current = false;
            acceptInvite.reset();
            acceptInvite.mutate(token);
          }}
        >
          Try again
        </LimeButton>
      </div>
    );
  } else {
    content = <p className="text-sm text-muted-foreground">Preparing your invite…</p>;
  }

  return (
    <section className="w-full max-w-md mx-auto px-5 py-16">
      <span className="section-label !p-0 mb-4 block">CO-PARENTING</span>
      <h1 className="font-heading text-2xl font-extrabold tracking-tight mb-6">Accept invite</h1>
      {content}
    </section>
  );
}

export default function CoParentAcceptPage() {
  return (
    <SitePageShell>
      <Suspense fallback={null}>
        <AcceptInvite />
      </Suspense>
    </SitePageShell>
  );
}
