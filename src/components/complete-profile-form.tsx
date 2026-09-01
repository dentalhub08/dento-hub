"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CalendarDays, CheckCircle2, ChevronDown, GraduationCap, Loader2, Phone, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { UniversityPicker } from "@/components/auth-form";

type University = { id: string; name_en: string };

function getSafeNext() {
  if (typeof window === "undefined") return "/";
  const value = new URLSearchParams(window.location.search).get("next");
  if (!value?.startsWith("/") || value.startsWith("//") || value.startsWith("/admin")) return "/";
  return value;
}

export function CompleteProfileForm() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [year, setYear] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [nextPath, setNextPath] = useState("/");

  useEffect(() => {
    const supabase = createClient();
    setNextPath(getSafeNext());
    if (!supabase) {
      setMessage("Connect Supabase in .env.local to complete your profile.");
      setLoading(false);
      return;
    }

    Promise.all([
      supabase.auth.getUser(),
      supabase.from("universities").select("id,name_en").eq("is_active", true).order("name_en"),
    ]).then(async ([userResult, uniResult]) => {
      const user = userResult.data.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);
      setUniversities((uniResult.data || []) as University[]);

      const { data: profile } = await supabase
        .from("profiles")
        .select("phone,university_id,academic_year")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.phone) setPhone(profile.phone);
      if (profile?.university_id) setUniversityId(profile.university_id);
      if (profile?.academic_year) setYear(String(profile.academic_year));
      setLoading(false);
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSuccess(false);
    if (!phone.trim() || !universityId || !year) {
      setMessage("Complete all three student details to continue.");
      return;
    }

    const supabase = createClient();
    if (!supabase || !userId) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        phone: phone.trim(),
        university_id: universityId,
        academic_year: Number(year),
        updated_at: new Date().toISOString(),
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      setSuccess(true);
      setMessage("Your student profile is ready.");
      setTimeout(() => router.replace(nextPath), 650);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="auth-recovery-shell profile-completion-shell">
      <div className="auth-recovery-brand">
        <img src="/dento-hub-logo.png" alt="DENTO HUB" />
        <div><ShieldCheck size={18} /><span>One-time profile setup</span></div>
      </div>
      <div className="auth-recovery-card profile-completion-card">
        <div className="auth-profile-icon"><GraduationCap size={23} /></div>
        <span className="section-kicker">ALMOST THERE</span>
        <h1>Complete your student profile.</h1>
        <p>Add these student details so DENTO HUB can personalize supplies and calculate delivery correctly.</p>
        {loading ? (
          <div className="auth-loading-state"><Loader2 className="spin" size={20} />Loading your account...</div>
        ) : (
          <form onSubmit={submit}>
            <label className="auth-field">
              <span>Phone number</span>
              <div className="auth-input"><Phone size={18} /><input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" /></div>
            </label>
            <label className="auth-field">
              <span>University</span>
              <UniversityPicker universities={universities} value={universityId} onChange={setUniversityId} loading={false} />
            </label>
            <label className="auth-field">
              <span>Academic year</span>
              <div className="auth-input auth-native-select">
                <CalendarDays size={18} />
                <select value={year} onChange={(e) => setYear(e.target.value)} required>
                  <option value="">Choose year</option>
                  <option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option><option value="5">Year 5</option>
                </select>
                <ChevronDown size={16} />
              </div>
            </label>
            {message && <div className={`auth-message ${success ? "success" : "error"}`}>{success ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}<span>{message}</span></div>}
            <button className="auth-submit" disabled={saving}>{saving ? <><Loader2 className="spin" size={18} />Saving...</> : <>Save and continue<ArrowRight size={18} /></>}</button>
          </form>
        )}
      </div>
    </section>
  );
}
