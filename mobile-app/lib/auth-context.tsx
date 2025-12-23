import { createContext, useContext, useEffect, useState } from "react";
import { loadToken, saveToken, clearToken } from "./auth";
import { setToken } from "../lib/api"; // ⬅️ útvonalat igazítsd, ha kell

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

  // 🔁 APP INDULÁS – TOKEN BETÖLTÉSE
  useEffect(() => {
    const initAuth = async () => {
      const token = await loadToken();

      if (token) {
        setToken(token);       // 🔥 API megkapja a tokent
        setIsLoggedIn(true);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // 🔐 LOGIN
  const login = async (token: string) => {
    await saveToken(token);    // AsyncStorage
    setToken(token);           // 🔥 API header
    setIsLoggedIn(true);
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await clearToken();
    setToken(null);            // 🔥 API-ból is töröljük
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
