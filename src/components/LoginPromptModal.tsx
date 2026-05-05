"use client";

import Logo from "@/components/Logo";
import LimeButton from "@/components/LimeButton";

interface LoginPromptModalProps {
  onClose: () => void;
  onLogin: () => void;
  message?: string;
}

const LoginPromptModal = ({ onClose, onLogin, message }: LoginPromptModalProps) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-[2px]"
    onClick={onClose}
  >
    <div
      className="bg-card border border-border p-8 max-w-sm w-full mx-4 relative shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xl cursor-pointer bg-transparent border-none"
      >
        ×
      </button>
      <Logo className="mb-5" />
      <h2 className="font-heading text-[22px] font-extrabold text-foreground uppercase leading-tight mb-2">
        Sign in to continue
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {message ?? "Sign in or create a free account to continue."}
      </p>
      <LimeButton type="button" full onClick={() => { onLogin(); onClose(); }}>
        SIGN IN →
      </LimeButton>
      <button
        type="button"
        onClick={() => { onLogin(); onClose(); }}
        className="block w-full mt-3 text-center font-heading text-[11px] font-bold tracking-wider uppercase text-muted-foreground cursor-pointer bg-transparent border border-border py-2.5 hover:border-primary hover:text-primary transition-colors"
      >
        CREATE FREE ACCOUNT
      </button>
      <p className="text-[10px] text-muted-foreground text-center mt-4">
        No card required · Cancel anytime
      </p>
    </div>
  </div>
);

export default LoginPromptModal;
