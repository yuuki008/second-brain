"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

/**
 * 用語の定義を更新するサーバーアクション
 * @param termId - 更新する用語のID
 * @param definition - 新しい定義内容
 */
export async function updateTermDefinition(termId: string, definition: string) {
  try {
    // Prismaを使用してデータベースを直接更新
    await prisma.node.update({
      where: { id: termId },
      data: {
        content: definition,
        updatedAt: new Date(),
      },
    });

    // キャッシュを再検証して最新データを表示
    revalidatePath(`/term/${termId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating term definition:", error);
    return { success: false, error: (error as Error).message };
  }
}
