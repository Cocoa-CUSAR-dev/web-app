"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// US2-6 / US3-2 #125 (F2): the diary card links to /sso#token=<jwt>. The token
// lives in the URL *fragment*, which browsers never send to the server, so it
// can't land in access logs, a Referer header, or shared server-side history.
// We read it here on the client, strip it from the visible URL, POST it to
// /sso/exchange to swap it for the real session cookie, then land on /history
// already logged in -- or the login page if the token is missing/invalid.
export default function SsoPage() {
  const router = useRouter();

  useEffect(() => {
    const token = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    ).get("token");

    // Drop the token from the URL so it isn't left in history or on screen.
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      router.replace("/auth?page=login");
      return;
    }

    void (async () => {
      try {
        const res = await fetch("/sso/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        router.replace(res.ok ? "/history" : "/auth?page=login");
      } catch {
        router.replace("/auth?page=login");
      }
    })();
  }, [router]);

  return (
    <main>
      <p>กำลังเข้าสู่ระบบ...</p>
    </main>
  );
}
