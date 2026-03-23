"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function useNewsletter(source: string) {
  const [status, setStatus] = useState<Status>("idle");

  const subscribe = async (email: string, lang: "fr" | "en") => {
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang, source }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return { status, subscribe };
}