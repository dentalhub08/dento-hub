// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
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

type OrderItemRow = {
  id: string;
  order_id: string;
  product_name_en: string;
  product_name_ar: string | null;
  variation_snapshot: any;
  sku_snapshot: string | null;
  unit_price: number | string;
  discount_amount: number | string;
  final_unit_price: number | string;
  quantity: number;
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

const STATUS_COPY: Record<OrderStatus, {
  label: string;
  short: string;
  description: string;
}> = {
  pending: {
    label: "Order received",
    short: "Pending",
    description: "We received your order and it is waiting for confirmation.",
  },
  confirmed: {
    label: "Order confirmed",
    short: "Confirmed",
    description: "Your order was confirmed and will move to preparation.",
  },
  preparing: {
    label: "Preparing your package",
    short: "Packaging",
    description: "Your dental supplies are being prepared and packed.",
  },
  shipped: {
    label: "Order shipped",
    short: "Shipped",
    description: "Your package has left preparation and is on the way.",
  },
  out_for_delivery: {
    label: "Out for delivery",
    short: "Out for delivery",
    description: "Your order is with the delivery team and should arrive soon.",
  },
  delivered: {
    label: "Delivered",
    short: "Delivered",
    description: "Your order was delivered successfully.",
  },
  cancelled: {
    label: "Order cancelled",
    short: "Cancelled",
    description: "This order was cancelled.",
  },
  rejected: {
    label: "Order rejected",
    short: "Rejected",
    description: "This order could not be fulfilled.",
  },
};

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

function statusClass(status: OrderStatus) {
  if (status === "delivered") return "is-delivered";
  if (status === "cancelled" || status === "rejected") return "is-stopped";
  if (status === "out_for_delivery") return "is-out";
  if (status === "shipped") return "is-shipped";
  if (status === "preparing") return "is-preparing";
  if (status === "confirmed") return "is-confirmed";
  return "is-pending";
}

function statusIcon(status: OrderStatus, size = 18) {
  if (status === "confirmed") return <CheckCircle2 size={size} />;
  if (status === "preparing") return <PackageCheck size={size} />;
  if (status === "shipped") return <Truck size={size} />;
  if (status === "out_for_delivery") return <MapPin size={size} />;
  if (status === "delivered") return <CheckCircle2 size={size} />;
  if (status === "cancelled" || status === "rejected") return <XCircle size={size} />;
  return <Clock3 size={size} />;
}

function addressLines(snapshot: any) {
  if (!snapshot || typeof snapshot !== "object") return [];
  const line1 = [
    snapshot.street,
    snapshot.building && `Building ${snapshot.building}`,
    snapshot.floor && `Floor ${snapshot.floor}`,
    snapshot.apartment && `Apt ${snapshot.apartment}`,
  ].filter(Boolean).join(", ");

  const line2 = [snapshot.city, snapshot.governorate, snapshot.country || "Egypt"]
    .filter(Boolean)
    .join(", ");

  const extra = snapshot.landmark ? `Landmark: ${snapshot.landmark}` : "";
  const notes = snapshot.notes ? `Notes: ${snapshot.notes}` : "";

  return [line1, line2, extra, notes].filter(Boolean);
}

function OrderStatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={`customer-order-status ${statusClass(status)}`}>
      {statusIcon(status, 14)}
      {STATUS_COPY[status]?.short || status}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="customer-orders-loading">
      <Loader2 className="spin" size={22} />
      <span>Loading your orders…</span>
    </div>
  );
}

export function CustomerOrders() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    const supabase = createClient();
    if (!supabase) {
      setError("DENTO HUB could not connect to Supabase.");
      setLoading(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      router.replace("/login?next=/account/orders");
      return;
    }
    setAuthReady(true);

    const { data: orderRows, error: orderError } = await supabase
      .from("orders")
      .select(
        "id,order_number,status,payment_method,payment_status,subtotal,discount_total,delivery_fee,grand_total,currency,delivery_address_snapshot,created_at,confirmed_at,delivered_at,cancelled_at"
      )
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (orderError) {
      setError(orderError.message);
      setLoading(false);
      return;
    }

    const normalizedOrders = (orderRows || []) as OrderRow[];
    setOrders(normalizedOrders);

    if (normalizedOrders.length) {
      const ids = normalizedOrders.map((order) => order.id);
      const { data: itemRows } = await supabase
        .from("order_items")
        .select(
          "id,order_id,product_name_en,product_name_ar,variation_snapshot,sku_snapshot,unit_price,discount_amount,final_unit_price,quantity"
        )
        .in("order_id", ids);

      setItems((itemRows || []) as OrderItemRow[]);
    } else {
      setItems([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const groupedItems = useMemo(() => {
    const map = new Map<string, OrderItemRow[]>();
    for (const item of items) {
      const group = map.get(item.order_id) || [];
      group.push(item);
      map.set(item.order_id, group);
    }
    return map;
  }, [items]);

  if (loading || !authReady) {
    return (
      <main className="customer-orders-page">
        <div className="shell customer-orders-shell">
          <LoadingState />
        </div>
      </main>
    );
  }

  return (
    <main className="customer-orders-page">
      <div className="shell customer-orders-shell">
        <section className="customer-orders-head">
          <div>
            <span className="section-kicker">YOUR ORDERS</span>
            <h1>Track every DENTO HUB order.</h1>
            <p>
              See whether your order is pending, being packaged, shipped, out for delivery,
              or delivered.
            </p>
          </div>
          <button type="button" className="customer-orders-refresh" onClick={() => void load()}>
            <RefreshCw size={16} />
            Refresh status
          </button>
        </section>

        {error && <div className="customer-orders-error">{error}</div>}

        {!orders.length ? (
          <section className="customer-orders-empty">
            <span><ShoppingBag /></span>
            <h2>No orders yet</h2>
            <p>When you place your first order, its live status will appear here.</p>
            <Link href="/shop" className="btn-primary">
              Start shopping <ArrowRight size={17} />
            </Link>
          </section>
        ) : (
          <section className="customer-orders-list">
            {orders.map((order) => {
              const orderItems = groupedItems.get(order.id) || [];
              const firstNames = orderItems.slice(0, 2).map((item) => item.product_name_en);
              const more = Math.max(0, orderItems.length - 2);

              return (
                <Link
                  href={`/account/orders/${order.id}`}
                  key={order.id}
                  className="customer-order-card"
                >
                  <div className="customer-order-card-top">
                    <div>
                      <span className="customer-order-number">{order.order_number}</span>
                      <span className="customer-order-date">
                        <CalendarDays size={14} />
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <OrderStatusPill status={order.status} />
                  </div>

                  <div className="customer-order-card-body">
                    <div className={`customer-order-state-icon ${statusClass(order.status)}`}>
                      {statusIcon(order.status, 22)}
                    </div>
                    <div className="customer-order-state-copy">
                      <h3>{STATUS_COPY[order.status]?.label || order.status}</h3>
                      <p>{STATUS_COPY[order.status]?.description}</p>
                      {firstNames.length > 0 && (
                        <small>
                          {firstNames.join(" · ")}
                          {more > 0 ? ` · +${more} more` : ""}
                        </small>
                      )}
                    </div>
                    <div className="customer-order-total">
                      <small>Total</small>
                      <b>{egp(Number(order.grand_total))}</b>
                      <span>View details <ArrowRight size={14} /></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

export function CustomerOrderDetails() {
  const router = useRouter();
  const params = useParams();
  const orderId = String(params?.id || "");

  const [authReady, setAuthReady] = useState(false);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!orderId) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    if (!supabase) {
      setError("DENTO HUB could not connect to Supabase.");
      setLoading(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      router.replace(`/login?next=/account/orders/${orderId}`);
      return;
    }
    setAuthReady(true);

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .select(
        "id,order_number,status,payment_method,payment_status,subtotal,discount_total,delivery_fee,grand_total,currency,delivery_address_snapshot,created_at,confirmed_at,delivered_at,cancelled_at"
      )
      .eq("id", orderId)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (orderError) {
      setError(orderError.message);
      setLoading(false);
      return;
    }

    if (!orderRow) {
      setError("Order not found.");
      setLoading(false);
      return;
    }

    const [itemsResult, historyResult] = await Promise.all([
      supabase
        .from("order_items")
        .select(
          "id,order_id,product_name_en,product_name_ar,variation_snapshot,sku_snapshot,unit_price,discount_amount,final_unit_price,quantity"
        )
        .eq("order_id", orderId),
      supabase
        .from("order_status_history")
        .select("id,order_id,status,created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true }),
    ]);

    setOrder(orderRow as OrderRow);
    setItems((itemsResult.data || []) as OrderItemRow[]);
    setHistory((historyResult.data || []) as HistoryRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [orderId]);

  const completedIndex = order && FLOW.includes(order.status)
    ? FLOW.indexOf(order.status)
    : -1;

  const historyByStatus = useMemo(() => {
    const map = new Map<OrderStatus, HistoryRow>();
    for (const entry of history) {
      if (!map.has(entry.status)) map.set(entry.status, entry);
    }
    return map;
  }, [history]);

  if (loading || !authReady) {
    return (
      <main className="customer-orders-page">
        <div className="shell customer-orders-shell">
          <LoadingState />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="customer-orders-page">
        <div className="shell customer-orders-shell">
          <section className="customer-orders-empty">
            <XCircle />
            <h2>{error || "Order not found"}</h2>
            <Link href="/account/orders" className="btn-secondary">
              <ArrowLeft size={16} /> Back to my orders
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const stopped = order.status === "cancelled" || order.status === "rejected";
  const snapshot = order.delivery_address_snapshot || {};

  return (
    <main className="customer-orders-page">
      <div className="shell customer-order-detail-shell">
        <div className="customer-order-detail-nav">
          <Link href="/account/orders">
            <ArrowLeft size={16} />
            My orders
          </Link>
          <button type="button" onClick={() => void load()}>
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <section className="customer-order-detail-hero">
          <div>
            <span className="section-kicker">ORDER {order.order_number}</span>
            <h1>{STATUS_COPY[order.status].label}</h1>
            <p>{STATUS_COPY[order.status].description}</p>
          </div>
          <OrderStatusPill status={order.status} />
        </section>

        {stopped ? (
          <section className="customer-order-stopped">
            <XCircle />
            <div>
              <b>{STATUS_COPY[order.status].label}</b>
              <span>{STATUS_COPY[order.status].description}</span>
            </div>
          </section>
        ) : (
          <section className="customer-order-tracker-card">
            <div className="customer-order-tracker-title">
              <div>
                <span className="section-kicker">LIVE STATUS</span>
                <h2>Order journey</h2>
              </div>
              <small>Last checked just now</small>
            </div>

            <div className="customer-order-tracker">
              {FLOW.map((status, index) => {
                const isDone = index < completedIndex;
                const isCurrent = index === completedIndex;
                const entry = historyByStatus.get(status);

                return (
                  <div
                    key={status}
                    className={[
                      "customer-order-step",
                      isDone ? "done" : "",
                      isCurrent ? "current" : "",
                    ].filter(Boolean).join(" ")}
                  >
                    <div className="customer-order-step-marker">
                      {isDone ? <CheckCircle2 size={18} /> : statusIcon(status, 18)}
                    </div>
                    <div>
                      <b>{STATUS_COPY[status].short}</b>
                      <span>
                        {entry
                          ? formatDate(entry.created_at)
                          : isCurrent
                          ? "Current stage"
                          : isDone
                          ? "Completed"
                          : "Waiting"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="customer-order-detail-grid">
          <section className="customer-order-panel">
            <div className="customer-order-panel-head">
              <div>
                <span className="section-kicker">ORDER CONTENTS</span>
                <h2>Your items</h2>
              </div>
              <span>{items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)} items</span>
            </div>

            <div className="customer-order-items">
              {items.map((item) => (
                <div key={item.id} className="customer-order-item">
                  <div className="customer-order-item-icon">
                    <PackageCheck />
                  </div>
                  <div className="customer-order-item-copy">
                    <b>{item.product_name_en}</b>
                    <span>
                      Qty {item.quantity}
                      {item.sku_snapshot ? ` · ${item.sku_snapshot}` : ""}
                    </span>
                  </div>
                  <div className="customer-order-item-price">
                    <small>{egp(Number(item.final_unit_price))} each</small>
                    <b>{egp(Number(item.final_unit_price) * Number(item.quantity))}</b>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="customer-order-side">
            <section className="customer-order-panel customer-order-summary-panel">
              <span className="section-kicker">ORDER SUMMARY</span>
              <h2>{order.order_number}</h2>

              <div className="customer-order-summary-lines">
                <div><span>Placed</span><b>{formatDate(order.created_at)}</b></div>
                <div><span>Subtotal</span><b>{egp(Number(order.subtotal))}</b></div>
                {Number(order.discount_total) > 0 && (
                  <div><span>Discount</span><b>-{egp(Number(order.discount_total))}</b></div>
                )}
                <div><span>Delivery</span><b>{egp(Number(order.delivery_fee))}</b></div>
                <div className="total"><span>Total</span><b>{egp(Number(order.grand_total))}</b></div>
              </div>
            </section>

            <section className="customer-order-panel">
              <div className="customer-order-mini-title">
                <MapPin size={18} />
                <h3>Delivery address</h3>
              </div>
              {snapshot.recipient_name && <b>{snapshot.recipient_name}</b>}
              <div className="customer-order-address">
                {addressLines(snapshot).map((line, index) => (
                  <span key={`${line}-${index}`}>{line}</span>
                ))}
              </div>
              {snapshot.phone && <small>{snapshot.phone}</small>}
            </section>

            <section className="customer-order-panel">
              <div className="customer-order-mini-title">
                <CreditCard size={18} />
                <h3>Payment</h3>
              </div>
              <b>Cash on delivery</b>
              <span className="customer-order-payment-state">
                Payment status: {order.payment_status || "unpaid"}
              </span>
            </section>
          </aside>
        </div>

        {history.length > 0 && (
          <section className="customer-order-history-panel">
            <span className="section-kicker">STATUS HISTORY</span>
            <h2>Updates</h2>
            <div className="customer-order-history-list">
              {history.slice().reverse().map((entry) => (
                <div key={entry.id}>
                  <span className={`customer-order-history-icon ${statusClass(entry.status)}`}>
                    {statusIcon(entry.status, 15)}
                  </span>
                  <div>
                    <b>{STATUS_COPY[entry.status]?.label || entry.status}</b>
                    <span>{formatDate(entry.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
