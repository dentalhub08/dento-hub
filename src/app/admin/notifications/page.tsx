import { Suspense } from "react";
import { AdminOrders } from "@/components/admin-orders";

export default function NotificationsPage(){
  return <Suspense fallback={null}><AdminOrders notificationsView/></Suspense>;
}
