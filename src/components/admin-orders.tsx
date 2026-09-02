"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, LoaderCircle, PackageCheck, RefreshCcw, Search, ShoppingBag, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ORDER_STATUSES = ["pending", "confirmed", "preparing", "shipped", "out_for_delivery", "delivered", "cancelled", "rejected"] as const;
const money = new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 2 });
const dateTime = new Intl.DateTimeFormat("en-EG", { dateStyle: "medium", timeStyle: "short" });

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  discount_total: number;
  delivery_fee: number;
  grand_total: number;
  currency: string;
  delivery_address_snapshot: Record<string, unknown> | null;
  created_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  customer_name: string;
  customer_phone: string;
  item_count: number;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_name_en: string;
  variation_snapshot: Record<string, unknown> | null;
  quantity: number;
  final_unit_price: number;
};
type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

function pretty(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AdminOrders({ notificationsView = false }: { notificationsView?: boolean }) {
  const params = useSearchParams();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState(params.get("q") || "");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const { data: orderData, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) { setMessage(error.message); setLoading(false); return; }
    const base = (orderData || []) as Omit<OrderRow, "customer_name" | "customer_phone" | "item_count">[];
    const userIds = [...new Set(base.map((row) => row.user_id))];
    const orderIds = base.map((row) => row.id);
    const [{ data: profiles }, { data: itemData }] = await Promise.all([
      userIds.length ? supabase.from("profiles").select("id,full_name,phone").in("id", userIds) : Promise.resolve({ data: [] }),
      orderIds.length ? supabase.from("order_items").select("id,order_id,product_name_en,variation_snapshot,quantity,final_unit_price").in("order_id", orderIds) : Promise.resolve({ data: [] }),
    ]);
    const profileMap = new Map<string, ProfileRow>(((profiles || []) as ProfileRow[]).map((profile) => [profile.id, profile]));
    const typedItems = (itemData || []) as OrderItem[];
    const counts = new Map<string, number>();
    for (const item of typedItems) counts.set(item.order_id, (counts.get(item.order_id) || 0) + Number(item.quantity || 0));
    setItems(typedItems);
    setOrders(base.map((row) => {
      const profile = profileMap.get(row.user_id);
      const snapshot = row.delivery_address_snapshot || {};
      return {
        ...row,
        customer_name: profile?.full_name || String(snapshot.recipient_name || "Customer"),
        customer_phone: profile?.phone || String(snapshot.phone || ""),
        item_count: counts.get(row.id) || 0,
      };
    }));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (!needle) return true;
      return [order.order_number, order.customer_name, order.customer_phone, order.status]
        .some((value) => String(value || "").toLowerCase().includes(needle));
    });
  }, [orders, query, status]);

  const selected = orders.find((order) => order.id === selectedId) || null;
  const selectedItems = selected ? items.filter((item) => item.order_id === selected.id) : [];

  async function updateStatus(order: OrderRow, nextStatus: string) {
    if (nextStatus === order.status) return;
    const supabase = createClient();
    if (!supabase) return;
    setSavingId(order.id);
    setMessage("");
    const patch: Record<string, string | null> = { status: nextStatus };
    const now = new Date().toISOString();
    if (nextStatus === "confirmed" && !order.confirmed_at) patch.confirmed_at = now;
    if (nextStatus === "delivered") patch.delivered_at = now;
    if (nextStatus === "cancelled") patch.cancelled_at = now;
    const { error } = await supabase.from("orders").update(patch).eq("id", order.id);
    if (error) { setMessage(error.message); setSavingId(null); return; }
    const { data: auth } = await supabase.auth.getUser();
    await supabase.from("order_status_history").insert({ order_id: order.id, status: nextStatus, changed_by: auth.user?.id || null });
    await load();
    setSavingId(null);
  }

  return (
    <>
      <div className="admin-pagehead">
        <div><span className="admin-kicker">OPERATIONS</span><h1>{notificationsView ? "Order Notifications" : "All Orders"}</h1><p>{notificationsView ? "Every customer order appears here for Admin review." : "Search every order, inspect its contents and update fulfillment status."}</p></div>
        <button className="admin-secondary" type="button" onClick={() => void load()}><RefreshCcw size={15}/> Refresh</button>
      </div>

      <div className="order-admin-summary">
        <div><span>Total orders</span><b>{orders.length}</b></div>
        <div><span>Pending</span><b>{orders.filter((o) => o.status === "pending").length}</b></div>
        <div><span>In progress</span><b>{orders.filter((o) => ["confirmed","preparing","shipped","out_for_delivery"].includes(o.status)).length}</b></div>
        <div><span>Delivered</span><b>{orders.filter((o) => o.status === "delivered").length}</b></div>
      </div>

      <div className="admin-table-card admin-orders-card">
        <div className="table-tools order-table-tools">
          <div className="admin-search boxed"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer or phone..."/></div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="admin-filter-select"><option value="all">All statuses</option>{ORDER_STATUSES.map((option) => <option key={option} value={option}>{pretty(option)}</option>)}</select>
        </div>
        {message && <div className="admin-inline-error">{message}</div>}
        {loading ? (
          <div className="orders-empty"><LoaderCircle className="spin"/><h3>Loading orders</h3><p>Reading live order data from Supabase.</p></div>
        ) : filtered.length === 0 ? (
          <div className="orders-empty"><div className="empty-icon"><ShoppingBag/></div><h3>{orders.length ? "No orders match this filter" : "No orders yet"}</h3><p>{orders.length ? "Try another search or status." : "Customer orders will appear here automatically after checkout."}</p></div>
        ) : (
          <div className="admin-orders-table-wrap"><table className="admin-orders-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th><th></th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id}>
            <td><b>{order.order_number}</b><small>COD · {order.payment_status}</small></td>
            <td><b>{order.customer_name}</b><small>{order.customer_phone || "No phone"}</small></td>
            <td><b>{order.item_count}</b><small>unit{order.item_count === 1 ? "" : "s"}</small></td>
            <td><b>{money.format(Number(order.grand_total || 0))}</b><small>Delivery {money.format(Number(order.delivery_fee || 0))}</small></td>
            <td><div className="order-status-control"><span className={`order-status-chip ${order.status}`}>{pretty(order.status)}</span><select value={order.status} disabled={savingId === order.id} onChange={(event) => void updateStatus(order, event.target.value)}>{ORDER_STATUSES.map((option) => <option key={option} value={option}>{pretty(option)}</option>)}</select></div></td>
            <td><b>{dateTime.format(new Date(order.created_at))}</b></td>
            <td><button className="admin-icon-action" type="button" onClick={() => setSelectedId(order.id)} aria-label={`View ${order.order_number}`}><Eye size={16}/></button></td>
          </tr>)}</tbody></table></div>
        )}
      </div>

      {selected && (
        <div className="order-detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}>
          <aside className="order-detail-panel">
            <div className="order-detail-head"><div><small>ORDER</small><h2>{selected.order_number}</h2><span className={`order-status-chip ${selected.status}`}>{pretty(selected.status)}</span></div><button type="button" onClick={() => setSelectedId(null)}><X size={19}/></button></div>
            <div className="order-detail-section"><h3>Customer</h3><div className="order-detail-grid"><div><span>Name</span><b>{selected.customer_name}</b></div><div><span>Phone</span><b>{selected.customer_phone || "—"}</b></div><div><span>Placed</span><b>{dateTime.format(new Date(selected.created_at))}</b></div><div><span>Payment</span><b>Cash on Delivery</b></div></div></div>
            <div className="order-detail-section"><h3>Items</h3><div className="order-detail-items">{selectedItems.map((item) => <div key={item.id}><div><b>{item.product_name_en}</b><small>{item.variation_snapshot && Object.keys(item.variation_snapshot).length ? Object.values(item.variation_snapshot).join(" · ") : "Standard"}</small></div><span>{item.quantity} × {money.format(Number(item.final_unit_price || 0))}</span></div>)}</div></div>
            <div className="order-detail-section"><h3>Delivery address</h3><p className="order-address-copy">{selected.delivery_address_snapshot ? Object.values(selected.delivery_address_snapshot).filter((value) => typeof value === "string" && value.trim()).join(", ") : "No address snapshot"}</p></div>
            <div className="order-totals"><div><span>Subtotal</span><b>{money.format(Number(selected.subtotal || 0))}</b></div><div><span>Delivery</span><b>{money.format(Number(selected.delivery_fee || 0))}</b></div><div><span>Discount</span><b>− {money.format(Number(selected.discount_total || 0))}</b></div><div className="grand"><span>Total</span><b>{money.format(Number(selected.grand_total || 0))}</b></div></div>
          </aside>
        </div>
      )}
    </>
  );
}
