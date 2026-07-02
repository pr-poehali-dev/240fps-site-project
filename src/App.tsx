
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import AdminStats from "./pages/AdminStats";
import NotFound from "./pages/NotFound";

const TRACK_URL = "https://functions.poehali.dev/fdc3b327-c084-4a85-af66-47e8827965dc";

function getSessionId() {
  let sid = sessionStorage.getItem("sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("sid", sid);
  }
  return sid;
}

function Tracker() {
  const location = useLocation();
  const tracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    const key = location.pathname;
    if (tracked.current.has(key)) return;
    tracked.current.add(key);

    fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: getSessionId(),
        page: location.pathname,
        referrer: document.referrer,
      }),
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Tracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/admin/stats" element={<AdminStats />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
