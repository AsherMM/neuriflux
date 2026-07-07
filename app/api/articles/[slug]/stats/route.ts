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

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { slug: rawSlug } = await params;
    const slug = cleanSlug(rawSlug);

    if (!slug) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid slug",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("article_stats")
      .select("views, likes, updated_at")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("[ARTICLE_STATS_ERROR]", error);

      return NextResponse.json(
        {
          ok: false,
          error: "Unable to load article stats",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        slug,
        views: Number(data?.views ?? 0),
        likes: Number(data?.likes ?? 0),
        updatedAt: data?.updated_at ?? null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("[ARTICLE_STATS_ROUTE_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected server error",
      },
      { status: 500 },
    );
  }
}