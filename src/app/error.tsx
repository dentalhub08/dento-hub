"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("DENTO HUB route error", error); }, [error]);
  return <main style={{minHeight:"60vh",display:"grid",placeItems:"center",padding:"24px"}}><div style={{maxWidth:520,textAlign:"center"}}><h1>We hit a temporary problem</h1><p>The storefront is still available. Try the page again.</p><button onClick={reset} style={{padding:"12px 18px",borderRadius:12,border:0,cursor:"pointer"}}>Try again</button></div></main>;
}
