"use server";

// ハードコーディングされたパスワード
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * パスワードを検証するサーバーアクション
 * @param password 検証するパスワード
 * @returns パスワードが正しければtrue、そうでなければfalse
 */
export async function verifyPassword(password: string): Promise<boolean> {
  // 実際のアプリケーションでは、データベースからハッシュ化されたパスワードを取得して比較するなど
  // より安全な実装が必要です
  return password === ADMIN_PASSWORD;
}
