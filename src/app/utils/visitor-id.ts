"use client";

import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

const VISITOR_ID_COOKIE = "visitor_id";
const COOKIE_EXPIRY_DAYS = 365;

/**
 * 訪問者IDを取得または生成する
 * @returns 訪問者ID
 */
export function getOrCreateVisitorId(): string {
  // クライアントサイドでのみ実行（SSRでは実行されない）
  if (typeof window === "undefined") {
    return "";
  }

  let visitorId = Cookies.get(VISITOR_ID_COOKIE);

  if (!visitorId) {
    visitorId = uuidv4();
    Cookies.set(VISITOR_ID_COOKIE, visitorId, {
      expires: COOKIE_EXPIRY_DAYS,
      sameSite: "Lax",
      path: "/",
    });
  }

  return visitorId;
}

/**
 * 訪問者IDを取得する
 * @returns 訪問者ID（存在しない場合は空文字）
 */
export function getVisitorId(): string {
  // クライアントサイドでのみ実行
  if (typeof window === "undefined") {
    return "";
  }

  return Cookies.get(VISITOR_ID_COOKIE) || "";
}
