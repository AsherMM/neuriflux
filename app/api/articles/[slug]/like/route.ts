import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type RouteParams = {
  params: Promise<{ slug: string }>;
};

function cleanSlug(slug: string) {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 140);
}

export async function POST(_: NextRequest, { params }: RouteParams) {
  try {
    const { slug: rawSlug } = await params;
    const slug = cleanSlug(rawSlug);

    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "Invalid slug" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.rpc("increment_article_like", {
      article_slug: slug,
    });

    if (error) {
      console.error("[ARTICLE_LIKE_ERROR]", error);
      return NextResponse.json(
        { ok: false, error: "Unable to register like" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        slug,
        likes: Number(data ?? 0),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("[ARTICLE_LIKE_ROUTE_ERROR]", error);

    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 },
    );
  }
}