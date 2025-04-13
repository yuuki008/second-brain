export const revalidate = 60;

import { getNode } from "./actions";
import dayjs from "dayjs";
import { ImageResponse } from "next/og";

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

  console.log(import.meta.url);

  const notoSansJp300 = fetch(
    new URL("./fonts/noto-sans-jp-latin-300-normal.woff", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const notoSansJp700 = fetch(
    new URL("./fonts/noto-sans-jp-latin-700-normal.woff", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const formattedCreatedAt = dayjs(node.createdAt).format("MMMM D, YYYY");

  return new ImageResponse(
    (
      <div
        tw="flex p-10 h-full w-full bg-[#000] text-white flex-col justify-center"
        style={font("Inter 300")}
      >
        <main tw="flex items-center ml-10">
          <img
            tw="rounded-full w-50 h-50 mr-10"
            src={process.env.NEXT_PUBLIC_URL + "profile.jpg"}
            alt="yuuki008"
          />

          <div tw="flex-1 flex flex-col">
            <div tw="flex items-center mb-3">
              <div tw="text-gray-400 text-3xl" style={font("Noto Sans JP 300")}>
                Yuuki008
              </div>
            </div>
            <div
              tw="text-7xl font-bold text-white"
              style={{
                ...font("Noto Sans JP 700"),
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

        <div
          tw="absolute bottom-4 right-4 flex text-2xl text-gray-400"
          style={font("Noto Sans JP 300")}
        >
          {formattedCreatedAt} – {node.viewCount} views
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans JP 300",
          data: await notoSansJp300,
        },
        {
          name: "Noto Sans JP 700",
          data: await notoSansJp700,
        },
      ],
    }
  );
}

function font(fontFamily: string) {
  return { fontFamily };
}
