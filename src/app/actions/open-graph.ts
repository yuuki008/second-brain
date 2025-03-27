"use server";

import * as cheerio from "cheerio";

interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  url: string;
}

export async function getOpenGraphData(url: string): Promise<OpenGraphData> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const ogImage = $('meta[property="og:image"]').attr("content") || "";

  // 相対パスを絶対パスに変換する関数
  const resolveUrl = (path: string | undefined) => {
    if (!path) return "";
    try {
      return new URL(path, url).toString();
    } catch {
      return "";
    }
  };
  const ogData = {
    title: $('meta[property="og:title"]').attr("content") || $("title").text(),
    description:
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "",
    image: resolveUrl(ogImage),
    url: url,
  };

  return ogData;
}
