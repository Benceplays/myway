import { createContext, useContext, useEffect, useState } from "react";
import { loadToken, saveToken, clearToken } from "./auth";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToken().then((token) => {
      setIsLoggedIn(!!token);
      setLoading(false);
    });
  }, []);

  const login = async (token: string) => {
    await saveToken(token);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await clearToken();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
