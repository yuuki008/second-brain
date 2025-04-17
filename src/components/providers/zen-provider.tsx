"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";

const ZEN_MODE_COOKIE_KEY = "zenMode";

type ZenContextType = {
  isZenMode: boolean;
  setZenMode: (mode: boolean) => void;
};

const ZenContext = createContext<ZenContextType | undefined>(undefined);

export const ZenProvider = ({ children }: { children: React.ReactNode }) => {
  const [isZenMode, setIsZenModeState] = useState(false);

  // Cookieから禅モードの状態を読み込む
  useEffect(() => {
    const zenModeCookie = Cookies.get(ZEN_MODE_COOKIE_KEY);
    if (zenModeCookie) {
      setIsZenModeState(zenModeCookie === "true");
    }
  }, []);

  // 禅モードを切り替える関数
  const setZenMode = useCallback((mode: boolean) => {
    setIsZenModeState(mode);
    Cookies.set(ZEN_MODE_COOKIE_KEY, String(mode), { expires: 365 });
  }, []);

  return (
    <ZenContext.Provider
      value={{
        isZenMode,
        setZenMode,
      }}
    >
      {children}
    </ZenContext.Provider>
  );
};

export const useZen = () => {
  const context = useContext(ZenContext);
  if (context === undefined) {
    throw new Error("useZen must be used within a ZenProvider");
  }
  return context;
};
