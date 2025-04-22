"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
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
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (existingUser && existingUser.id !== userId) {
      return {
        success: false,
        error: "このユーザー名は既に使用されています。",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        username,
      },
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("ユーザー名設定アクションエラー:", error);
    return { success: false, error: "データベースエラーが発生しました。" };
  }
}
