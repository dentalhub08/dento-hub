"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, LockKeyhole, MapPin, Banknote, ShieldCheck, Loader2 } from "lucide-react";
import { useStore } from "./store-provider";
import { createClient } from "@/lib/supabase/client";
import { egp } from "@/lib/format";
import { deliveryLocations } from "@/data/site";

type Rule={rule_type:string;governorate:string|null;fee_egp:number|string;priority:number;universities?:{name_en:string}|{name_en:string}[]|null};

export function CheckoutClient(){
  const {cart,deliveryLocation,accountSyncing}=useStore();
  const [auth,setAuth]=useState<"loading"|"yes"|"no">("loading");
  const [deliveryFee,setDeliveryFee]=useState<number|null>(null);
  const [defaultFee,setDefaultFee]=useState<number|null>(null);
  const [freeThreshold,setFreeThreshold]=useState<number|null>(null);
  const [feeLoading,setFeeLoading]=useState(false);
  const subtotal=cart.reduce((s,x)=>s+x.price*x.quantity,0);
  const selectedLocation=deliveryLocations.find(x=>x.id===deliveryLocation);

  useEffect(()=>{const s=createClient(); if(!s){setAuth("no");return;} s.auth.getUser().then(({data})=>setAuth(data.user?"yes":"no"));},[]);

  useEffect(()=>{
    let active=true;
    async function load(){
      const supabase=createClient();if(!supabase||!selectedLocation){setDeliveryFee(null);return;}
      setFeeLoading(true);
      const [{data:settings},{data:rules}]=await Promise.all([
        supabase.from("store_settings").select("default_delivery_fee_egp,free_delivery_threshold_egp").eq("id",1).maybeSingle(),
        supabase.from("delivery_rules").select("rule_type,governorate,fee_egp,priority,universities(name_en)").eq("is_active",true).order("priority",{ascending:false}),
      ]);
      if(!active)return;
      const df=settings?.default_delivery_fee_egp===null||settings?.default_delivery_fee_egp===undefined?null:Number(settings.default_delivery_fee_egp);
      const ft=settings?.free_delivery_threshold_egp===null||settings?.free_delivery_threshold_egp===undefined?null:Number(settings.free_delivery_threshold_egp);
      setDefaultFee(df);setFreeThreshold(ft);
      let matched:number|null=null;
      for(const row of (rules||[]) as unknown as Rule[]){
        if(selectedLocation.kind==="university"&&row.rule_type==="university"){
          const rel=Array.isArray(row.universities)?row.universities[0]:row.universities;
          if(rel?.name_en===selectedLocation.name){matched=Number(row.fee_egp);break;}
        }
        if(selectedLocation.kind==="governorate"&&row.rule_type==="governorate"&&row.governorate?.toLowerCase()===selectedLocation.name.toLowerCase()){matched=Number(row.fee_egp);break;}
      }
      setDeliveryFee(matched??df);setFeeLoading(false);
    }
    void load();
    const handler=()=>void load();window.addEventListener("dento-delivery-updated",handler);return()=>{active=false;window.removeEventListener("dento-delivery-updated",handler);};
  },[selectedLocation?.id]);

  const effectiveFee=useMemo(()=>freeThreshold!==null&&subtotal>=freeThreshold?0:deliveryFee,[freeThreshold,subtotal,deliveryFee]);
  if(!cart.length)return <main className="shell empty-state"><h1>Your cart is empty.</h1><Link href="/shop" className="btn-primary">Go shopping</Link></main>;
  if(auth!=="yes")return <main className="shell checkout-gate"><div className="gate-card"><div className="gate-icon"><LockKeyhole/></div><span className="section-kicker">ONE QUICK STEP</span><h1>Sign in to place your order.</h1><p>Your guest cart is preserved and merged into your DENTO HUB account after sign-in.</p><div className="gate-actions"><Link className="btn-primary" href="/login?next=/checkout">Sign in <ArrowRight size={18}/></Link><Link className="btn-secondary" href="/register?next=/checkout">Create account</Link></div></div></main>;
  return <main className="shell checkout-page"><section><span className="section-kicker">CHECKOUT</span><h1>Almost there.</h1>{accountSyncing&&<div className="checkout-sync-note"><Loader2 className="spin" size={16}/> Syncing your saved account cart…</div>}<div className="checkout-block"><div className="block-icon"><MapPin/></div><div><h3>Delivery address</h3><p>{selectedLocation?`Selected delivery area: ${selectedLocation.name}`:"Choose your delivery location from the header, then add/select your full address."}</p><button className="ghost-small">Choose address</button></div></div><div className="checkout-block"><div className="block-icon"><Banknote/></div><div><h3>Cash on delivery</h3><p>Pay when your DENTO HUB order arrives.</p><span className="selected-pill">Selected</span></div></div><div className="checkout-block"><div className="block-icon"><ShieldCheck/></div><div><h3>Server-verified total</h3><p>Product prices and delivery are recalculated securely before the order is created.</p></div></div></section><aside className="summary-card"><h3>Order summary</h3><div><span>Items</span><b>{cart.length}</b></div><div><span>Subtotal</span><b>{egp(subtotal)}</b></div><div><span>Delivery</span><span>{feeLoading?"Checking…":selectedLocation?(effectiveFee!==null?egp(effectiveFee):"Rate not set"):"Choose location"}</span></div>{defaultFee!==null&&deliveryFee===defaultFee&&selectedLocation&&<small>Using store-wide fallback rate.</small>}{freeThreshold!==null&&subtotal>=freeThreshold&&<small>Free-delivery threshold reached.</small>}<hr/><div className="summary-total"><span>Total</span><b>{egp(subtotal+(effectiveFee??0))}</b></div><button className="btn-primary wide" disabled>Choose address to place order</button></aside></main>;
}
