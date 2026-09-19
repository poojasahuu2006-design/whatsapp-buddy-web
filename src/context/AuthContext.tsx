import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  user: { email: string; name: string } | null;
  connectedNumber: string | null;
  login: (email: string) => void;
  signup: (email: string) => void;
  completeOnboarding: (number: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);

  const login = (email: string) => {
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    setUser({ email, name });
    setIsAuthenticated(true);
  };

  const signup = (email: string) => {
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    setUser({ email, name });
    setIsAuthenticated(true);
  };

  const completeOnboarding = (number: string) => {
    setConnectedNumber(number);
    setIsOnboarded(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsOnboarded(false);
    setUser(null);
    setConnectedNumber(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isOnboarded, user, connectedNumber, login, signup, completeOnboarding, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
