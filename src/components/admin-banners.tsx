"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Plus, Pencil, Trash2, Eye, EyeOff, Save, X, Megaphone, Loader2 } from "lucide-react";
import { adCourseLabels, adPlacementLabels, StoreAd, AdPlacement, AdCourse } from "@/data/banners";
import { createClient } from "@/lib/supabase/client";

const imageChoices=[
  "/supply-images/rubber-dam-sheets.jpg","/supply-images/packable-composite.jpg","/supply-images/k-files-15-40.jpg",
  "/supply-images/gutta-percha-15-40.jpg","/supply-images/high-speed-handpiece.jpg","/supply-images/wax-knife.jpg",
  "/supply-images/alginate.jpg","/supply-images/light-cure.jpg"
];

const blank:StoreAd={id:"",title:"",subtitle:"",cta:"Shop now",href:"/shop",placement:"home_top",course:"all",image:imageChoices[0],active:true};

type CourseRow={id:string;slug:string;name_en:string};
type BannerRow={
  id:string; title_en:string; subtitle_en:string|null; cta_en:string; destination_path:string;
  placement:AdPlacement; course_id:string|null; image_storage_path:string|null; is_active:boolean;
  courses?:{slug:string}|{slug:string}[]|null;
};

function slugToCourse(slug?:string|null):AdCourse{
  if(slug==="operative-dentistry")return "operative";
  if(slug==="endodontics")return "endo";
  if(slug==="fixed-prosthodontics")return "fixed";
  if(slug==="removable-prosthodontics")return "removable";
  return "all";
}
function courseToSlug(course:AdCourse){return course==="operative"?"operative-dentistry":course==="endo"?"endodontics":course==="fixed"?"fixed-prosthodontics":course==="removable"?"removable-prosthodontics":null;}

export function AdminBanners(){
  const [ads,setAds]=useState<StoreAd[]>([]);
  const [courses,setCourses]=useState<CourseRow[]>([]);
  const [editing,setEditing]=useState<StoreAd|null>(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");

  async function load(){
    const supabase=createClient();
    if(!supabase){setLoading(false);setMessage("Supabase is not configured.");return;}
    setLoading(true);
    const [{data:courseRows},{data:bannerRows,error}]=await Promise.all([
      supabase.from("courses").select("id,slug,name_en").order("name_en"),
      supabase.from("homepage_banners").select("id,title_en,subtitle_en,cta_en,destination_path,placement,course_id,image_storage_path,is_active,courses(slug)").order("sort_order")
    ]);
    setCourses((courseRows||[]) as CourseRow[]);
    if(error){setMessage(error.message);setAds([]);}else{
      setAds(((bannerRows||[]) as unknown as BannerRow[]).map(row=>{
        const relation=Array.isArray(row.courses)?row.courses[0]:row.courses;
        return {id:row.id,title:row.title_en,subtitle:row.subtitle_en||"",cta:row.cta_en,href:row.destination_path,placement:row.placement,course:slugToCourse(relation?.slug),image:row.image_storage_path||imageChoices[0],active:row.is_active};
      }));
    }
    setLoading(false);
  }

  useEffect(()=>{void load();},[]);
  const active=useMemo(()=>ads.filter(a=>a.active).length,[ads]);

  async function save(){
    if(!editing||!editing.title.trim())return;
    const supabase=createClient(); if(!supabase)return;
    setSaving(true);setMessage("");
    const slug=courseToSlug(editing.course);
    const courseId=slug?courses.find(c=>c.slug===slug)?.id||null:null;
    const payload={title_en:editing.title.trim(),subtitle_en:editing.subtitle.trim()||null,cta_en:editing.cta.trim()||"Shop now",destination_path:editing.href.trim()||"/shop",placement:editing.placement,course_id:courseId,image_storage_path:editing.image||null,is_active:editing.active,updated_at:new Date().toISOString()};
    const result=editing.id
      ? await supabase.from("homepage_banners").update(payload).eq("id",editing.id)
      : await supabase.from("homepage_banners").insert(payload);
    if(result.error)setMessage(result.error.message); else {setEditing(null);await load();window.dispatchEvent(new Event("dento-ads-updated"));}
    setSaving(false);
  }

  async function remove(id:string){
    if(!confirm("Delete this advertisement permanently?"))return;
    const supabase=createClient();if(!supabase)return;
    const {error}=await supabase.from("homepage_banners").delete().eq("id",id);
    if(error)setMessage(error.message); else {await load();window.dispatchEvent(new Event("dento-ads-updated"));}
  }

  async function toggle(ad:StoreAd){
    const supabase=createClient();if(!supabase)return;
    const {error}=await supabase.from("homepage_banners").update({is_active:!ad.active,updated_at:new Date().toISOString()}).eq("id",ad.id);
    if(error)setMessage(error.message); else {await load();window.dispatchEvent(new Event("dento-ads-updated"));}
  }

  return <>
    <div className="admin-pagehead"><div><span className="admin-kicker">ADVERTISING</span><h1>Ads & homepage placements</h1><p>Every ad is now saved in Supabase. Create, edit, hide, move or permanently delete it.</p></div><button className="admin-primary" onClick={()=>setEditing({...blank})}><Plus size={16}/> New ad</button></div>
    {message&&<div className="admin-alert"><div><b>Admin message</b><span>{message}</span></div></div>}
    <div className="ad-kpi-row"><div><Megaphone/><span><b>{ads.length}</b><small>Total ads</small></span></div><div><Eye/><span><b>{active}</b><small>Currently visible</small></span></div><div><ImageIcon/><span><b>{new Set(ads.map(a=>a.placement)).size}</b><small>Sections used</small></span></div></div>
    <div className="admin-table-card"><div className="ad-manager-list">{loading?<div className="ad-empty"><Loader2 className="spin"/><h3>Loading live ads…</h3></div>:ads.length===0?<div className="ad-empty"><ImageIcon/><h3>No ads yet</h3><p>Create the first promotion. Pending-price products never become ads automatically.</p><button className="admin-primary" onClick={()=>setEditing({...blank})}><Plus size={15}/> Create ad</button></div>:ads.map(ad=><article className="ad-admin-row" key={ad.id}><div className="ad-admin-thumb"><img src={ad.image} alt=""/></div><div className="ad-admin-main"><div className="ad-admin-title"><b>{ad.title}</b><span className={`badge ${ad.active?"success":"warning"}`}>{ad.active?"Live":"Hidden"}</span></div><p>{ad.subtitle}</p><div className="ad-admin-meta"><span>{adPlacementLabels[ad.placement]}</span><span>{adCourseLabels[ad.course]}</span><span>{ad.cta}</span></div></div><div className="ad-admin-actions"><button className="icon-admin-btn" title={ad.active?"Hide ad":"Show ad"} onClick={()=>void toggle(ad)}>{ad.active?<EyeOff/>:<Eye/>}</button><button className="icon-admin-btn" title="Edit ad" onClick={()=>setEditing({...ad})}><Pencil/></button><button className="icon-admin-btn danger" title="Delete ad" onClick={()=>void remove(ad.id)}><Trash2/></button></div></article>)}</div></div>
    {editing&&<div className="admin-modal-backdrop"><div className="admin-modal ad-editor"><div className="admin-modal-head"><div><span className="admin-kicker">AD EDITOR</span><h2>{editing.id?"Edit advertisement":"Create advertisement"}</h2></div><button onClick={()=>setEditing(null)}><X/></button></div><div className="ad-editor-grid"><div className="ad-editor-fields"><label>Headline<input value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})}/></label><label>Supporting text<textarea value={editing.subtitle} onChange={e=>setEditing({...editing,subtitle:e.target.value})}/></label><div className="two-field"><label>Button text<input value={editing.cta} onChange={e=>setEditing({...editing,cta:e.target.value})}/></label><label>Destination<input value={editing.href} onChange={e=>setEditing({...editing,href:e.target.value})}/></label></div><div className="two-field"><label>Website section<select value={editing.placement} onChange={e=>setEditing({...editing,placement:e.target.value as AdPlacement})}>{Object.entries(adPlacementLabels).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label><label>Course targeting<select value={editing.course} onChange={e=>setEditing({...editing,course:e.target.value as AdCourse})}>{Object.entries(adCourseLabels).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label></div><label>Image path / Supabase Storage URL<input value={editing.image} onChange={e=>setEditing({...editing,image:e.target.value})}/></label><label className="ad-switch"><input type="checkbox" checked={editing.active} onChange={e=>setEditing({...editing,active:e.target.checked})}/><span>Publish this ad</span></label></div><div className="ad-image-picker"><b>Supply image</b><p>Choose one of the mapped AIU PDF assets or paste a future Storage URL.</p><div>{imageChoices.map(src=><button type="button" className={editing.image===src?"selected":""} key={src} onClick={()=>setEditing({...editing,image:src})}><img src={src} alt=""/></button>)}</div></div></div><div className="admin-modal-footer"><button className="admin-secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="admin-primary" disabled={saving} onClick={()=>void save()}>{saving?<Loader2 className="spin" size={15}/>:<Save size={15}/>} Save ad</button></div></div></div>}
  </>;
}
