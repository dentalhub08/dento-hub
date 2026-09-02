"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LayoutDashboard, LogOut, PackageCheck, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const money = new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat("en-EG", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

type OrderNotice = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  grand_total: number;
  created_at: string;
  customer_name?: string;
};

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AdminTopControls() {
  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("Admin");
  const [orders, setOrders] = useState<OrderNotice[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  async function loadOrders() {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("orders")
      .select("id,order_number,user_id,status,grand_total,created_at")
      .order("created_at", { ascending: false })
      .limit(12);

    const base = (data || []) as OrderNotice[];
    const ids = [...new Set(base.map((row) => row.user_id).filter(Boolean))];
    const names = new Map<string, string>();
    if (ids.length) {
      const { data: profiles } = await supabase.from("profiles").select("id,full_name").in("id", ids);
      for (const profile of profiles || []) names.set(profile.id, profile.full_name || "Customer");
    }
    setOrders(base.map((row) => ({ ...row, customer_name: names.get(row.user_id) || "Customer" })));
  }

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }: { data: { user: { email?: string | null } | null } }) => setEmail(data.user?.email || "Admin"));
    setLastSeen(window.localStorage.getItem("dento-admin-orders-seen"));
    void loadOrders();
    const timer = window.setInterval(() => void loadOrders(), 15000);
    const refresh = () => void loadOrders();
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target)) setMenuOpen(false);
      if (!bellRef.current?.contains(target)) setBellOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  const newCount = useMemo(() => {
    if (!lastSeen) return orders.length;
    const seenAt = new Date(lastSeen).getTime();
    return orders.filter((order) => new Date(order.created_at).getTime() > seenAt).length;
  }, [orders, lastSeen]);

  function openNotifications() {
    const next = !bellOpen;
    setBellOpen(next);
    setMenuOpen(false);
    if (next) {
      const timestamp = new Date().toISOString();
      window.localStorage.setItem("dento-admin-orders-seen", timestamp);
      setLastSeen(timestamp);
    }
  }

  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.replace("/");
  }

  return (
    <div className="admin-top-actions">
      <div className="admin-notification-wrap" ref={bellRef}>
        <button type="button" className="admin-bell-button" onClick={openNotifications} aria-label="Order notifications" aria-expanded={bellOpen}>
          <Bell size={18} />
          {newCount > 0 && <span className="admin-notification-dot">{newCount > 9 ? "9+" : newCount}</span>}
        </button>
        {bellOpen && (
          <div className="admin-orders-popover">
            <div className="admin-popover-head">
              <div><b>Order notifications</b><small>{orders.length ? "Latest customer orders" : "No orders yet"}</small></div>
              <Link href="/admin/orders" onClick={() => setBellOpen(false)}>View all</Link>
            </div>
            <div className="admin-notice-list">
              {orders.length === 0 ? (
                <div className="admin-notice-empty"><ShoppingBag size={22}/><b>No orders yet</b><span>New orders will appear here automatically.</span></div>
              ) : orders.map((order) => (
                <Link key={order.id} href={`/admin/orders?q=${encodeURIComponent(order.order_number)}`} className="admin-notice-row" onClick={() => setBellOpen(false)}>
                  <span className="admin-notice-icon"><PackageCheck size={16}/></span>
                  <div className="admin-notice-copy">
                    <div><b>{order.order_number}</b><em className={`order-status-chip ${order.status}`}>{statusLabel(order.status)}</em></div>
                    <span>{order.customer_name} · {money.format(Number(order.grand_total || 0))}</span>
                    <small>{dateTime.format(new Date(order.created_at))}</small>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/admin/orders" className="admin-popover-footer" onClick={() => setBellOpen(false)}>Open all orders <ShoppingBag size={15}/></Link>
          </div>
        )}
      </div>

      <div className="admin-user-menu-wrap" ref={menuRef}>
        <button type="button" className="admin-user-trigger" onClick={() => { setMenuOpen((value) => !value); setBellOpen(false); }} aria-expanded={menuOpen}>
          <span className="admin-user-avatar">A</span>
          <b>Admin</b>
          <ChevronDown size={14}/>
        </button>
        {menuOpen && (
          <div className="admin-user-dropdown">
            <div className="admin-user-dropdown-head"><b>Administrator</b><small>{email}</small></div>
            <Link href="/admin" onClick={() => setMenuOpen(false)}><LayoutDashboard size={16}/> Dashboard & Insights</Link>
            <Link href="/admin/orders" onClick={() => setMenuOpen(false)}><Bell size={16}/> Notifications & Orders</Link>
            <button type="button" onClick={signOut}><LogOut size={16}/> Sign out</button>
          </div>
        )}
      </div>
    </div>
  );
}
