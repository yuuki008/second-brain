"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  verifyPassword,
  logout as serverLogout,
  getAuthStatus,
} from "@/app/actions/auth";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // サーバーから認証状態を取得
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { isAuthenticated: authStatus } = await getAuthStatus();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error("認証状態の取得に失敗しました", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await verifyPassword(password);

      if (result.success) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("ログインエラー:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await serverLogout();
      setIsAuthenticated(false);
      window.location.reload();
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
