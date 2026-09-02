import { HomeClient } from "@/components/home-client";

// Avoid serving a stale HTML/RSC document after a new Workers deployment.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home(){return <HomeClient/>;}
