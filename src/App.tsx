import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Tariffs from "./pages/Tariffs";
import Checker from "./pages/Checker";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";

const queryClient = new QueryClient();

export interface User {
  username: string;
  email: string;
  plan: string | null;
  planExpiry: string | null;
  attempts: number;
  maxAttempts: number;
  balance: number;
  registeredAt: string;
}

export interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  showAuth: boolean;
  setShowAuth: (v: boolean) => void;
  authTab: 'login' | 'register';
  setAuthTab: (t: 'login' | 'register') => void;
}

import { createContext, useContext } from "react";
export const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

const App = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('sa_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const setUserAndSave = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem('sa_user', JSON.stringify(u));
    else localStorage.removeItem('sa_user');
  };

  return (
    <AppContext.Provider value={{ user, setUser: setUserAndSave, showAuth, setShowAuth, authTab, setAuthTab }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="net-bg min-h-screen">
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tariffs" element={<Tariffs />} />
                <Route path="/checker" element={<Checker />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              {showAuth && <AuthModal />}
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AppContext.Provider>
  );
};

export default App;
