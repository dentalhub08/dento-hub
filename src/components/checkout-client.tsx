// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  Check,
  ChevronRight,
  Home,
  Loader2,
  LockKeyhole,
  MapPin,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import { useStore } from "./store-provider";
import { createClient } from "@/lib/supabase/client";
import { egp } from "@/lib/format";
import { deliveryLocations } from "@/data/site";

const EGYPTIAN_GOVERNORATES = [
  "Alexandria",
  "Aswan",
  "Asyut",
  "Beheira",
  "Beni Suef",
  "Cairo",
  "Dakahlia",
  "Damietta",
  "Faiyum",
  "Gharbia",
  "Giza",
  "Ismailia",
  "Kafr El Sheikh",
  "Luxor",
  "Matrouh",
  "Minya",
  "Monufia",
  "New Valley",
  "North Sinai",
  "Port Said",
  "Qalyubia",
  "Qena",
  "Red Sea",
  "Sharqia",
  "Sohag",
  "South Sinai",
  "Suez",
];

type SavedAddress = {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  country: string;
  governorate: string;
  city: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  postal_code: string;
  landmark: string;
  notes: string;
  university_id: string | null;
  is_default: boolean;
};

type University = {
  id: string;
  name_en: string;
};

type DeliveryRule = {
  id: string;
  rule_type: "default" | "governorate" | "city" | "university";
  governorate: string | null;
  city: string | null;
  university_id: string | null;
  fee_egp: number | string;
  priority: number | null;
};

type AddressForm = {
  label: string;
  recipientName: string;
  phone: string;
  country: string;
  governorate: string;
  city: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  postalCode: string;
  landmark: string;
  notes: string;
  universityId: string;
  isDefault: boolean;
};

const EMPTY_FORM: AddressForm = {
  label: "Home",
  recipientName: "",
  phone: "",
  country: "Egypt",
  governorate: "",
  city: "",
  street: "",
  building: "",
  floor: "",
  apartment: "",
  postalCode: "",
  landmark: "",
  notes: "",
  universityId: "",
  isDefault: false,
};

function sameText(a?: string | null, b?: string | null) {
  return (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();
}

function normalizeAddress(row: any): SavedAddress {
  return {
    id: String(row.id),
    label: row.label || "Address",
    recipient_name: row.recipient_name || "",
    phone: row.phone || "",
    country: row.country || "Egypt",
    governorate: row.governorate || "",
    city: row.city || "",
    street: row.street || "",
    building: row.building || "",
    floor: row.floor || "",
    apartment: row.apartment || "",
    postal_code: row.postal_code || "",
    landmark: row.landmark || "",
    notes: row.notes || "",
    university_id: row.university_id || null,
    is_default: Boolean(row.is_default),
  };
}

function addressToForm(address: SavedAddress): AddressForm {
  return {
    label: address.label || "Home",
    recipientName: address.recipient_name,
    phone: address.phone,
    country: address.country || "Egypt",
    governorate: address.governorate,
    city: address.city,
    street: address.street,
    building: address.building,
    floor: address.floor,
    apartment: address.apartment,
    postalCode: address.postal_code,
    landmark: address.landmark,
    notes: address.notes,
    universityId: address.university_id || "",
    isDefault: address.is_default,
  };
}

function AddressIcon({ label }: { label: string }) {
  if (label.toLowerCase().includes("university")) return <Building2 size={18} />;
  return <Home size={18} />;
}

export function CheckoutClient() {
  const {
    cart,
    deliveryLocation,
    setDeliveryLocation,
    showToast,
    removeFromCart,
  } = useStore();

  const [auth, setAuth] = useState<"loading" | "yes" | "no">("loading");
  const [userId, setUserId] = useState("");
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [deliveryRules, setDeliveryRules] = useState<DeliveryRule[]>([]);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState<number | null>(null);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number | null>(null);

  const [addressOpen, setAddressOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>({ ...EMPTY_FORM });
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<{
    id: string;
    order_number: string;
    subtotal: number;
    delivery_fee: number;
    grand_total: number;
  } | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedLocation = deliveryLocations.find((item) => item.id === deliveryLocation);

  async function loadAddresses(supabase: any, uid: string) {
    setLoadingAddresses(true);

    let result = await supabase
      .from("addresses")
      .select(
        "id,label,recipient_name,phone,country,governorate,city,street,building,floor,apartment,postal_code,landmark,notes,university_id,is_default,created_at"
      )
      .eq("user_id", uid)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    // Compatible with the original address table before country/postal_code were added.
    if (result.error) {
      result = await supabase
        .from("addresses")
        .select(
          "id,label,recipient_name,phone,governorate,city,street,building,floor,apartment,landmark,notes,university_id,is_default,created_at"
        )
        .eq("user_id", uid)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
    }

    if (result.error) {
      setAddressError(result.error.message);
      setAddresses([]);
      setLoadingAddresses(false);
      return;
    }

    const rows = (result.data || []).map(normalizeAddress);
    setAddresses(rows);

    setSelectedAddress((current) => {
      if (current) {
        return rows.find((row: SavedAddress) => row.id === current.id) || current;
      }
      return rows.find((row: SavedAddress) => row.is_default) || rows[0] || null;
    });

    setLoadingAddresses(false);
  }

  useEffect(() => {
    const supabase = createClient();

    if (!supabase) {
      setAuth("no");
      return;
    }

    let active = true;

    void supabase.auth
      .getUser()
      .then(async ({ data }: any) => {
        if (!active) return;

        const user = data?.user;
        if (!user) {
          setAuth("no");
          return;
        }

        setAuth("yes");
        setUserId(user.id);

        const [
          profileResult,
          universityResult,
          deliveryResult,
          settingsResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name,phone")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("universities")
            .select("id,name_en")
            .eq("is_active", true)
            .order("name_en"),
          supabase
            .from("delivery_rules")
            .select("id,rule_type,governorate,city,university_id,fee_egp,priority")
            .eq("is_active", true)
            .order("priority", { ascending: false }),
          supabase
            .from("store_settings")
            .select("default_delivery_fee_egp,free_delivery_threshold_egp")
            .eq("id", 1)
            .maybeSingle(),
        ]);

        if (!active) return;

        if (!profileResult.error && profileResult.data) {
          setForm((current) => ({
            ...current,
            recipientName:
              current.recipientName || profileResult.data.full_name || "",
            phone: current.phone || profileResult.data.phone || "",
          }));
        }

        if (!universityResult.error) {
          setUniversities((universityResult.data || []) as University[]);
        }

        if (!deliveryResult.error) {
          setDeliveryRules((deliveryResult.data || []) as DeliveryRule[]);
        }

        if (!settingsResult.error && settingsResult.data) {
          const defaultFee = settingsResult.data.default_delivery_fee_egp;
          const threshold = settingsResult.data.free_delivery_threshold_egp;

          setDefaultDeliveryFee(
            defaultFee === null || defaultFee === undefined
              ? null
              : Number(defaultFee)
          );
          setFreeDeliveryThreshold(
            threshold === null || threshold === undefined
              ? null
              : Number(threshold)
          );
        }

        await loadAddresses(supabase, user.id);
      })
      .catch(() => {
        if (active) setAuth("no");
      });

    return () => {
      active = false;
    };
  }, []);

  const deliveryFee = useMemo(() => {
    if (freeDeliveryThreshold !== null && subtotal >= freeDeliveryThreshold) {
      return 0;
    }

    if (selectedAddress) {
      const universityRule = selectedAddress.university_id
        ? deliveryRules.find(
            (rule) =>
              rule.rule_type === "university" &&
              rule.university_id === selectedAddress.university_id
          )
        : undefined;

      if (universityRule) return Number(universityRule.fee_egp);

      const cityRule = deliveryRules.find(
        (rule) =>
          rule.rule_type === "city" &&
          sameText(rule.city, selectedAddress.city) &&
          (!rule.governorate ||
            sameText(rule.governorate, selectedAddress.governorate))
      );

      if (cityRule) return Number(cityRule.fee_egp);

      const governorateRule = deliveryRules.find(
        (rule) =>
          rule.rule_type === "governorate" &&
          sameText(rule.governorate, selectedAddress.governorate)
      );

      if (governorateRule) return Number(governorateRule.fee_egp);
    }

    const defaultRule = deliveryRules.find(
      (rule) => rule.rule_type === "default"
    );
    if (defaultRule) return Number(defaultRule.fee_egp);

    if (selectedLocation?.fee !== undefined) return selectedLocation.fee;

    return defaultDeliveryFee;
  }, [
    deliveryRules,
    selectedAddress,
    subtotal,
    freeDeliveryThreshold,
    selectedLocation,
    defaultDeliveryFee,
  ]);

  function syncHeaderLocation(address: SavedAddress) {
    if (address.university_id) {
      const university = universities.find(
        (item) => item.id === address.university_id
      );

      if (
        university?.name_en
          ?.toLowerCase()
          .includes("alamein international university")
      ) {
        setDeliveryLocation?.("aiu");
        return;
      }
    }

    const match = deliveryLocations.find(
      (item) =>
        item.kind === "governorate" &&
        sameText(item.name, address.governorate)
    );

    if (match) setDeliveryLocation?.(match.id);
  }

  function chooseAddress(address: SavedAddress) {
    setSelectedAddress(address);
    syncHeaderLocation(address);
    setAddressOpen(false);
    setFormOpen(false);
    setEditingId(null);
    setAddressError("");
    showToast?.("Delivery address selected");
  }

  function openNewAddress() {
    setEditingId(null);
    setAddressError("");
    setForm((current) => ({
      ...EMPTY_FORM,
      recipientName: current.recipientName,
      phone: current.phone,
    }));
    setFormOpen(true);
  }

  function openEditAddress(address: SavedAddress) {
    setEditingId(address.id);
    setAddressError("");
    setForm(addressToForm(address));
    setFormOpen(true);
  }

  function validateAddress() {
    if (!form.recipientName.trim()) return "Enter the recipient's full name.";
    if (!form.phone.trim()) return "Enter a phone number.";
    if (!form.governorate) return "Choose a governorate.";
    if (!form.city.trim()) return "Enter the city or area.";
    if (!form.street.trim()) return "Enter the street address.";
    return "";
  }

  async function saveAddress() {
    const validation = validateAddress();

    if (validation) {
      setAddressError(validation);
      return;
    }

    const supabase = createClient();
    if (!supabase || !userId) {
      setAddressError("Please sign in again before saving the address.");
      return;
    }

    setSavingAddress(true);
    setAddressError("");

    if (form.isDefault) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const fullPayload = {
      user_id: userId,
      label: form.label.trim() || "Address",
      recipient_name: form.recipientName.trim(),
      phone: form.phone.trim(),
      country: form.country || "Egypt",
      governorate: form.governorate,
      city: form.city.trim(),
      street: form.street.trim(),
      building: form.building.trim() || null,
      floor: form.floor.trim() || null,
      apartment: form.apartment.trim() || null,
      postal_code: form.postalCode.trim() || null,
      landmark: form.landmark.trim() || null,
      notes: form.notes.trim() || null,
      university_id: form.universityId || null,
      is_default: form.isDefault,
      updated_at: new Date().toISOString(),
    };

    const legacyPayload = {
      user_id: fullPayload.user_id,
      label: fullPayload.label,
      recipient_name: fullPayload.recipient_name,
      phone: fullPayload.phone,
      governorate: fullPayload.governorate,
      city: fullPayload.city,
      street: fullPayload.street,
      building: fullPayload.building,
      floor: fullPayload.floor,
      apartment: fullPayload.apartment,
      landmark: fullPayload.landmark,
      notes: fullPayload.notes,
      university_id: fullPayload.university_id,
      is_default: fullPayload.is_default,
    };

    let result: any;

    if (editingId) {
      result = await supabase
        .from("addresses")
        .update(fullPayload)
        .eq("id", editingId)
        .eq("user_id", userId);

      if (result.error) {
        result = await supabase
          .from("addresses")
          .update(legacyPayload)
          .eq("id", editingId)
          .eq("user_id", userId);
      }
    } else {
      result = await supabase.from("addresses").insert(fullPayload);

      if (result.error) {
        result = await supabase.from("addresses").insert(legacyPayload);
      }
    }

    if (result.error) {
      setAddressError(result.error.message);
      setSavingAddress(false);
      return;
    }

    await loadAddresses(supabase, userId);

    setFormOpen(false);
    setEditingId(null);
    setSavingAddress(false);
    showToast?.(editingId ? "Address updated" : "Address saved");
  }

  function selectedAddressLine(address: SavedAddress) {
    return [
      address.street,
      address.building ? `Building ${address.building}` : "",
      address.floor ? `Floor ${address.floor}` : "",
      address.apartment ? `Apt ${address.apartment}` : "",
    ]
      .filter(Boolean)
      .join(", ");
  }

  async function placeOrder() {
    if (!selectedAddress || placingOrder) return;

    const supabase = createClient();
    if (!supabase) {
      setOrderError("Checkout is temporarily unavailable. Please refresh and try again.");
      return;
    }

    const items = cart
      .map((item) => ({
        source_row_no: Number(item.id),
        quantity: Number(item.quantity),
      }))
      .filter(
        (item) =>
          Number.isFinite(item.source_row_no) &&
          Number.isInteger(item.source_row_no) &&
          item.source_row_no > 0 &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0
      );

    if (!items.length || items.length !== cart.length) {
      setOrderError("One or more cart items could not be verified. Remove them and add them again.");
      return;
    }

    setPlacingOrder(true);
    setOrderError("");

    const { data, error } = await supabase.rpc("place_order_v1", {
      p_address_id: selectedAddress.id,
      p_items: items,
    });

    if (error) {
      setOrderError(
        error.message ||
          "We could not place the order. Please review your cart and try again."
      );
      setPlacingOrder(false);
      return;
    }

    const order = data as {
      id: string;
      order_number: string;
      subtotal: number | string;
      delivery_fee: number | string;
      grand_total: number | string;
    };

    setPlacedOrder({
      id: String(order.id),
      order_number: String(order.order_number),
      subtotal: Number(order.subtotal),
      delivery_fee: Number(order.delivery_fee),
      grand_total: Number(order.grand_total),
    });

    // The RPC clears the database cart transactionally.
    // Clear the browser/store copy after the order exists.
    for (const item of cart) {
      removeFromCart(item.id);
    }

    showToast?.(`Order ${order.order_number} placed successfully`);
    setPlacingOrder(false);
  }

  if (placedOrder) {
    return (
      <main className="shell checkout-gate">
        <div className="gate-card checkout-success-card">
          <div className="gate-icon">
            <ShieldCheck />
          </div>
          <span className="section-kicker">ORDER CONFIRMED</span>
          <h1>Thank you. Your order is in.</h1>
          <p>
            Order <b>{placedOrder.order_number}</b> was created successfully and
            is now pending confirmation.
          </p>

          <div className="checkout-success-totals">
            <div>
              <span>Subtotal</span>
              <b>{egp(placedOrder.subtotal)}</b>
            </div>
            <div>
              <span>Delivery</span>
              <b>{egp(placedOrder.delivery_fee)}</b>
            </div>
            <div>
              <span>Total</span>
              <b>{egp(placedOrder.grand_total)}</b>
            </div>
          </div>

          <div className="gate-actions">
            <Link className="btn-primary" href="/account/orders">
              View my orders <ArrowRight size={18} />
            </Link>
            <Link className="btn-secondary" href="/shop">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!cart.length) {
    return (
      <main className="shell empty-state">
        <h1>Your cart is empty.</h1>
        <Link href="/shop" className="btn-primary">
          Go shopping
        </Link>
      </main>
    );
  }

  if (auth !== "yes") {
    return (
      <main className="shell checkout-gate">
        <div className="gate-card">
          <div className="gate-icon">
            <LockKeyhole />
          </div>
          <span className="section-kicker">ONE QUICK STEP</span>
          <h1>Sign in to place your order.</h1>
          <p>
            Your cart is already saved. Sign in or register and we will bring
            you straight back here without losing anything.
          </p>
          <div className="gate-actions">
            <Link className="btn-primary" href="/login?next=/checkout">
              Sign in <ArrowRight size={18} />
            </Link>
            <Link className="btn-secondary" href="/register?next=/checkout">
              Create account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="shell checkout-page">
        <section>
          <span className="section-kicker">CHECKOUT</span>
          <h1>Almost there.</h1>

          <div className={`checkout-block ${selectedAddress ? "has-address" : ""}`}>
            <div className="block-icon">
              <MapPin />
            </div>

            <div className="checkout-address-copy">
              <h3>Delivery address</h3>

              {selectedAddress ? (
                <div className="checkout-selected-address">
                  <div className="checkout-selected-head">
                    <b>{selectedAddress.label}</b>
                    {selectedAddress.is_default && (
                      <span className="selected-pill">Default</span>
                    )}
                  </div>

                  <strong>{selectedAddress.recipient_name}</strong>
                  <span>{selectedAddressLine(selectedAddress)}</span>
                  <span>
                    {selectedAddress.city}, {selectedAddress.governorate},{" "}
                    {selectedAddress.country}
                  </span>
                  <span>{selectedAddress.phone}</span>
                </div>
              ) : (
                <p>
                  Add your complete delivery address. You can save multiple
                  addresses and choose the one you want for each order.
                </p>
              )}

              <button
                type="button"
                className="ghost-small checkout-address-button"
                onClick={() => {
                  setAddressOpen(true);
                  setFormOpen(false);
                  setAddressError("");
                }}
              >
                {selectedAddress ? "Change address" : "Add / choose address"}
              </button>
            </div>
          </div>

          <div className="checkout-block">
            <div className="block-icon">
              <Banknote />
            </div>
            <div>
              <h3>Cash on delivery</h3>
              <p>Pay when your DENTO HUB order arrives.</p>
              <span className="selected-pill">Selected</span>
            </div>
          </div>

          <div className="checkout-block">
            <div className="block-icon">
              <ShieldCheck />
            </div>
            <div>
              <h3>Server-verified total</h3>
              <p>
                Product prices and delivery are recalculated securely before
                the order is created.
              </p>
            </div>
          </div>
        </section>

        <aside className="summary-card">
          <h3>Order summary</h3>

          <div>
            <span>Items</span>
            <b>{cart.length}</b>
          </div>

          <div>
            <span>Subtotal</span>
            <b>{egp(subtotal)}</b>
          </div>

          <div>
            <span>Delivery</span>
            <span>
              {!selectedAddress
                ? "Choose address"
                : deliveryFee !== null
                ? egp(deliveryFee)
                : "Calculated at review"}
            </span>
          </div>

          <hr />

          <div className="summary-total">
            <span>Total</span>
            <b>{egp(subtotal + (deliveryFee ?? 0))}</b>
          </div>

          {orderError && (
            <div className="checkout-order-error">{orderError}</div>
          )}

          <button
            type="button"
            className="btn-primary wide"
            disabled={!selectedAddress || placingOrder}
            onClick={() => void placeOrder()}
          >
            {placingOrder ? (
              <>
                <Loader2 className="spin" size={17} />
                Placing order…
              </>
            ) : selectedAddress ? (
              "Place order — Cash on delivery"
            ) : (
              "Choose address to place order"
            )}
          </button>
        </aside>
      </main>

      {addressOpen && (
        <div
          className="checkout-address-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Delivery address"
        >
          <div className="checkout-address-panel">
            <div className="checkout-address-panel-head">
              <div>
                <span className="section-kicker">DELIVERY</span>
                <h2>{formOpen ? (editingId ? "Edit address" : "Add address") : "Choose an address"}</h2>
              </div>

              <button
                className="checkout-address-close"
                type="button"
                aria-label="Close"
                onClick={() => {
                  setAddressOpen(false);
                  setFormOpen(false);
                  setAddressError("");
                }}
              >
                <X size={19} />
              </button>
            </div>

            {!formOpen ? (
              <div className="checkout-address-book">
                <div className="checkout-address-book-top">
                  <div>
                    <b>Saved addresses</b>
                    <span>
                      {addresses.length
                        ? `${addresses.length} saved`
                        : "Add your first delivery address"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="checkout-new-address"
                    onClick={openNewAddress}
                  >
                    <Plus size={16} /> Add new address
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="checkout-address-empty">
                    <Loader2 className="spin" size={22} />
                    <span>Loading your addresses…</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="checkout-address-empty">
                    <MapPin size={25} />
                    <b>No saved addresses yet</b>
                    <span>
                      Add your address once and reuse it on future orders.
                    </span>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={openNewAddress}
                    >
                      Add delivery address
                    </button>
                  </div>
                ) : (
                  <div className="checkout-address-cards">
                    {addresses.map((address) => {
                      const selected = selectedAddress?.id === address.id;

                      return (
                        <article
                          className={`checkout-address-card ${
                            selected ? "selected" : ""
                          }`}
                          key={address.id}
                        >
                          <div className="checkout-address-card-icon">
                            <AddressIcon label={address.label} />
                          </div>

                          <div className="checkout-address-card-copy">
                            <div>
                              <b>{address.label}</b>
                              {address.is_default && (
                                <span className="selected-pill">Default</span>
                              )}
                              {selected && (
                                <span className="selected-pill">
                                  <Check size={10} /> Selected
                                </span>
                              )}
                            </div>

                            <strong>{address.recipient_name}</strong>
                            <span>{selectedAddressLine(address)}</span>
                            <span>
                              {address.city}, {address.governorate},{" "}
                              {address.country}
                            </span>
                            <small>{address.phone}</small>
                          </div>

                          <div className="checkout-address-card-actions">
                            <button
                              type="button"
                              className="checkout-edit-address"
                              onClick={() => openEditAddress(address)}
                            >
                              <Pencil size={14} /> Edit
                            </button>

                            <button
                              type="button"
                              className="checkout-use-address"
                              onClick={() => chooseAddress(address)}
                            >
                              Use this address <ChevronRight size={15} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="checkout-address-form-wrap">
                <button
                  type="button"
                  className="checkout-address-back"
                  onClick={() => {
                    setFormOpen(false);
                    setAddressError("");
                  }}
                >
                  <ArrowLeft size={15} /> Back to saved addresses
                </button>

                <div className="checkout-address-form">
                  <label className="checkout-field">
                    <span>Address label</span>
                    <select
                      value={form.label}
                      onChange={(event) =>
                        setForm({ ...form, label: event.target.value })
                      }
                    >
                      <option value="Home">Home</option>
                      <option value="University">University</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label className="checkout-field">
                    <span>Country / region</span>
                    <select
                      value={form.country}
                      onChange={(event) =>
                        setForm({ ...form, country: event.target.value })
                      }
                    >
                      <option value="Egypt">Egypt</option>
                    </select>
                  </label>

                  <label className="checkout-field checkout-span-2">
                    <span>Recipient full name</span>
                    <input
                      autoComplete="name"
                      value={form.recipientName}
                      onChange={(event) =>
                        setForm({ ...form, recipientName: event.target.value })
                      }
                      placeholder="Full name"
                    />
                  </label>

                  <label className="checkout-field checkout-span-2">
                    <span>Phone number</span>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                      placeholder="+20 1XX XXX XXXX"
                    />
                  </label>

                  <label className="checkout-field">
                    <span>Governorate</span>
                    <select
                      value={form.governorate}
                      onChange={(event) =>
                        setForm({ ...form, governorate: event.target.value })
                      }
                    >
                      <option value="">Choose governorate</option>
                      {EGYPTIAN_GOVERNORATES.map((governorate) => (
                        <option key={governorate} value={governorate}>
                          {governorate}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="checkout-field">
                    <span>City / area</span>
                    <input
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(event) =>
                        setForm({ ...form, city: event.target.value })
                      }
                      placeholder="e.g. New Cairo"
                    />
                  </label>

                  <label className="checkout-field checkout-span-2">
                    <span>Street address</span>
                    <input
                      autoComplete="street-address"
                      value={form.street}
                      onChange={(event) =>
                        setForm({ ...form, street: event.target.value })
                      }
                      placeholder="Street name and number"
                    />
                  </label>

                  <label className="checkout-field">
                    <span>Building / villa</span>
                    <input
                      value={form.building}
                      onChange={(event) =>
                        setForm({ ...form, building: event.target.value })
                      }
                      placeholder="Building 12"
                    />
                  </label>

                  <label className="checkout-field">
                    <span>Floor</span>
                    <input
                      value={form.floor}
                      onChange={(event) =>
                        setForm({ ...form, floor: event.target.value })
                      }
                      placeholder="3"
                    />
                  </label>

                  <label className="checkout-field">
                    <span>Apartment / unit</span>
                    <input
                      value={form.apartment}
                      onChange={(event) =>
                        setForm({ ...form, apartment: event.target.value })
                      }
                      placeholder="Apartment 8"
                    />
                  </label>

                  <label className="checkout-field">
                    <span>Postal code <em>optional</em></span>
                    <input
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={form.postalCode}
                      onChange={(event) =>
                        setForm({ ...form, postalCode: event.target.value })
                      }
                      placeholder="Postal code"
                    />
                  </label>

                  <label className="checkout-field checkout-span-2">
                    <span>Landmark <em>optional</em></span>
                    <input
                      value={form.landmark}
                      onChange={(event) =>
                        setForm({ ...form, landmark: event.target.value })
                      }
                      placeholder="Near a known place, gate or landmark"
                    />
                  </label>

                  <label className="checkout-field checkout-span-2">
                    <span>University / campus delivery <em>optional</em></span>
                    <select
                      value={form.universityId}
                      onChange={(event) =>
                        setForm({ ...form, universityId: event.target.value })
                      }
                    >
                      <option value="">Not a university delivery</option>
                      {universities.map((university) => (
                        <option key={university.id} value={university.id}>
                          {university.name_en}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="checkout-field checkout-span-2">
                    <span>Delivery notes <em>optional</em></span>
                    <textarea
                      value={form.notes}
                      onChange={(event) =>
                        setForm({ ...form, notes: event.target.value })
                      }
                      placeholder="Anything the courier should know?"
                    />
                  </label>

                  <label className="checkout-default-checkbox checkout-span-2">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(event) =>
                        setForm({ ...form, isDefault: event.target.checked })
                      }
                    />
                    <span>
                      <b>Save as my default address</b>
                      <small>Use this address first on future checkouts.</small>
                    </span>
                  </label>
                </div>

                {addressError && (
                  <div className="checkout-address-error">{addressError}</div>
                )}

                <div className="checkout-address-form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setFormOpen(false);
                      setAddressError("");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    disabled={savingAddress}
                    onClick={() => void saveAddress()}
                  >
                    {savingAddress ? (
                      <Loader2 className="spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    {editingId ? "Save changes" : "Save address"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
