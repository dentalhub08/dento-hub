"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session, UserResponse } from "@supabase/supabase-js";
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

const GUEST_CART_KEY = "dento-guest-cart";
const LEGACY_CART_KEY = "dento-cart";
const GUEST_WISHLIST_KEY = "dento-guest-wishlist";
const LEGACY_WISHLIST_KEY = "dento-wishlist";

function safeArray(key: string): unknown[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    try { window.localStorage.removeItem(key); } catch {}
    return [];
  }
}

function readCart(): CartItem[] {
  const rows = [...safeArray(GUEST_CART_KEY), ...safeArray(LEGACY_CART_KEY)];
  const map = new Map<string, CartItem>();
  for (const raw of rows) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Partial<CartItem>;
    const id = typeof item.id === "string" ? item.id : "";
    const name = typeof item.name === "string" ? item.name : "";
    const price = Number(item.price);
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    if (!id || !name || !Number.isFinite(price)) continue;
    map.set(id, { id, name, price, quantity });
  }
  return [...map.values()];
}

function readWishlist(): string[] {
  return [...new Set(
    [...safeArray(GUEST_WISHLIST_KEY), ...safeArray(LEGACY_WISHLIST_KEY)]
      .filter((x): x is string => typeof x === "string" && x.length > 0)
  )];
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [deliveryLocation, setDeliveryLocationState] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedLocale = window.localStorage.getItem("dento-locale");
      setLocaleState(savedLocale === "ar" ? "ar" : "en");
      setDeliveryLocationState(window.localStorage.getItem("dento-delivery-location"));
      setCart(readCart());
      setWishlist(readWishlist());
    } catch {
      setCart([]);
      setWishlist([]);
    } finally {
      setReady(true);
    }

    const supabase = createClient();
    if (!supabase) return;

    let active = true;

    void supabase.auth.getUser()
      .then(({ data }: UserResponse) => {
        if (active) setSignedIn(Boolean(data.user));
      })
      .catch((error: unknown) => {
        console.warn("DENTO HUB: auth session check skipped", error);
        if (active) setSignedIn(false);
      });

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const listener = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        if (active) setSignedIn(Boolean(session?.user));
      });
      subscription = listener.data.subscription;
    } catch (error) {
      console.warn("DENTO HUB: auth listener skipped", error);
    }

    return () => {
      active = false;
      try { subscription?.unsubscribe(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      window.localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {}
  }, [cart, wishlist, ready]);

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      window.localStorage.setItem("dento-locale", locale);
    } catch {}
  }, [locale]);

  function setLocale(value: Locale) {
    setLocaleState(value);
  }

  function setDeliveryLocation(id: string | null) {
    setDeliveryLocationState(id);
    try {
      if (id) window.localStorage.setItem("dento-delivery-location", id);
      else window.localStorage.removeItem("dento-delivery-location");
    } catch {}
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function addToCart(item: Omit<CartItem, "quantity">) {
    if (!item.id || !item.name || !Number.isFinite(item.price)) return;
    setCart((prev) => {
      const hit = prev.find((x) => x.id === item.id);
      if (hit) {
        return prev.map((x) =>
          x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to your cart");
  }

  function updateQty(id: string, qty: number) {
    if (!Number.isFinite(qty) || qty < 1) return removeFromCart(id);
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, quantity: Math.floor(qty) } : x))
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((x) => x.id !== id));
  }

  function toggleWishlist(id: string) {
    if (!id) return;
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
    [cart]
  );

  const value = useMemo<StoreContextType>(() => ({
    locale,
    setLocale,
    cart,
    cartCount,
    addToCart,
    updateQty,
    removeFromCart,
    wishlist,
    toggleWishlist,
    toast,
    showToast,
    deliveryLocation,
    setDeliveryLocation,
    signedIn,
    accountSyncing: false,
  }), [locale, cart, cartCount, wishlist, toast, deliveryLocation, signedIn]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
