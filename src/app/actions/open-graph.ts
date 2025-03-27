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

  const ogData = {
    title: $('meta[property="og:title"]').attr("content") || $("title").text(),
    description:
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "",
    image: $('meta[property="og:image"]').attr("content") || "",
    url: url,
  };

  return ogData;
}
