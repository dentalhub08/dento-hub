"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SessionUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export function AuthAccountMenu({ arabic = false }: { arabic?: boolean }) {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profileName, setProfileName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    async function applyUser(nextUser: SessionUser | null) {
      if (!active) return;
      setUser(nextUser);
      setIsAdmin(false);
      setProfileName("");

      if (nextUser) {
        const [{ data: adminRow }, { data: profile }] = await Promise.all([
          supabase.from("admin_users").select("user_id").eq("user_id", nextUser.id).maybeSingle(),
          supabase.from("profiles").select("full_name").eq("id", nextUser.id).maybeSingle(),
        ]);
        if (active) {
          setIsAdmin(Boolean(adminRow));
          setProfileName(typeof profile?.full_name === "string" ? profile.full_name.trim() : "");
        }
      }
      if (active) setLoading(false);
    }

    supabase.auth.getUser().then(({ data }) => void applyUser(data.user as SessionUser | null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyUser((session?.user || null) as SessionUser | null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    function outside(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setOpen(false);
    window.location.replace("/");
  }

  if (loading) {
    return (
      <div className="account-session-loading" aria-label="Checking account">
        <UserRound size={20} />
      </div>
    );
  }

  if (!user) {
    return (
      <Link href="/login" className="account-link">
        <UserRound size={21} />
        <span>{arabic ? "تسجيل الدخول" : "Sign in"}</span>
      </Link>
    );
  }

  const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  const fullName = profileName || metadataName || user.email?.split("@")[0] || "Account";
  const firstName = fullName.split(/\s+/)[0] || fullName;

  return (
    <div className="account-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`account-session-btn ${isAdmin ? "admin-account" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="account-avatar"><UserRound size={17} /></span>
        <span className="account-session-copy">
          <small>{isAdmin ? (arabic ? "المشرف" : "Admin") : (arabic ? "حسابي" : "Signed in")}</small>
          <b>{arabic ? `مرحباً، ${firstName}` : `Hi, ${firstName}`}</b>
        </span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="account-dropdown">
          <div className="account-dropdown-head">
            <span className="account-avatar large"><UserRound size={19} /></span>
            <div>
              <b>{arabic ? `مرحباً، ${firstName}` : `Hi, ${firstName}`}</b>
              <small>{user.email || "Signed in"}</small>
            </div>
            {isAdmin && <span className="account-admin-badge"><ShieldCheck size={12} /> Admin</span>}
          </div>

          {isAdmin && (
            <Link href="/admin" className="account-admin-entry">
              <span><LayoutDashboard size={17} /></span>
              <div>
                <b>Admin Dashboard</b>
                <small>Insights, products, ads, orders & settings</small>
              </div>
            </Link>
          )}

          <div className="account-dropdown-links">
            <Link href="/account"><UserRound size={16} /> {arabic ? "حسابي" : "My account"}</Link>
            {isAdmin && <Link href="/admin/settings"><Settings size={16} /> Admin settings</Link>}
            <button type="button" onClick={signOut}><LogOut size={16} /> {arabic ? "تسجيل الخروج" : "Sign out"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
