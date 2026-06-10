import { Suspense } from "react";
import BondPageContent from "./BondPageContent";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BondPageContent />
    </Suspense>
  );
}