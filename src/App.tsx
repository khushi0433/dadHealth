import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProProvider from "@/components/ProProvider";
import Index from "./pages/Index.tsx";
import FitnessPage from "./pages/FitnessPage.tsx";
import MindPage from "./pages/MindPage.tsx";
import BondPage from "./pages/BondPage.tsx";
import CommunityPage from "./pages/CommunityPage.tsx";
import ProgressPage from "./pages/ProgressPage.tsx";
import PricingPage from "./pages/PricingPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ProProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/fitness" element={<FitnessPage />} />
            <Route path="/mind" element={<MindPage />} />
            <Route path="/bond" element={<BondPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
