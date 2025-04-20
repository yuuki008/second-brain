"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * ユーザー名を設定するサーバーアクション
 * @param userId - ユーザーID
 * @param username - 設定するユーザー名
 */
export async function setUsernameAction(
  userId: string,
  username: string
): Promise<ActionResult> {
  try {
    // ユーザー名の形式チェック (zodスキーマをここでも適用するか、Prismaレベルの制約に依存)
    // 簡単なチェック:
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return { success: false, error: "ユーザー名の形式が正しくありません。" };
    }

    // ユーザー名の一意性チェック (大文字小文字を区別しない)
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }, // 検索時は小文字に統一
    });

    if (existingUser && existingUser.id !== userId) {
      return {
        success: false,
        error: "このユーザー名は既に使用されています。",
      };
    }

    // ユーザー情報を更新
    await prisma.user.update({
      where: { id: userId },
      data: {
        username: username, // 保存するユーザー名は元のケースを保持
        // 必要であれば name も更新 (Google名から変更可能にする場合)
      },
    });

    // 関連パスを再検証 (ユーザーページ)
    revalidatePath(`/${username}`);

    return { success: true };
  } catch (error) {
    console.error("ユーザー名設定アクションエラー:", error);
    // Prisma の制約違反エラーなどをハンドリングすることも可能
    // if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    //   return { success: false, error: "このユーザー名は既に使用されています。" };
    // }
    return { success: false, error: "データベースエラーが発生しました。" };
  }
}
