"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Megaphone } from "lucide-react";
import { StoreAd, AdPlacement, AdCourse } from "@/data/banners";
import { createClient } from "@/lib/supabase/client";

type BannerRow={id:string;title_en:string;subtitle_en:string|null;cta_en:string;destination_path:string;placement:AdPlacement;image_storage_path:string|null;is_active:boolean;courses?:{slug:string}|{slug:string}[]|null};
function slugToCourse(slug?:string|null):AdCourse{if(slug==="operative-dentistry")return"operative";if(slug==="endodontics")return"endo";if(slug==="fixed-prosthodontics")return"fixed";if(slug==="removable-prosthodontics")return"removable";return"all";}

export function ManagedAds({ placement, course="all" }: { placement: AdPlacement; course?: AdCourse }) {
  const [ads,setAds]=useState<StoreAd[]>([]);
  const refresh=useCallback(async()=>{
    const supabase=createClient();
    if(!supabase) return;
    try {
      const {data,error}=await supabase.from("homepage_banners").select("id,title_en,subtitle_en,cta_en,destination_path,placement,image_storage_path,is_active,courses(slug)").eq("placement",placement).eq("is_active",true).order("sort_order");
      if(error){console.warn("DENTO HUB: ads sync skipped",error.message);return;}
      const mapped=((data||[]) as unknown as BannerRow[]).map(row=>{const relation=Array.isArray(row.courses)?row.courses[0]:row.courses;return{id:row.id,title:row.title_en,subtitle:row.subtitle_en||"",cta:row.cta_en,href:row.destination_path,placement:row.placement,course:slugToCourse(relation?.slug),image:row.image_storage_path||"/dento-hub-tooth.png",active:row.is_active};});
      setAds(mapped);
    } catch (error) {
      console.warn("DENTO HUB: ads network sync failed", error);
    }
  },[placement]);
  useEffect(()=>{const timer=window.setTimeout(()=>void refresh(),1200);const handler=()=>void refresh();window.addEventListener("dento-ads-updated",handler);return()=>{window.clearTimeout(timer);window.removeEventListener("dento-ads-updated",handler);};},[refresh]);
  const visible=ads.filter(a=>a.active && (a.course==="all" || course==="all" || a.course===course));
  if(!visible.length) return null;
  return <div className="managed-ads">{visible.slice(0,2).map(ad=><article className="managed-ad" key={ad.id}><div className="managed-ad-image"><img src={ad.image} alt="" /></div><div className="managed-ad-copy"><span><Megaphone size={14}/> DENTO HUB PICK</span><h3>{ad.title}</h3><p>{ad.subtitle}</p><Link href={ad.href}>{ad.cta}<ArrowRight size={16}/></Link></div></article>)}</div>;
}
