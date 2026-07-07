// app/api/articles/[slug]/view/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
  const { slug: rawSlug } = await params;
  const slug = cleanSlug(rawSlug);

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("increment_article_view", {
    article_slug: slug,
  });

  if (error) {
    console.error("[ARTICLE_VIEW_ERROR]", error);
    return NextResponse.json({ ok: false, error: "Unable to register view" }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, slug, views: Number(data ?? 0) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { slug: rawSlug } = await params;
  const slug = cleanSlug(rawSlug);

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("article_stats")
    .select("views, likes")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[ARTICLE_STATS_ERROR]", error);
    return NextResponse.json({ ok: false, error: "Unable to read stats" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    slug,
    views: Number(data?.views ?? 0),
    likes: Number(data?.likes ?? 0),
  });
}