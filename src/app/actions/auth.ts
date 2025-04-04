"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = "7d";

// Cookie名
const AUTH_COOKIE_NAME = "auth_token";

/**
 * パスワードを検証するサーバーアクション
 * @param password 検証するパスワード
 * @returns JWT認証トークンを含むオブジェクト
 */
export async function verifyPassword(
  password: string
): Promise<{ success: boolean; token?: string }> {
  // パスワードの検証
  if (password !== ADMIN_PASSWORD) {
    return { success: false };
  }

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  // JWTトークンを作成
  const token = jwt.sign(
    {
      isAdmin: true,
      timestamp: Date.now(),
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // HTTPOnlyのCookieに保存（JavaScriptからアクセス不可）
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 本番環境ではhttps通信のみ
    maxAge: 60 * 60 * 24 * 7, // 7日間（秒単位）
    path: "/",
  });

  return { success: true, token };
}

/**
 * ログアウト処理を行うサーバーアクション
 */
export async function logout(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    return { success: true };
  } catch (error) {
    console.error("ログアウトエラー:", error);
    return { success: false };
  }
}

/**
 * JWTトークンを検証するサーバーアクション
 * @returns 検証結果
 */
export async function verifyToken(): Promise<{ isAuthenticated: boolean }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    if (!token) {
      return { isAuthenticated: false };
    }

    // トークンを検証
    jwt.verify(token, JWT_SECRET);
    return { isAuthenticated: true };
  } catch (error) {
    console.error("トークン検証エラー:", error);
    return { isAuthenticated: false };
  }
}

/**
 * 現在の認証状態を取得するサーバーアクション
 */
export async function getAuthStatus(): Promise<{ isAuthenticated: boolean }> {
  return verifyToken();
}
