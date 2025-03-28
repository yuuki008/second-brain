"use server";

import { JSDOM } from "jsdom";

/**
 * Browser を偽造するためのオプション
 * サイト側で DDOS などの攻撃を防ぐために、ブラウザ以外からのアクセスを拒んでいることがある。
 * ブラウザを偽造することで、サイト側にブラウザからのアクセスと判断させることができる。
 */
const browserLikeRequestOptions = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
  cache: "no-store",
  next: { revalidate: 0 },
} as RequestInit;

/**
 * URLからウェブサイトのメタ情報を取得する
 * @param url 対象となるURL
 * @returns メタ情報を含むオブジェクト
 */
export default async function scrapeMetaInfo(url: string): Promise<MetaInfo> {
  try {
    // URLのバリデーション
    if (!isValidUrl(url)) {
      throw new Error("無効なURLです");
    }

    const response = await fetch(url, browserLikeRequestOptions);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      console.error(response);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // DOMパーサーを使用してHTMLを解析
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // メタ情報を抽出
    return {
      title: getTitle(doc),
      description: getDescription(doc),
      thumbnail: getThumbnail(doc),
      ogTitle: getOgProperty(doc, "og:title", url),
      ogDescription: getOgProperty(doc, "og:description", url),
      ogImage: getOgProperty(doc, "og:image", url),
      ogUrl: getOgProperty(doc, "og:url", url),
      ogType: getOgProperty(doc, "og:type", url),
      ogSiteName: getOgProperty(doc, "og:site_name", url),
      twitterCard: getTwitterProperty(doc, "twitter:card"),
      twitterTitle: getTwitterProperty(doc, "twitter:title"),
      twitterDescription: getTwitterProperty(doc, "twitter:description"),
      twitterImage: getTwitterProperty(doc, "twitter:image"),
      canonicalUrl: getCanonicalUrl(doc),
      faviconUrl: getFaviconUrl(doc, url),
    };
  } catch (error) {
    console.error("メタ情報の取得に失敗しました:", error);
    throw error;
  }
}

/**
 * 有効なURLかどうかをチェック
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * ページタイトルを取得
 */
function getTitle(doc: Document): string {
  const titleTag = doc.querySelector("title");
  return titleTag ? titleTag.textContent || "" : "";
}

/**
 * メタディスクリプションを取得
 */
function getDescription(doc: Document): string {
  const metaDescription = doc.querySelector('meta[name="description"]');
  return metaDescription ? metaDescription.getAttribute("content") || "" : "";
}

/**
 * サムネイル画像を取得（OGイメージがない場合は最初の画像を使用）
 */
function getThumbnail(doc: Document): string {
  const ogImage = getOgProperty(doc, "og:image", "");
  if (ogImage) return ogImage;

  const twitterImage = getTwitterProperty(doc, "twitter:image");
  if (twitterImage) return twitterImage;

  const firstImage = doc.querySelector("img");
  return firstImage ? firstImage.getAttribute("src") || "" : "";
}

/**
 * Open Graphプロパティを取得
 */
function getOgProperty(
  doc: Document,
  property: string,
  baseUrl: string
): string {
  const meta = doc.querySelector(`meta[property="${property}"]`);
  if (!meta) return "";

  const content = meta.getAttribute("content") || "";
  if (!content) return "";

  // すでに絶対パスの場合はそのまま返す
  if (content.startsWith("http")) return content;

  // 相対パスの場合は絶対パスに変換
  try {
    const base = new URL(baseUrl);
    return new URL(content, base).toString();
  } catch {
    return content;
  }
}

/**
 * Twitterカードプロパティを取得
 */
function getTwitterProperty(doc: Document, name: string): string {
  const meta = doc.querySelector(`meta[name="${name}"]`);
  return meta ? meta.getAttribute("content") || "" : "";
}

/**
 * canonical URLを取得
 */
function getCanonicalUrl(doc: Document): string {
  const link = doc.querySelector('link[rel="canonical"]');
  return link ? link.getAttribute("href") || "" : "";
}

/**
 * ファビコンURLを取得
 */
function getFaviconUrl(doc: Document, baseUrl: string): string {
  // 様々なファビコン指定方法をチェック
  const icons = [
    doc.querySelector('link[rel="icon"]'),
    doc.querySelector('link[rel="shortcut icon"]'),
    doc.querySelector('link[rel="apple-touch-icon"]'),
  ];

  for (const icon of icons) {
    if (icon && icon.getAttribute("href")) {
      const iconUrl = icon.getAttribute("href") || "";
      // 相対URLの場合は絶対URLに変換
      if (iconUrl.startsWith("/")) {
        try {
          const base = new URL(baseUrl);
          return `${base.origin}${iconUrl}`;
        } catch {
          return iconUrl;
        }
      }
      return iconUrl;
    }
  }

  // ファビコンが見つからない場合はデフォルトのパスを推測
  try {
    const base = new URL(baseUrl);
    return `${base.origin}/favicon.ico`;
  } catch {
    return "/favicon.ico";
  }
}

/**
 * メタ情報の型定義
 */
export interface MetaInfo {
  title: string;
  description: string;
  thumbnail: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  faviconUrl: string;
}
