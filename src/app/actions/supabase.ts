"use server";

import { createClient } from "@/lib/client";
import { v4 as uuidv4 } from "uuid";

export async function uploadFile(file: File): Promise<{ url: string }> {
  const supabase = createClient();
  const fileId = uuidv4();
  const { error, data } = await supabase.storage
    .from("files")
    .upload(`${fileId}.${file.type.split("/")[1]}`, file);

  if (error) {
    throw new Error(error.message);
  }

  const { data: url } = supabase.storage.from("files").getPublicUrl(data.path);

  return {
    url: url.publicUrl,
  };
}
