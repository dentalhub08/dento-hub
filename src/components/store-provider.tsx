"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CartItem = { id: string; name: string; price: number; quantity: number };
type Locale = "en" | "ar";

type StoreContextType = {
  locale: Locale;
  setLocale: (value: Locale) => void;
  cart: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  toast: string | null;
  showToast: (message: string) => void;
  deliveryLocation: string | null;
  setDeliveryLocation: (id: string | null) => void;
  signedIn: boolean;
  accountSyncing: boolean;
};

const StoreContext = createContext<StoreContextType | null>(null);
const LEGACY_CART_KEY = "dento-cart";
const GUEST_CART_KEY = "dento-guest-cart";
const LEGACY_WISHLIST_KEY = "dento-wishlist";
const GUEST_WISHLIST_KEY = "dento-guest-wishlist";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function guestCartSnapshot(): CartItem[] {
  const current = readJson<CartItem[]>(GUEST_CART_KEY, []);
  if (current.length) return current;
  return readJson<CartItem[]>(LEGACY_CART_KEY, []);
}

function guestWishlistSnapshot(): string[] {
  const current = readJson<string[]>(GUEST_WISHLIST_KEY, []);
  if (current.length) return current;
  return readJson<string[]>(LEGACY_WISHLIST_KEY, []);
}

function mergeCart(remote: CartItem[], guest: CartItem[]) {
  const map = new Map<string, CartItem>();
  for (const item of remote) map.set(item.id, { ...item });
  for (const item of guest) {
    const hit = map.get(item.id);
    map.set(item.id, hit ? { ...hit, quantity: Math.max(hit.quantity, item.quantity) } : { ...item });
  }
  return [...map.values()];
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [deliveryLocation, setDeliveryLocationState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [accountSyncing, setAccountSyncing] = useState(false);
  const [ready, setReady] = useState(false);
  const cartIdRef = useRef<string | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const savedLocale = (localStorage.getItem("dento-locale") as Locale) || "en";
    setLocaleState(savedLocale);
    setDeliveryLocationState(localStorage.getItem("dento-delivery-location"));

    const client = createClient();
    if (!client) {
      setCart(guestCartSnapshot());
      setWishlist(guestWishlistSnapshot());
      setReady(true);
      return;
    }
    const supabase = client;

    let active = true;

    async function hydrate(nextUserId: string | null) {
      if (!active) return;
      setAccountSyncing(true);
      cartIdRef.current = null;

      if (!nextUserId) {
        setUserId(null);
        setCart(guestCartSnapshot());
        setWishlist(guestWishlistSnapshot());
        setAccountSyncing(false);
        setReady(true);
        return;
      }

      setUserId(nextUserId);
      const guestCart = guestCartSnapshot();
      const guestWishlist = guestWishlistSnapshot();

      let cartId: string | null = null;
      const { data: cartRow } = await supabase.from("carts").select("id").eq("user_id", nextUserId).maybeSingle();
      cartId = cartRow?.id || null;
      if (!cartId) {
        const { data: created } = await supabase.from("carts").insert({ user_id: nextUserId }).select("id").single();
        cartId = created?.id || null;
      }
      cartIdRef.current = cartId;

      let remoteCart: CartItem[] = [];
      if (cartId) {
        const { data: itemRows } = await supabase
          .from("cart_items")
          .select("quantity,products(source_row_no,source_name,canonical_name_en,selling_price_egp)")
          .eq("cart_id", cartId);
        remoteCart = ((itemRows || []) as unknown as Array<{
          quantity: number;
          products: { source_row_no: number | null; source_name: string | null; canonical_name_en: string | null; selling_price_egp: number | string | null } | null;
        }>).flatMap((row) => {
          const p = row.products;
          if (!p?.source_row_no || p.selling_price_egp === null) return [];
          return [{
            id: String(p.source_row_no),
            name: p.canonical_name_en || p.source_name || `Product ${p.source_row_no}`,
            price: Number(p.selling_price_egp),
            quantity: row.quantity,
          }];
        });
      }

      const { data: wishlistRows } = await supabase
        .from("wishlists")
        .select("products(source_row_no)")
        .eq("user_id", nextUserId);
      const remoteWishlist = ((wishlistRows || []) as unknown as Array<{ products: { source_row_no: number | null } | null }>)
        .flatMap((row) => row.products?.source_row_no ? [String(row.products.source_row_no)] : []);

      if (!active) return;
      setCart(mergeCart(remoteCart, guestCart));
      setWishlist([...new Set([...remoteWishlist, ...guestWishlist])]);
      localStorage.removeItem(GUEST_CART_KEY);
      localStorage.removeItem(LEGACY_CART_KEY);
      localStorage.removeItem(GUEST_WISHLIST_KEY);
      localStorage.removeItem(LEGACY_WISHLIST_KEY);
      setAccountSyncing(false);
      setReady(true);
    }

    supabase.auth.getUser().then(({ data }) => void hydrate(data.user?.id || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrate(session?.user?.id || null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready || userId) return;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
  }, [cart, wishlist, ready, userId]);

  useEffect(() => {
    if (!ready || !userId || accountSyncing) return;
    const supabase = createClient();
    if (!supabase) return;
    const snapshotCart = cart.map((item) => ({ ...item }));
    const snapshotWishlist = [...wishlist];
    const currentUser = userId;
    const timer = window.setTimeout(() => {
      saveQueue.current = saveQueue.current.then(async () => {
        if (!currentUser) return;
        let cartId = cartIdRef.current;
        if (!cartId) {
          const { data } = await supabase.from("carts").upsert({ user_id: currentUser }, { onConflict: "user_id" }).select("id").single();
          cartId = data?.id || null;
          cartIdRef.current = cartId;
        }

        const sourceIds = [...new Set([...snapshotCart.map((item) => Number(item.id)), ...snapshotWishlist.map(Number)].filter(Number.isFinite))];
        let productMap = new Map<number, string>();
        if (sourceIds.length) {
          const { data } = await supabase.from("products").select("id,source_row_no").in("source_row_no", sourceIds);
          productMap = new Map(((data || []) as Array<{ id: string; source_row_no: number | null }>).flatMap((row) => row.source_row_no ? [[row.source_row_no, row.id] as [number, string]] : []));
        }

        if (cartId) {
          await supabase.from("cart_items").delete().eq("cart_id", cartId);
          const rows = snapshotCart.flatMap((item) => {
            const productId = productMap.get(Number(item.id));
            return productId ? [{ cart_id: cartId!, product_id: productId, variation_id: null, quantity: item.quantity }] : [];
          });
          if (rows.length) await supabase.from("cart_items").insert(rows);
          await supabase.from("carts").update({ updated_at: new Date().toISOString() }).eq("id", cartId);
        }

        await supabase.from("wishlists").delete().eq("user_id", currentUser);
        const wishRows = snapshotWishlist.flatMap((sourceId) => {
          const productId = productMap.get(Number(sourceId));
          return productId ? [{ user_id: currentUser, product_id: productId }] : [];
        });
        if (wishRows.length) await supabase.from("wishlists").insert(wishRows);
      }).catch(() => undefined);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [cart, wishlist, ready, userId, accountSyncing]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("dento-locale", locale);
  }, [locale]);

  function setLocale(value: Locale) { setLocaleState(value); }
  function setDeliveryLocation(id: string | null) {
    setDeliveryLocationState(id);
    if (id) localStorage.setItem("dento-delivery-location", id);
    else localStorage.removeItem("dento-delivery-location");
  }
  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }
  function addToCart(item: Omit<CartItem, "quantity">) {
    setCart((prev) => {
      const hit = prev.find((x) => x.id === item.id);
      if (hit) return prev.map((x) => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to your cart");
  }
  function updateQty(id: string, qty: number) {
    if (qty < 1) return removeFromCart(id);
    setCart((prev) => prev.map((x) => x.id === id ? { ...x, quantity: qty } : x));
  }
  function removeFromCart(id: string) { setCart((prev) => prev.filter((x) => x.id !== id)); }
  function toggleWishlist(id: string) {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  const value = useMemo(() => ({
    locale,
    setLocale,
    cart,
    cartCount: cart.reduce((n, x) => n + x.quantity, 0),
    addToCart,
    updateQty,
    removeFromCart,
    wishlist,
    toggleWishlist,
    toast,
    showToast,
    deliveryLocation,
    setDeliveryLocation,
    signedIn: Boolean(userId),
    accountSyncing,
  }), [locale, cart, wishlist, toast, deliveryLocation, userId, accountSyncing]);

  return <StoreContext.Provider value={value}>{children}{toast && <div className="toast">{toast}</div>}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
