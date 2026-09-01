"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Plus, Save, University, Truck, Pencil, Trash2, Eye, EyeOff, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deliveryLocations } from "@/data/site";

type UniversityRow={id:string;name_en:string;governorate:string|null;city:string|null};
type RuleType="governorate"|"city"|"university";
type Rule={id:string;rule_type:RuleType;governorate:string|null;city:string|null;university_id:string|null;fee_egp:number|string;priority:number;is_active:boolean;universities?:{name_en:string}|{name_en:string}[]|null};
type Editor={id?:string;rule_type:RuleType;governorate:string;city:string;university_id:string;fee:string;priority:string;is_active:boolean};
const blank:Editor={rule_type:"governorate",governorate:"Cairo",city:"",university_id:"",fee:"",priority:"10",is_active:true};

export function AdminDelivery(){
  const [rules,setRules]=useState<Rule[]>([]);
  const [universities,setUniversities]=useState<UniversityRow[]>([]);
  const [defaultFee,setDefaultFee]=useState("");
  const [free,setFree]=useState("");
  const [editing,setEditing]=useState<Editor|null>(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");

  async function load(){
    const supabase=createClient();if(!supabase){setLoading(false);setMessage("Supabase is not configured.");return;}
    setLoading(true);
    const [{data:ruleRows,error},{data:uniRows},{data:settings}]=await Promise.all([
      supabase.from("delivery_rules").select("id,rule_type,governorate,city,university_id,fee_egp,priority,is_active,universities(name_en)").order("priority",{ascending:false}),
      supabase.from("universities").select("id,name_en,governorate,city").eq("is_active",true).order("name_en"),
      supabase.from("store_settings").select("default_delivery_fee_egp,free_delivery_threshold_egp").eq("id",1).maybeSingle(),
    ]);
    if(error)setMessage(error.message); else setRules((ruleRows||[]) as unknown as Rule[]);
    setUniversities((uniRows||[]) as UniversityRow[]);
    setDefaultFee(settings?.default_delivery_fee_egp===null||settings?.default_delivery_fee_egp===undefined?"":String(settings.default_delivery_fee_egp));
    setFree(settings?.free_delivery_threshold_egp===null||settings?.free_delivery_threshold_egp===undefined?"":String(settings.free_delivery_threshold_egp));
    setLoading(false);
  }
  useEffect(()=>{void load();},[]);

  const governorates=useMemo(()=>deliveryLocations.filter(x=>x.kind==="governorate").map(x=>x.name),[]);

  async function saveStoreSettings(){
    const supabase=createClient();if(!supabase)return;
    setSaving(true);setMessage("");
    const payload={id:1,default_delivery_fee_egp:defaultFee===""?null:Number(defaultFee),free_delivery_threshold_egp:free===""?null:Number(free),support_email:"dentalhub08@outlook.com"};
    const {error}=await supabase.from("store_settings").upsert(payload,{onConflict:"id"});
    setSaving(false);setMessage(error?error.message:"Store-wide delivery settings saved.");
  }

  async function saveRule(){
    if(!editing||editing.fee==="")return;
    const supabase=createClient();if(!supabase)return;
    setSaving(true);setMessage("");
    const payload={
      rule_type:editing.rule_type,
      governorate:editing.rule_type==="university"?null:(editing.governorate||null),
      city:editing.rule_type==="city"?(editing.city||null):null,
      university_id:editing.rule_type==="university"?(editing.university_id||null):null,
      fee_egp:Number(editing.fee),
      priority:Number(editing.priority)||0,
      is_active:editing.is_active,
      updated_at:new Date().toISOString(),
    };
    const result=editing.id?await supabase.from("delivery_rules").update(payload).eq("id",editing.id):await supabase.from("delivery_rules").insert(payload);
    if(result.error)setMessage(result.error.message);else{setEditing(null);await load();window.dispatchEvent(new Event("dento-delivery-updated"));}
    setSaving(false);
  }

  async function remove(id:string){
    if(!confirm("Delete this delivery rule permanently?"))return;
    const supabase=createClient();if(!supabase)return;
    const {error}=await supabase.from("delivery_rules").delete().eq("id",id);
    if(error)setMessage(error.message);else{await load();window.dispatchEvent(new Event("dento-delivery-updated"));}
  }

  async function toggle(rule:Rule){
    const supabase=createClient();if(!supabase)return;
    const {error}=await supabase.from("delivery_rules").update({is_active:!rule.is_active,updated_at:new Date().toISOString()}).eq("id",rule.id);
    if(error)setMessage(error.message);else{await load();window.dispatchEvent(new Event("dento-delivery-updated"));}
  }

  function editRule(rule:Rule){
    setEditing({id:rule.id,rule_type:rule.rule_type,governorate:rule.governorate||"Cairo",city:rule.city||"",university_id:rule.university_id||"",fee:String(rule.fee_egp),priority:String(rule.priority),is_active:rule.is_active});
  }

  function label(rule:Rule){
    if(rule.rule_type==="university"){
      const rel=Array.isArray(rule.universities)?rule.universities[0]:rule.universities;
      return rel?.name_en||"University";
    }
    if(rule.rule_type==="city")return `${rule.city||"City"}, ${rule.governorate||""}`;
    return rule.governorate||"Governorate";
  }

  return <>
    <div className="admin-pagehead"><div><span className="admin-kicker">FULFILMENT</span><h1>Delivery rules</h1><p>Edit every delivery price, add new location overrides, hide rules or delete them completely.</p></div><button className="admin-primary" disabled={saving} onClick={()=>void saveStoreSettings()}>{saving?<Loader2 className="spin" size={16}/>:<Save size={16}/>} Save store-wide</button></div>
    {message&&<div className="admin-alert"><div><b>Delivery settings</b><span>{message}</span></div></div>}
    <div className="delivery-layout">
      <section className="settings-card"><div className="settings-title"><Truck/><div><h3>Store-wide delivery</h3><p>Fallback fee and free-delivery threshold. Leave blank if you do not want a fallback yet.</p></div></div><div className="settings-grid"><label>Default delivery fee <div className="money-input"><span>EGP</span><input type="number" min="0" value={defaultFee} onChange={e=>setDefaultFee(e.target.value)}/></div></label><label>Free delivery above <div className="money-input"><span>EGP</span><input type="number" min="0" value={free} onChange={e=>setFree(e.target.value)}/></div></label></div></section>
      <section className="settings-card"><div className="settings-title"><MapPin/><div><h3>Live delivery overrides</h3><p>University, governorate and city rules are stored in Supabase and used by the storefront.</p></div><button className="admin-secondary" onClick={()=>setEditing({...blank})}><Plus size={16}/> Add rule</button></div>
        {loading?<div className="delivery-empty"><Loader2 className="spin"/> Loading rules…</div>:<div className="delivery-rule-admin-list">{rules.length?rules.map(rule=><div className="delivery-admin-row" key={rule.id}><div className="delivery-rule-icon">{rule.rule_type==="university"?<University/>:<MapPin/>}</div><div className="delivery-rule-copy"><b>{label(rule)}</b><small>{rule.rule_type} · priority {rule.priority}</small></div><strong>{Number(rule.fee_egp).toLocaleString()} EGP</strong><span className={`badge ${rule.is_active?"success":"warning"}`}>{rule.is_active?"Active":"Hidden"}</span><div className="ad-admin-actions"><button className="icon-admin-btn" onClick={()=>void toggle(rule)} title={rule.is_active?"Hide rule":"Activate rule"}>{rule.is_active?<EyeOff/>:<Eye/>}</button><button className="icon-admin-btn" onClick={()=>editRule(rule)} title="Edit rule"><Pencil/></button><button className="icon-admin-btn danger" onClick={()=>void remove(rule.id)} title="Delete rule"><Trash2/></button></div></div>):<div className="delivery-empty">No delivery overrides yet.</div>}</div>}
      </section>
    </div>
    {editing&&<div className="admin-modal-backdrop"><div className="admin-modal delivery-editor"><div className="admin-modal-head"><div><span className="admin-kicker">DELIVERY EDITOR</span><h2>{editing.id?"Edit delivery rule":"Add delivery rule"}</h2></div><button onClick={()=>setEditing(null)}><X/></button></div><div className="product-editor-fields"><label>Rule type<select value={editing.rule_type} onChange={e=>setEditing({...editing,rule_type:e.target.value as RuleType})}><option value="governorate">Governorate</option><option value="city">City</option><option value="university">University</option></select></label>{editing.rule_type==="university"?<label>University<select value={editing.university_id} onChange={e=>setEditing({...editing,university_id:e.target.value})}><option value="">Choose university</option>{universities.map(u=><option value={u.id} key={u.id}>{u.name_en}</option>)}</select></label>:<><label>Governorate<select value={editing.governorate} onChange={e=>setEditing({...editing,governorate:e.target.value})}>{governorates.map(g=><option value={g} key={g}>{g}</option>)}</select></label>{editing.rule_type==="city"&&<label>City<input value={editing.city} onChange={e=>setEditing({...editing,city:e.target.value})} placeholder="e.g. New Alamein"/></label>}</>}<div className="two-field"><label>Delivery fee (EGP)<input type="number" min="0" step="0.01" value={editing.fee} onChange={e=>setEditing({...editing,fee:e.target.value})}/></label><label>Priority<input type="number" value={editing.priority} onChange={e=>setEditing({...editing,priority:e.target.value})}/></label></div><label className="ad-switch"><input type="checkbox" checked={editing.is_active} onChange={e=>setEditing({...editing,is_active:e.target.checked})}/><span>Rule is active</span></label></div><div className="admin-modal-footer"><button className="admin-secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="admin-primary" disabled={saving} onClick={()=>void saveRule()}>{saving?<Loader2 className="spin" size={15}/>:<Save size={15}/>} Save rule</button></div></div></div>}
  </>;
}
