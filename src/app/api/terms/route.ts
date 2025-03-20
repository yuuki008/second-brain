// app/api/terms/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const terms = await prisma.term.findMany({
      include: {
        tags: {
          include: {
            parent: true,
            children: true,
          },
        },
      },
    });
    return NextResponse.json(terms);
  } catch (error) {
    console.error("Error fetching terms:", error);
    return NextResponse.json(
      { error: "Failed to fetch terms" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, definition, tagIds } = await request.json();

    const term = await prisma.term.create({
      data: {
        name,
        definition,
        tags: {
          connect: tagIds.map((id: string) => ({ id })),
        },
      },
      include: {
        tags: {
          include: {
            parent: true,
            children: true,
          },
        },
      },
    });

    return NextResponse.json(term);
  } catch (error) {
    console.error("Error creating term:", error);
    return NextResponse.json(
      { error: "Failed to create term" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { tagId, name, color, parentId } = await request.json();

    const tag = await prisma.tag.upsert({
      where: { id: tagId || "" },
      update: {
        name,
        color,
        parentId,
      },
      create: {
        name,
        color,
        parentId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}
