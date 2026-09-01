"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";
import { deliveryLocations } from "@/data/site";
import { useStore } from "./store-provider";
import { createClient } from "@/lib/supabase/client";

type RuleRow={rule_type:string;governorate:string|null;university_id:string|null;fee_egp:number|string;priority:number;universities?:{name_en:string}|{name_en:string}[]|null};

export function LocationPicker() {
  const { locale, deliveryLocation, setDeliveryLocation } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [fees,setFees]=useState<Record<string,number>>({aiu:50});
  const ar = locale === "ar";
  const selected = deliveryLocations.find((x) => x.id === deliveryLocation) ?? null;

  useEffect(()=>{
    let active=true;
    async function loadFees(){
      const supabase=createClient();if(!supabase)return;
      const {data}=await supabase.from("delivery_rules").select("rule_type,governorate,university_id,fee_egp,priority,universities(name_en)").eq("is_active",true).order("priority",{ascending:false});
      if(!active||!data)return;
      const next:Record<string,number>={};
      for(const row of data as unknown as RuleRow[]){
        if(row.rule_type==="university"){
          const relation=Array.isArray(row.universities)?row.universities[0]:row.universities;
          if(relation?.name_en==="Alamein International University"&&next.aiu===undefined)next.aiu=Number(row.fee_egp);
        }else if(row.rule_type==="governorate"&&row.governorate){
          const loc=deliveryLocations.find(x=>x.kind==="governorate"&&x.name.toLowerCase()===row.governorate!.toLowerCase());
          if(loc&&next[loc.id]===undefined)next[loc.id]=Number(row.fee_egp);
        }
      }
      setFees(next);
    }
    void loadFees();
    const handler=()=>void loadFees();window.addEventListener("dento-delivery-updated",handler);window.addEventListener("focus",handler);
    return()=>{active=false;window.removeEventListener("dento-delivery-updated",handler);window.removeEventListener("focus",handler);};
  },[]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return deliveryLocations;
    return deliveryLocations.filter((x) => `${x.name} ${x.ar} ${x.short ?? ""}`.toLowerCase().includes(q));
  }, [query]);

  const university = results.filter((x) => x.kind === "university");
  const governorates = results.filter((x) => x.kind === "governorate");
  const label = selected ? (selected.short ?? (ar ? selected.ar : selected.name)) : (ar ? "مكان التوصيل" : "Delivery location");

  function choose(id: string) {
    setDeliveryLocation(id);
    setOpen(false);
    setQuery("");
  }

  function feeText(id:string,universityMode=false){
    const fee=fees[id];
    if(fee===undefined)return ar?"السعر يحدده الأدمن":"Delivery fee set by admin";
    if(universityMode)return ar?`توصيل ${fee} ج.م إلى AIU`:`${fee} EGP delivery to AIU`;
    return ar?`${fee} ج.م توصيل`:`${fee} EGP delivery`;
  }

  return <div className="location-picker">
    <button type="button" className={`uni-switch ${open ? "open" : ""}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
      <MapPin size={15}/><span>{label}</span><ChevronDown size={15}/>
    </button>
    {open && <>
      <button className="location-backdrop" aria-label="Close location selector" onClick={() => setOpen(false)}/>
      <div className="location-popover" role="dialog" aria-label={ar ? "اختيار مكان التوصيل" : "Choose delivery location"}>
        <div className="location-head"><div><span>{ar ? "التوصيل إلى" : "DELIVER TO"}</span><strong>{ar ? "اختر مكانك" : "Choose your location"}</strong></div><button onClick={() => setOpen(false)} aria-label="Close"><X size={18}/></button></div>
        <div className="location-search"><Search size={16}/><input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={ar ? "ابحث عن المحافظة أو AIU..." : "Search governorate or AIU..."}/></div>
        <div className="location-scroll">
          {university.length > 0 && <div className="location-group"><p>{ar ? "توصيل الجامعة" : "UNIVERSITY DELIVERY"}</p>{university.map((loc) => <button key={loc.id} className={`location-option featured ${deliveryLocation===loc.id?"selected":""}`} onClick={()=>choose(loc.id)}><span className="location-pin"><MapPin size={17}/></span><span><b>{ar ? loc.ar : loc.name}</b><small>{feeText(loc.id,true)}</small></span>{deliveryLocation===loc.id && <Check size={17}/>}</button>)}</div>}
          <div className="location-group"><p>{ar ? "محافظات مصر" : "EGYPT GOVERNORATES"}</p>{governorates.map((loc) => <button key={loc.id} className={`location-option ${deliveryLocation===loc.id?"selected":""}`} onClick={()=>choose(loc.id)}><span className="location-pin subtle"><MapPin size={15}/></span><span><b>{ar ? loc.ar : loc.name}</b><small>{feeText(loc.id)}</small></span>{deliveryLocation===loc.id && <Check size={17}/>}</button>)}{!governorates.length && !university.length && <div className="location-empty">{ar ? "لا توجد نتائج" : "No locations found"}</div>}</div>
        </div>
      </div>
    </>}
  </div>;
}
