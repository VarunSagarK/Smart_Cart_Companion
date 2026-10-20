import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoStoreProvider } from "@/contexts/DemoStoreContext";
import Index from "./pages/Index.tsx";
import AIOnboarding from "./pages/AIOnboarding.tsx";
import Results from "./pages/Results.tsx";
import Basket from "./pages/Basket.tsx";
import Checkout from "./pages/Checkout.tsx";
import Wellness from "./pages/Wellness.tsx";
import MyItems from "./pages/MyItems.tsx";
import SearchPage from "./pages/Search.tsx";
import Account from "./pages/Account.tsx";
import Browse from "./pages/Browse.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DemoStoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ai" element={<AIOnboarding />} />
              <Route path="/results" element={<Results />} />
              <Route path="/basket" element={<Basket />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wellness" element={<Wellness />} />
              <Route path="/my-items" element={<MyItems />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DemoStoreProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
