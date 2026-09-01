"use client";
import { ShoppingBag } from "lucide-react";
import { useStore } from "./store-provider";
export function ProductPurchase({id,name,price}:{id:string;name:string;price:number|null}){
 const {addToCart}=useStore();
 if(price===null) return <button className="btn-primary wide" disabled>Price required before purchase</button>;
 return <button className="btn-primary wide" onClick={()=>addToCart({id,name,price})}><ShoppingBag size={18}/> Add to cart</button>;
}
