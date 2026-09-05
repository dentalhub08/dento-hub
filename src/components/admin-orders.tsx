// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Clock3,
  ExternalLink,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { egp } from "@/lib/format";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "rejected";

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  subtotal: number | string;
  discount_total: number | string;
  delivery_fee: number | string;
  grand_total: number | string;
  currency: string;
  delivery_address_snapshot: any;
  created_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
};

type ItemRow = {
  id: string;
  order_id: string;
  product_name_en: string;
  product_name_ar: string | null;
  sku_snapshot: string | null;
  variation_snapshot: any;
  final_unit_price: number | string;
  quantity: number;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

type HistoryRow = {
  id: string;
  order_id: string;
  status: OrderStatus;
  created_at: string;
};

const FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const STATUS: Record<OrderStatus, { label: string; note: string }> = {
  pending: {
    label: "Pending",
    note: "Order received and waiting for confirmation.",
  },
  confirmed: {
    label: "Confirmed",
    note: "Order confirmed and ready for preparation.",
  },
  preparing: {
    label: "Packaging",
    note: "Products are being prepared and packed.",
  },
  shipped: {
    label: "Shipped",
    note: "Package has left preparation.",
  },
  out_for_delivery: {
    label: "Out for delivery",
    note: "Package is currently with the delivery team.",
  },
  delivered: {
    label: "Delivered",
    note: "Order delivered successfully.",
  },
  cancelled: {
    label: "Cancelled",
    note: "Order was cancelled.",
  },
  rejected: {
    label: "Rejected",
    note: "Order was rejected.",
  },
};

function iconFor(status: OrderStatus, size = 17) {
  if (status === "confirmed") return <CircleCheck size={size} />;
  if (status === "preparing") return <PackageCheck size={size} />;
  if (status === "shipped") return <Truck size={size} />;
  if (status === "out_for_delivery") return <MapPin size={size} />;
  if (status === "delivered") return <CheckCircle2 size={size} />;
  if (status === "cancelled" || status === "rejected")
    return <XCircle size={size} />;
  return <Clock3 size={size} />;
}

function statusClass(status: OrderStatus) {
  return `status-${status.replaceAll("_", "-")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-EG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function addressParts(snapshot: any) {
  if (!snapshot || typeof snapshot !== "object") return [];

  return [
    snapshot.street,
    snapshot.building ? `Building ${snapshot.building}` : "",
    snapshot.floor ? `Floor ${snapshot.floor}` : "",
    snapshot.apartment ? `Apartment ${snapshot.apartment}` : "",
    snapshot.city,
    snapshot.governorate,
    snapshot.country || "Egypt",
  ].filter(Boolean);
}

function mapsUrl(snapshot: any) {
  const query = [
    snapshot?.street,
    snapshot?.building,
    snapshot?.city,
    snapshot?.governorate,
    snapshot?.country || "Egypt",
    snapshot?.landmark,
  ]
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

function itemCount(items: ItemRow[]) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`admin-orders-v3-status ${statusClass(status)}`}>
      {iconFor(status, 14)}
      {STATUS[status]?.label || status}
    </span>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [profiles, setProfiles] = useState<Map<string, ProfileRow>>(new Map());
  const [itemsByOrder, setItemsByOrder] = useState<Map<string, ItemRow[]>>(
    new Map()
  );

  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [selectedItems, setSelectedItems] = useState<ItemRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  async function loadOrders() {
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not available.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id,order_number,user_id,status,payment_method,payment_status,subtotal,discount_total,delivery_fee,grand_total,currency,delivery_address_snapshot,created_at,confirmed_at,delivered_at,cancelled_at"
      )
      .order("created_at", { ascending: false });

    if (ordersError) {
      setError(ordersError.message);
      setLoading(false);
      return;
    }

    const rows = (data || []) as OrderRow[];
    setOrders(rows);

    if (!rows.length) {
      setProfiles(new Map());
      setItemsByOrder(new Map());
      setLoading(false);
      return;
    }

    const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))];
    const orderIds = rows.map((row) => row.id);

    const [profileResult, itemResult] = await Promise.all([
      userIds.length
        ? supabase
            .from("profiles")
            .select("id,full_name,phone")
            .in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("order_items")
        .select(
          "id,order_id,product_name_en,product_name_ar,sku_snapshot,variation_snapshot,final_unit_price,quantity"
        )
        .in("order_id", orderIds),
    ]);

    const profileMap = new Map<string, ProfileRow>();
    for (const profile of (profileResult.data || []) as ProfileRow[]) {
      profileMap.set(profile.id, profile);
    }
    setProfiles(profileMap);

    const itemMap = new Map<string, ItemRow[]>();
    for (const item of (itemResult.data || []) as ItemRow[]) {
      const current = itemMap.get(item.order_id) || [];
      current.push(item);
      itemMap.set(item.order_id, current);
    }
    setItemsByOrder(itemMap);

    setLoading(false);
  }

  async function openOrder(order: OrderRow) {
    const supabase = createClient();
    if (!supabase) return;

    setSelected(order);
    setDetailsLoading(true);
    setSelectedItems(itemsByOrder.get(order.id) || []);
    setHistory([]);

    const [itemsResult, historyResult] = await Promise.all([
      supabase
        .from("order_items")
        .select(
          "id,order_id,product_name_en,product_name_ar,sku_snapshot,variation_snapshot,final_unit_price,quantity"
        )
        .eq("order_id", order.id),
      supabase
        .from("order_status_history")
        .select("id,order_id,status,created_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true }),
    ]);

    if (!itemsResult.error) setSelectedItems((itemsResult.data || []) as ItemRow[]);
    if (!historyResult.error)
      setHistory((historyResult.data || []) as HistoryRow[]);

    setDetailsLoading(false);
  }

  async function updateStatus(nextStatus: OrderStatus) {
    if (!selected || updating) return;

    const supabase = createClient();
    if (!supabase) return;

    setUpdating(true);
    setError("");

    const now = new Date().toISOString();
    const patch: Record<string, any> = { status: nextStatus };

    if (nextStatus === "confirmed" && !selected.confirmed_at) {
      patch.confirmed_at = now;
    }
    if (nextStatus === "delivered") {
      patch.delivered_at = now;
    }
    if (nextStatus === "cancelled" || nextStatus === "rejected") {
      patch.cancelled_at = now;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(patch)
      .eq("id", selected.id);

    if (updateError) {
      setError(updateError.message);
      setUpdating(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();

    await supabase.from("order_status_history").insert({
      order_id: selected.id,
      status: nextStatus,
      changed_by: authData?.user?.id || null,
    });

    await supabase.from("notifications").insert({
      user_id: selected.user_id,
      title: `Order ${STATUS[nextStatus].label}`,
      body: `Your order ${selected.order_number} is now ${STATUS[
        nextStatus
      ].label.toLowerCase()}.`,
      kind: "order_status",
    });

    const updated: OrderRow = { ...selected, ...patch, status: nextStatus };
    setSelected(updated);
    setOrders((current) =>
      current.map((order) => (order.id === selected.id ? updated : order))
    );

    const { data: historyRows } = await supabase
      .from("order_status_history")
      .select("id,order_id,status,created_at")
      .eq("order_id", selected.id)
      .order("created_at", { ascending: true });

    setHistory((historyRows || []) as HistoryRow[]);
    setUpdating(false);
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;

      if (!needle) return true;

      const profile = profiles.get(order.user_id);
      const snapshot = order.delivery_address_snapshot || {};

      const haystack = [
        order.order_number,
        profile?.full_name,
        profile?.phone,
        snapshot.recipient_name,
        snapshot.phone,
        snapshot.city,
        snapshot.governorate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [orders, profiles, search, filter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const inProgress = orders.filter((o) =>
      ["confirmed", "preparing", "shipped", "out_for_delivery"].includes(o.status)
    ).length;
    const delivered = orders.filter((o) => o.status === "delivered").length;

    return { total, pending, inProgress, delivered };
  }, [orders]);

  const selectedProfile = selected ? profiles.get(selected.user_id) : null;
  const selectedSnapshot = selected?.delivery_address_snapshot || {};

  return (
    <div className="admin-orders-v3">
      <header className="admin-orders-v3-head">
        <div>
          <span className="admin-kicker">OPERATIONS</span>
          <h1>All Orders</h1>
          <p>
            View every order, inspect its products and delivery location, and
            update fulfillment status.
          </p>
        </div>

        <button
          type="button"
          className="admin-orders-v3-refresh"
          onClick={() => void loadOrders()}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {error && <div className="admin-orders-v3-error">{error}</div>}

      <section className="admin-orders-v3-kpis">
        <article>
          <span>Total orders</span>
          <b>{stats.total}</b>
        </article>
        <article>
          <span>Pending</span>
          <b>{stats.pending}</b>
        </article>
        <article>
          <span>In progress</span>
          <b>{stats.inProgress}</b>
        </article>
        <article>
          <span>Delivered</span>
          <b>{stats.delivered}</b>
        </article>
      </section>

      <section className="admin-orders-v3-toolbar">
        <label className="admin-orders-v3-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer, phone or location..."
          />
        </label>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as any)}
        >
          <option value="all">All statuses</option>
          {FLOW.map((status) => (
            <option key={status} value={status}>
              {STATUS[status].label}
            </option>
          ))}
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </section>

      {loading ? (
        <div className="admin-orders-v3-loading">
          <Loader2 className="spin" size={22} />
          Loading orders…
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-orders-v3-empty">
          <ShoppingBag size={26} />
          <b>No matching orders</b>
          <span>Try a different search or status filter.</span>
        </div>
      ) : (
        <section className="admin-orders-v3-list">
          {filtered.map((order) => {
            const profile = profiles.get(order.user_id);
            const snapshot = order.delivery_address_snapshot || {};
            const items = itemsByOrder.get(order.id) || [];
            const quantity = itemCount(items);

            return (
              <button
                type="button"
                key={order.id}
                className="admin-orders-v3-card"
                onClick={() => void openOrder(order)}
              >
                <div className="admin-orders-v3-card-top">
                  <div>
                    <b>{order.order_number}</b>
                    <span>
                      <CalendarDays size={13} />
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div className="admin-orders-v3-card-grid">
                  <div className="admin-orders-v3-card-section">
                    <UserRound size={17} />
                    <div>
                      <small>Customer</small>
                      <b>
                        {profile?.full_name ||
                          snapshot.recipient_name ||
                          "Customer"}
                      </b>
                      <span>{profile?.phone || snapshot.phone || "No phone"}</span>
                    </div>
                  </div>

                  <div className="admin-orders-v3-card-section">
                    <PackageCheck size={17} />
                    <div>
                      <small>Items</small>
                      <b>
                        {quantity || items.length || "—"}{" "}
                        {quantity === 1 ? "item" : "items"}
                      </b>
                      <span>
                        {items[0]?.product_name_en || "Open to view contents"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-orders-v3-card-section">
                    <MapPin size={17} />
                    <div>
                      <small>Delivery</small>
                      <b>
                        {[snapshot.city, snapshot.governorate]
                          .filter(Boolean)
                          .join(", ") || "Address saved"}
                      </b>
                      <span>{egp(Number(order.delivery_fee || 0))}</span>
                    </div>
                  </div>

                  <div className="admin-orders-v3-total">
                    <small>Total</small>
                    <b>{egp(Number(order.grand_total || 0))}</b>
                    <span>
                      View order <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </section>
      )}

      {selected && (
        <div
          className="admin-orders-v3-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Order ${selected.order_number}`}
        >
          <aside className="admin-orders-v3-drawer">
            <header className="admin-orders-v3-drawer-head">
              <div>
                <span className="admin-kicker">ORDER DETAILS</span>
                <h2>{selected.order_number}</h2>
                <span>{formatDate(selected.created_at)}</span>
              </div>

              <button
                type="button"
                aria-label="Close order"
                onClick={() => setSelected(null)}
              >
                <X size={19} />
              </button>
            </header>

            <div className="admin-orders-v3-drawer-scroll">
              <section className="admin-orders-v3-current-status">
                <div className={statusClass(selected.status)}>
                  {iconFor(selected.status, 21)}
                </div>
                <div>
                  <small>Current status</small>
                  <h3>{STATUS[selected.status].label}</h3>
                  <p>{STATUS[selected.status].note}</p>
                </div>
              </section>

              <section className="admin-orders-v3-panel">
                <div className="admin-orders-v3-panel-title">
                  <div>
                    <UserRound size={18} />
                    <h3>Customer</h3>
                  </div>
                </div>

                <div className="admin-orders-v3-customer">
                  <b>
                    {selectedProfile?.full_name ||
                      selectedSnapshot.recipient_name ||
                      "Customer"}
                  </b>
                  <span>
                    <Phone size={14} />
                    {selectedProfile?.phone ||
                      selectedSnapshot.phone ||
                      "No phone saved"}
                  </span>
                </div>
              </section>

              <section className="admin-orders-v3-panel">
                <div className="admin-orders-v3-panel-title">
                  <div>
                    <MapPin size={18} />
                    <h3>Delivery location</h3>
                  </div>

                  <a
                    href={mapsUrl(selectedSnapshot)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Maps <ExternalLink size={13} />
                  </a>
                </div>

                <div className="admin-orders-v3-address">
                  {selectedSnapshot.label && (
                    <strong>{selectedSnapshot.label}</strong>
                  )}

                  {addressParts(selectedSnapshot).map((part, index) => (
                    <span key={`${part}-${index}`}>{part}</span>
                  ))}

                  {selectedSnapshot.landmark && (
                    <span>
                      <b>Landmark:</b> {selectedSnapshot.landmark}
                    </span>
                  )}

                  {selectedSnapshot.notes && (
                    <span>
                      <b>Delivery notes:</b> {selectedSnapshot.notes}
                    </span>
                  )}
                </div>
              </section>

              <section className="admin-orders-v3-panel">
                <div className="admin-orders-v3-panel-title">
                  <div>
                    <PackageCheck size={18} />
                    <h3>Order contents</h3>
                  </div>
                  <span>{itemCount(selectedItems)} units</span>
                </div>

                {detailsLoading ? (
                  <div className="admin-orders-v3-mini-loading">
                    <Loader2 className="spin" size={18} />
                    Loading products…
                  </div>
                ) : (
                  <div className="admin-orders-v3-items">
                    {selectedItems.map((item) => (
                      <article key={item.id}>
                        <div>
                          <b>{item.product_name_en}</b>
                          <span>
                            Quantity {item.quantity}
                            {item.sku_snapshot
                              ? ` · SKU ${item.sku_snapshot}`
                              : ""}
                          </span>
                        </div>

                        <div>
                          <small>
                            {egp(Number(item.final_unit_price))} each
                          </small>
                          <b>
                            {egp(
                              Number(item.final_unit_price) *
                                Number(item.quantity)
                            )}
                          </b>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="admin-orders-v3-panel">
                <div className="admin-orders-v3-panel-title">
                  <div>
                    <ShoppingBag size={18} />
                    <h3>Payment & total</h3>
                  </div>
                </div>

                <div className="admin-orders-v3-summary">
                  <div>
                    <span>Subtotal</span>
                    <b>{egp(Number(selected.subtotal || 0))}</b>
                  </div>
                  {Number(selected.discount_total || 0) > 0 && (
                    <div>
                      <span>Discount</span>
                      <b>-{egp(Number(selected.discount_total))}</b>
                    </div>
                  )}
                  <div>
                    <span>Delivery</span>
                    <b>{egp(Number(selected.delivery_fee || 0))}</b>
                  </div>
                  <div className="total">
                    <span>Total</span>
                    <b>{egp(Number(selected.grand_total || 0))}</b>
                  </div>
                  <div>
                    <span>Payment</span>
                    <b>Cash on delivery · {selected.payment_status}</b>
                  </div>
                </div>
              </section>

              <section className="admin-orders-v3-panel">
                <div className="admin-orders-v3-panel-title">
                  <div>
                    <RefreshCw size={18} />
                    <h3>Fulfillment status</h3>
                  </div>
                </div>

                <div className="admin-orders-v3-status-actions">
                  {FLOW.map((status) => (
                    <button
                      type="button"
                      key={status}
                      disabled={updating || selected.status === status}
                      className={
                        selected.status === status ? "selected" : undefined
                      }
                      onClick={() => void updateStatus(status)}
                    >
                      {iconFor(status, 16)}
                      <span>{STATUS[status].label}</span>
                      {selected.status === status && <CheckCircle2 size={15} />}
                    </button>
                  ))}
                </div>

                <div className="admin-orders-v3-danger-actions">
                  <button
                    type="button"
                    disabled={updating || selected.status === "cancelled"}
                    onClick={() => void updateStatus("cancelled")}
                  >
                    Cancel order
                  </button>
                  <button
                    type="button"
                    disabled={updating || selected.status === "rejected"}
                    onClick={() => void updateStatus("rejected")}
                  >
                    Reject order
                  </button>
                </div>

                {updating && (
                  <div className="admin-orders-v3-updating">
                    <Loader2 className="spin" size={16} />
                    Updating customer order status…
                  </div>
                )}
              </section>

              {history.length > 0 && (
                <section className="admin-orders-v3-panel">
                  <div className="admin-orders-v3-panel-title">
                    <div>
                      <Clock3 size={18} />
                      <h3>Status history</h3>
                    </div>
                  </div>

                  <div className="admin-orders-v3-history">
                    {history
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <div key={entry.id}>
                          <span className={statusClass(entry.status)}>
                            {iconFor(entry.status, 14)}
                          </span>
                          <div>
                            <b>{STATUS[entry.status]?.label || entry.status}</b>
                            <small>{formatDate(entry.created_at)}</small>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
