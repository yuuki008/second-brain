export const revalidate = 60;

import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { getNode } from "./actions";
import dayjs from "dayjs";

// fonts
const fontsDir = join(process.cwd(), "fonts");

const inter300 = readFileSync(join(fontsDir, "inter-latin-300-normal.woff"));

const inter400 = readFileSync(join(fontsDir, "inter-latin-400-normal.woff"));

const inter500 = readFileSync(join(fontsDir, "inter-latin-500-normal.woff"));

const inter600 = readFileSync(join(fontsDir, "inter-latin-600-normal.woff"));

const robotoMono400 = readFileSync(
  join(fontsDir, "roboto-mono-latin-400-normal.woff")
);

export const alt = "About Acme";
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

  const formattedCreatedAt = dayjs(node.createdAt).format("MMMM D, YYYY");

  return new ImageResponse(
    (
      <div
        tw="flex p-10 h-full w-full bg-[#000] text-white flex-col"
        style={font("Inter 300")}
      >
        <main tw="flex grow pb-3 flex-col justify-center ml-10">
          <div tw="text-gray-400 text-3xl mb-5" style={font("Inter 400")}>
            Yuuki008
          </div>
          <div tw="text-7xl font-bold text-white" style={font("Inter 500")}>
            {node.name}
          </div>
        </main>

        <div
          tw="absolute bottom-4 right-4 flex text-2xl text-gray-400"
          style={font("Roboto Mono 400")}
        >
          {formattedCreatedAt} – {node.viewCount} views
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter 300",
          data: inter300,
        },
        {
          name: "Inter 400",
          data: inter400,
        },
        {
          name: "Inter 500",
          data: inter500,
        },
        {
          name: "Inter 600",
          data: inter600,
        },
        {
          name: "Roboto Mono 400",
          data: robotoMono400,
        },
      ],
    }
  );
}

// lil helper for more succinct styles
function font(fontFamily: string) {
  return { fontFamily };
}
