import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, lang = "fr", source = "unknown" } = await req.json();

    // Validation basique
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, lang, source });

    // Email déjà inscrit → succès silencieux
    if (error?.code === "23505") {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error("Newsletter API error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}