"use server";

import * as cheerio from "cheerio";

interface OpenGraphData {
  title: string;
  description: string;
  image: string;
}

export async function getOpenGraphData(
  url: string
): Promise<OpenGraphData | null> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const ogImage = $('meta[property="og:image"]').attr("content") || "";

  // 相対パスを絶対パスに変換する関数
  const resolveUrl = (path: string | undefined) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    return new URL(path, url).toString();
  };

  const title =
    $('meta[property="og:title"]').attr("content") || $("title").text();
  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    "";
  const image = resolveUrl(ogImage);

  if (!title && !description && !image) {
    return null;
  }

  const ogData = {
    title,
    description,
    image,
  };

  return ogData;
}
