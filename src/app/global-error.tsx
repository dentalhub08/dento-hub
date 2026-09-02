"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("DENTO HUB global error", error); }, [error]);
  return <html><body><main style={{minHeight:"100vh",display:"grid",placeItems:"center",fontFamily:"Arial,sans-serif",padding:"24px"}}><div style={{maxWidth:520,textAlign:"center"}}><h1>DENTO HUB</h1><p>A temporary browser error occurred.</p><button onClick={reset} style={{padding:"12px 18px",borderRadius:12,border:"1px solid #dbe7e7",background:"white",cursor:"pointer"}}>Reload storefront</button></div></main></body></html>;
}
