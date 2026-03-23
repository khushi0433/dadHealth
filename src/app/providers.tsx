"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import ProProvider from "@/components/ProProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import OnboardingCheck from "@/components/OnboardingCheck";
import ClientBrandProvider from "@/components/ClientBrandProvider";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ClientBrandProvider>
            <ProProvider>
              {children}
              <OnboardingCheck />
            </ProProvider>
          </ClientBrandProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

