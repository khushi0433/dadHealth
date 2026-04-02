import { useState, createContext, useContext, ReactNode } from "react";
import { Lock } from "lucide-react";
import Logo from "@/components/Logo";
import LimeButton from "@/components/LimeButton";
import { useAuth } from "@/contexts/AuthContext";
import LoginPromptModal from "@/components/LoginPromptModal";

interface ProContextType {
  isPro: boolean;
  isSubscribed: boolean;
  setPro: (val: boolean) => void;
  setSubscribed: (val: boolean) => void;
  showPaywall: (featureName: string) => void;
}

const ProContext = createContext<ProContextType>({
  isPro: false,
  isSubscribed: false,
  setPro: () => {},
  setSubscribed: () => {},
  showPaywall: () => {},
});

export const useProStatus = () => useContext(ProContext);

export const ProProvider = ({ children }: { children: ReactNode }) => {
  const [isPro, setIsPro] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<string | null>(null);

  const showPaywall = (featureName: string) => {
    if (!isPro) {
      setPaywallFeature(featureName);
    }
  };

  return (
    <ProContext.Provider value={{ isPro, isSubscribed, setPro: setIsPro, setSubscribed: setIsSubscribed, showPaywall }}>
      {children}
      {paywallFeature && (
        <PaywallModal
          featureName={paywallFeature}
          onClose={() => setPaywallFeature(null)}
          onStartTrial={() => {
            setIsPro(true);
            setPaywallFeature(null);
          }}
        />
      )}
    </ProContext.Provider>
  );
};

interface PaywallModalProps {
  featureName: string;
  onClose: () => void;
  onStartTrial: () => void;
}

const PaywallModal = ({ featureName, onClose, onStartTrial }: PaywallModalProps) => {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="bg-card border border-border p-6 max-w-sm w-full mx-4 relative shadow-lg" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-lg cursor-pointer bg-transparent border-none"
        >
          ×
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Logo />
          <span className="tag-pill">PRO</span>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          "<span className="text-primary font-semibold">{featureName}</span>" is a Pro feature.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Upgrade to Dad Health Pro to unlock this and everything below.
        </p>

        {/* Plan toggle */}
        <div className="flex bg-white/5 border border-border p-1 gap-1 mb-6">
          <button
            type="button"
            onClick={() => setPlan("monthly")}
            className={`flex-1 py-2 text-center font-heading text-xs font-bold tracking-wide uppercase cursor-pointer transition-all ${
              plan === "monthly"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            MONTHLY
          </button>
          <button
            type="button"
            onClick={() => setPlan("annual")}
            className={`flex-1 py-2 text-center font-heading text-xs font-bold tracking-wide uppercase cursor-pointer transition-all ${
              plan === "annual"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            ANNUAL
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="font-heading text-[48px] font-extrabold text-primary leading-none">
            {plan === "annual" ? "£4.17" : "£6.99"}
          </div>
          <div className="font-heading text-xs font-bold tracking-wider uppercase text-muted-foreground mt-1">
            {plan === "annual" ? "PER MONTH · BILLED £49.99/YEAR" : "PER MONTH"}
          </div>
        </div>

        <LimeButton type="button" full onClick={onStartTrial}>
          START {plan === "annual" ? "ANNUAL" : "MONTHLY"} PLAN →
        </LimeButton>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          7-day free trial · Cancel anytime
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 text-center font-heading text-[11px] font-bold tracking-wider uppercase text-muted-foreground cursor-pointer bg-transparent border-none hover:text-primary transition-colors"
        >
          See what's included
        </button>
      </div>
    </div>
  );
};

interface ProGateProps {
  children: ReactNode;
  featureName: string;
  lockMessage?: string;
}

export const ProGate = ({ children, featureName, lockMessage }: ProGateProps) => {
  const { isPro, showPaywall } = useProStatus();
  const { user, openAuthModal } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  if (isPro && user) return <>{children}</>;

  const handleUnlock = () => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      showPaywall(featureName);
    }
  };

  return (
    <>
      <div className="relative w-full" onClick={handleUnlock}>
        <div className="opacity-40 pointer-events-none blur-[1px]">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded">
          <Lock
            className="h-8 w-8 text-primary mb-2"
            strokeWidth={2.5}
            aria-hidden="true"
          />
          <div className="font-heading text-[11px] font-bold tracking-wider uppercase text-primary">
            {user ? "PRO FEATURE" : "LOGIN REQUIRED"}
          </div>
          {lockMessage && (
            <p className="text-[10px] text-muted-foreground text-center mt-2 px-3 max-w-xs">
              {lockMessage}
            </p>
          )}
          <button
            type="button"
            onClick={handleUnlock}
            className="mt-3 bg-primary text-primary-foreground font-heading font-bold text-[9px] tracking-wider uppercase px-4 py-2 border-none cursor-pointer hover:brightness-110 transition-all"
          >
            {user ? "Unlock →" : "Sign in →"}
          </button>
        </div>
      </div>
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)}
          onLogin={openAuthModal}
          message="Sign in or create a free account to access this feature."
        />
      )}
    </>
  );
};

export default ProProvider;
