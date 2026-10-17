import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('wb_auth') === 'true';
  });
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('wb_onboarded') === 'true';
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wb_user');
    return saved ? JSON.parse(saved) : { email: 'pooja@nexusagency.com', name: 'Pooja Sahu' };
  });
  const [connectedNumber, setConnectedNumber] = useState(() => {
    return localStorage.getItem('wb_phone') || null;
  });
  const [connectionState, setConnectionState] = useState('close'); // 'open', 'close', 'connecting'

  // Poll connection state to sync with real Evolution API status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/connection-state');
        if (res.ok) {
          const data = await res.json();
          const currentState = data.state || 'close';
          setConnectionState(currentState);

          // If WhatsApp gets scanned & connected live, mark onboarding complete and update number
          if (currentState === 'open') {
            setIsOnboarded(true);
            localStorage.setItem('wb_onboarded', 'true');
            if (data.number || data.owner) {
              const formattedPhone = `+${data.number || data.owner}`;
              setConnectedNumber(formattedPhone);
              localStorage.setItem('wb_phone', formattedPhone);
            }
          } else {
            // When disconnected, clear connected phone from active view
            setConnectedNumber(null);
            localStorage.removeItem('wb_phone');
          }
        }
      } catch {
        // network issue
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const login = (email) => {
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const userData = { email, name };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('wb_auth', 'true');
    localStorage.setItem('wb_user', JSON.stringify(userData));
  };

  const signup = (email) => {
    login(email);
  };

  const completeOnboarding = (number) => {
    const phone = number || '+91 87664 38685';
    setConnectedNumber(phone);
    setIsOnboarded(true);
    localStorage.setItem('wb_onboarded', 'true');
    localStorage.setItem('wb_phone', phone);
  };

  const simulateConnection = async (connected = true) => {
    try {
      const res = await fetch('/api/simulate-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connected })
      });
      if (res.ok) {
        setConnectionState(connected ? 'open' : 'close');
        if (connected) {
          completeOnboarding('+91 87664 38685');
        }
      }
    } catch (err) {
      console.error('Failed to simulate connection:', err);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/disconnect', { method: 'POST' });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setIsOnboarded(false);
    setUser(null);
    setConnectedNumber(null);
    setConnectionState('close');
    localStorage.removeItem('wb_auth');
    localStorage.removeItem('wb_user');
    localStorage.removeItem('wb_onboarded');
    localStorage.removeItem('wb_phone');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isOnboarded,
        user,
        connectedNumber,
        connectionState,
        isWhatsAppConnected: connectionState === 'open',
        login,
        signup,
        completeOnboarding,
        simulateConnection,
        logout
      }}
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
