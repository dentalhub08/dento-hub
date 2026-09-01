import { Suspense } from "react";
import { AdminOrders } from "@/components/admin-orders";

export default function OrdersPage(){
  return <Suspense fallback={null}><AdminOrders/></Suspense>;
}
