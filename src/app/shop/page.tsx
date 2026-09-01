import { ShopClient } from "@/components/shop-client";
import { AdCourse } from "@/data/banners";
export const metadata={title:"Shop dental supplies"};
export default async function Shop({searchParams}:{searchParams:Promise<{q?:string;course?:string}>}){const p=await searchParams; const allowed=["operative","endo","fixed","removable"] as const; const course=(allowed as readonly string[]).includes(p.course||"")?p.course as AdCourse:"all"; return <ShopClient initialQuery={p.q||""} initialCourse={course}/>}
