"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Plus, AlertTriangle, Upload, Pencil, Save, X, ImageIcon, Loader2, Archive } from "lucide-react";
import { titleCaseSource } from "@/lib/format";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { productImageById } from "@/data/product-media";

type Course={id:string;name_en:string;slug:string};
type EditableProduct={
  dbId:string; id:number; sourceName:string; slug:string; sourceTogary:string|null; sellingPrice:number|null;
  status:"draft"|"active"|"archived"; image?:string; course:string; courseId:string|null; available:boolean;
};

type DbProduct={id:string;source_row_no:number|null;source_name:string|null;slug:string;source_togary_price_raw:string|null;selling_price_egp:number|string|null;status:"draft"|"active"|"archived";is_available:boolean};
type ProductCourseRow={product_id:string;course_id:string;courses?:{name_en:string}|{name_en:string}[]|null};

function slugify(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`product-${Date.now()}`;}

export function AdminProducts(){
  const params=useSearchParams(); const initialQ=params.get("q")||"";
  const [q,setQ]=useState(initialQ),[products,setProducts]=useState<EditableProduct[]>([]),[courses,setCourses]=useState<Course[]>([]),[editing,setEditing]=useState<EditableProduct|null>(null),[showPending,setShowPending]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState("");

  async function load(){
    const supabase=createClient();if(!supabase){setLoading(false);setMessage("Supabase is not configured.");return;}
    setLoading(true);
    const [{data:productRows,error},{data:courseRows},{data:links}]=await Promise.all([
      supabase.from("products").select("id,source_row_no,source_name,slug,source_togary_price_raw,selling_price_egp,status,is_available").order("source_row_no",{ascending:true}),
      supabase.from("courses").select("id,name_en,slug").order("name_en"),
      supabase.from("product_courses").select("product_id,course_id,courses(name_en)"),
    ]);
    if(error){setMessage(error.message);setProducts([]);}else{
      const courseMap=new Map<string,{id:string;name:string}>();
      for(const row of (links||[]) as unknown as ProductCourseRow[]){const rel=Array.isArray(row.courses)?row.courses[0]:row.courses;if(rel?.name_en&&!courseMap.has(row.product_id))courseMap.set(row.product_id,{id:row.course_id,name:rel.name_en});}
      setProducts(((productRows||[]) as DbProduct[]).map((row,index)=>{const c=courseMap.get(row.id);const sourceRow=row.source_row_no??(10000+index);return{dbId:row.id,id:sourceRow,sourceName:row.source_name||`Product ${sourceRow}`,slug:row.slug,sourceTogary:row.source_togary_price_raw,sellingPrice:row.selling_price_egp===null?null:Number(row.selling_price_egp),status:row.status,image:row.source_row_no?productImageById[row.source_row_no]:undefined,course:c?.name||"Unassigned",courseId:c?.id||null,available:row.is_available};}));
    }
    setCourses((courseRows||[]) as Course[]);setLoading(false);
  }
  useEffect(()=>{void load();},[]);

  const pending=products.filter(p=>p.sellingPrice===null&&p.status!=="archived").length, priced=products.filter(p=>p.sellingPrice!==null&&p.status==="active"&&p.available).length;
  const visible=useMemo(()=>products.filter(p=>(!showPending||p.sellingPrice===null)&&p.sourceName.toLowerCase().includes(q.toLowerCase())),[products,q,showPending]);

  function newProduct(){const next=Math.max(119,...products.filter(p=>p.id<10000).map(p=>p.id))+1;setEditing({dbId:"",id:next,sourceName:"",slug:"",sourceTogary:null,sellingPrice:null,status:"draft",course:"Unassigned",courseId:null,available:true});}

  async function save(){
    if(!editing||!editing.sourceName.trim())return;
    const supabase=createClient();if(!supabase)return;
    setSaving(true);setMessage("");
    const price=editing.sellingPrice===null?null:Number(editing.sellingPrice);
    const status:EditableProduct["status"]=editing.status==="archived"?"archived":price===null?"draft":"active";
    let dbId=editing.dbId;
    if(dbId){
      const {error}=await supabase.from("products").update({source_name:editing.sourceName.trim(),slug:editing.slug||slugify(editing.sourceName),selling_price_egp:price,status,is_available:editing.available,updated_at:new Date().toISOString()}).eq("id",dbId);
      if(error){setMessage(error.message);setSaving(false);return;}
    }else{
      const {data,error}=await supabase.from("products").insert({source_row_no:editing.id,source_name:editing.sourceName.trim(),slug:slugify(editing.sourceName),selling_price_egp:price,status,is_available:editing.available}).select("id").single();
      if(error||!data){setMessage(error?.message||"Could not create product.");setSaving(false);return;} dbId=data.id;
    }
    await supabase.from("product_courses").delete().eq("product_id",dbId);
    if(editing.courseId)await supabase.from("product_courses").insert({product_id:dbId,course_id:editing.courseId});
    setEditing(null);await load();window.dispatchEvent(new Event("dento-catalog-updated"));setSaving(false);
  }

  async function archiveProduct(){
    if(!editing?.dbId||!confirm("Archive this product? It will disappear from the storefront but remain in your database/history."))return;
    const supabase=createClient();if(!supabase)return;
    const {error}=await supabase.from("products").update({status:"archived",is_available:false,updated_at:new Date().toISOString()}).eq("id",editing.dbId);
    if(error)setMessage(error.message);else{setEditing(null);await load();window.dispatchEvent(new Event("dento-catalog-updated"));}
  }

  return <>
    <div className="admin-pagehead"><div><span className="admin-kicker">CATALOG</span><h1>Products</h1><p>Live Supabase catalog: edit public prices, availability and course placement. Changes reach the storefront after refresh.</p></div><div className="page-actions"><button className="admin-secondary"><Upload size={16}/> Import</button><button className="admin-primary" onClick={newProduct}><Plus size={16}/> Add product</button></div></div>
    {message&&<div className="admin-alert"><AlertTriangle size={18}/><div><b>Catalog message</b><span>{message}</span></div></div>}
    <div className="admin-alert"><AlertTriangle size={18}/><div><b>{pending} products still need a price</b><span>They stay private to Admin and never appear publicly until a selling price is entered.</span></div><button onClick={()=>setShowPending(true)}>Review pricing</button></div>
    <div className="admin-table-card"><div className="table-tools"><div className="admin-search boxed"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search catalog..."/></div><button className={`admin-secondary ${showPending?"active-filter":""}`} onClick={()=>setShowPending(x=>!x)}><SlidersHorizontal size={16}/> {showPending?"Pending only":"All products"}</button><span>{priced} public-ready / {products.length} total</span></div><div className="admin-table-scroll">{loading?<div className="admin-loading"><Loader2 className="spin"/> Loading live catalog…</div>:<table className="admin-table"><thead><tr><th>Product</th><th>Source value</th><th>Selling price</th><th>Course section</th><th>Visibility</th><th/></tr></thead><tbody>{visible.slice(0,120).map((p,i)=><tr key={p.dbId}><td><div className="product-cell"><div className={`mini-thumb t${i%5} ${p.image?"with-image":""}`}>{p.image?<img src={p.image} alt=""/>:titleCaseSource(p.sourceName).slice(0,2)}</div><div><b>{titleCaseSource(p.sourceName)}</b><small>{p.image?"AIU PDF image mapped":"Image not mapped yet"}</small></div></div></td><td><span className="private-price">{p.sourceTogary||"—"}</span><small className="table-sub">Source sheet</small></td><td>{p.sellingPrice!==null?<><b>{p.sellingPrice} EGP</b><small className="table-sub">Public price</small></>:<button className="price-missing" onClick={()=>setEditing({...p})}>Set price</button>}</td><td><span className="course-assignment">{p.course}</span></td><td><span className={`badge ${p.status==="archived"?"warning":p.sellingPrice!==null&&p.available?"success":"warning"}`}>{p.status==="archived"?"Archived":p.sellingPrice!==null&&p.available?"Public":"Admin only"}</span></td><td><button className="dots" onClick={()=>setEditing({...p})} title="Edit product"><Pencil size={15}/></button></td></tr>)}</tbody></table>}</div></div>
    {editing&&<div className="admin-modal-backdrop"><div className="admin-modal product-editor"><div className="admin-modal-head"><div><span className="admin-kicker">PRODUCT EDITOR</span><h2>{editing.dbId?titleCaseSource(editing.sourceName):"Add product"}</h2></div><button onClick={()=>setEditing(null)}><X/></button></div><div className="product-edit-grid"><div className="product-editor-preview">{editing.image?<img src={editing.image} alt=""/>:<div><ImageIcon/><span>No mapped PDF image</span></div>}<small>Catalog row: {editing.id}</small></div><div className="product-editor-fields"><label>Product name<input value={editing.sourceName} onChange={e=>setEditing({...editing,sourceName:e.target.value})}/></label><label>Public selling price (EGP)<input type="number" min="0" step="0.01" value={editing.sellingPrice??""} onChange={e=>setEditing({...editing,sellingPrice:e.target.value===""?null:Number(e.target.value)})} placeholder="Enter price"/></label><label>Course section<select value={editing.courseId||""} onChange={e=>{const c=courses.find(x=>x.id===e.target.value);setEditing({...editing,courseId:c?.id||null,course:c?.name_en||"Unassigned"});}}><option value="">Unassigned</option>{courses.map(c=><option value={c.id} key={c.id}>{c.name_en}</option>)}</select></label><label className="ad-switch"><input type="checkbox" checked={editing.available} onChange={e=>setEditing({...editing,available:e.target.checked})}/><span>Available for sale</span></label>{editing.sourceTogary&&<div className="source-value-box"><span>Internal source value</span><b>{editing.sourceTogary}</b><small>This value stays Admin-only.</small></div>}</div></div><div className="admin-modal-footer">{editing.dbId&&<button className="admin-secondary danger-button" onClick={()=>void archiveProduct()}><Archive size={15}/> Archive</button>}<span className="modal-spacer"/><button className="admin-secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="admin-primary" disabled={saving} onClick={()=>void save()}>{saving?<Loader2 className="spin" size={15}/>:<Save size={15}/>} Save changes</button></div></div></div>}
  </>;
}
