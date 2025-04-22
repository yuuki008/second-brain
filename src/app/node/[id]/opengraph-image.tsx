export const revalidate = 60;

import { getNode } from "./actions";
import { ImageResponse } from "next/og";
import fs from "fs/promises";
import path from "path";
import { getUser } from "@/app/actions/user";

export const alt = "Second Brain";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  const { id } = params;

  const node = await getNode(id);
  if (!node) {
    return new Response("Not found", { status: 404 });
  }

  const user = await getUser(node.userId);

  const fontPath300 = path.join(
    process.cwd(),
    "public",
    "fonts",
    "noto-sans-jp-latin-300-normal.woff"
  );
  const fontPath500 = path.join(
    process.cwd(),
    "public",
    "fonts",
    "noto-sans-jp-latin-500-normal.woff"
  );
  const fontPath900 = path.join(
    process.cwd(),
    "public",
    "fonts",
    "noto-sans-jp-latin-900-normal.woff"
  );

  const [notoSansJp300, notoSansJp500, notoSansJp900] = await Promise.all([
    fs.readFile(fontPath300),
    fs.readFile(fontPath500),
    fs.readFile(fontPath900),
  ]);

  return new ImageResponse(
    (
      <div
        tw="flex flex-col justify-between px-15 py-20 h-full w-full bg-gray-900 text-white"
        style={font("Inter 300")}
      >
        <main tw="flex items-center">
          <div tw="flex-1 flex flex-col">
            <div
              tw="text-7xl font-bold text-white"
              style={{
                ...font("Noto Sans JP 900"),
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {node.name}
            </div>
          </div>
        </main>

        <div tw="w-full flex justify-between">
          <div tw="flex items-center">
            {user?.image ? (
              <img
                tw="rounded-full w-20 h-20 mr-6"
                src={user?.image || ""}
                alt={user?.username || ""}
              />
            ) : (
              <div tw="rounded-full flex w-20 h-20 mr-6 bg-gray-400" />
            )}

            <div tw="text-4xl" style={font("Noto Sans JP 500")}>
              {user?.username || ""}
            </div>
          </div>

          <img
            tw="rounded-full w-32 h-32"
            src={process.env.NEXT_PUBLIC_URL + "dark-sign.png"}
            alt="second brain"
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans JP 300",
          data: notoSansJp300,
        },
        {
          name: "Noto Sans JP 500",
          data: notoSansJp500,
        },
        {
          name: "Noto Sans JP 900",
          data: notoSansJp900,
        },
      ],
    }
  );
}

function font(fontFamily: string) {
  return { fontFamily };
}
