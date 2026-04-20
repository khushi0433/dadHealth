"use client";

import Logo from "@/components/Logo";
import LimeButton from "@/components/LimeButton";

interface PromptModalProps {
  title: string;
  message: string;
  ctaLabel?: string;
  onClose: () => void;
}

const PromptModal = ({ title, message, ctaLabel = "OK", onClose }: PromptModalProps) => (
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
        {title}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">{message}</p>

      <LimeButton type="button" full onClick={onClose}>
        {ctaLabel} →
      </LimeButton>
    </div>
  </div>
);

export default PromptModal;
