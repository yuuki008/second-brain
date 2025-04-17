"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

const ZEN_MODE_COOKIE_KEY = "zenMode";

export function useZen() {
  const [isZenMode, setIsZenMode] = useState(false);

  // Cookieから禅モードの状態を読み込む
  useEffect(() => {
    const zenModeCookie = Cookies.get(ZEN_MODE_COOKIE_KEY);
    if (zenModeCookie) {
      setIsZenMode(zenModeCookie === "true");
    }
  }, []);

  // Cookieに禅モードの状態を保存する関数
  const setZenModeCookie = useCallback((mode: boolean) => {
    Cookies.set(ZEN_MODE_COOKIE_KEY, String(mode), { expires: 365 });
  }, []);

  // 禅モードを切り替える関数
  const setZenMode = useCallback(
    (checked: boolean) => {
      setIsZenMode(checked);
      setZenModeCookie(checked);
    },
    [setZenModeCookie]
  );

  console.log(isZenMode);

  return { isZenMode, setZenMode };
}
