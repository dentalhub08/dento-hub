"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type University = { id: string; name_en: string };

type FormState = {
  fullName: string;
  phone: string;
  universityId: string;
  academicYear: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialForm: FormState = {
  fullName: "",
  phone: "",
  universityId: "",
  academicYear: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function normalizeEgyptPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (/^00201[0125]\d{8}$/.test(digits)) return `0${digits.slice(4)}`;
  if (/^201[0125]\d{8}$/.test(digits)) return `0${digits.slice(2)}`;
  return digits;
}

export function UniversityPicker({
  universities,
  value,
  onChange,
  loading,
}: {
  universities: University[];
  value: string;
  onChange: (id: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = universities.find((university) => university.id === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter((university) => university.name_en.toLowerCase().includes(q));
  }, [query, universities]);

  return (
    <div className="auth-university-picker">
      <button
        type="button"
        className={`auth-select-trigger ${open ? "open" : ""} ${selected ? "has-value" : ""}`}
        onClick={() => setOpen((current) => !current)}
        disabled={loading}
        aria-expanded={open}
      >
        <GraduationCap size={18} />
        <span>{loading ? "Loading universities..." : selected?.name_en || "Choose your university"}</span>
        {loading ? <Loader2 className="spin" size={17} /> : <ChevronDown size={17} />}
      </button>

      {open && !loading && (
        <div className="auth-select-popover">
          <div className="auth-select-search">
            <Search size={16} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Egyptian universities..."
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear university search">
                <X size={15} />
              </button>
            )}
          </div>
          <div className="auth-select-list">
            {filtered.length ? (
              filtered.map((university) => (
                <button
                  type="button"
                  key={university.id}
                  className={university.id === value ? "selected" : ""}
                  onClick={() => {
                    onChange(university.id);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <span>{university.name_en}</span>
                  {university.id === value && <Check size={16} />}
                </button>
              ))
            ) : (
              <div className="auth-select-empty">No university matches “{query}”.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState<FormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(isRegister);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const strength = passwordScore(form.password);

  useEffect(() => {
    if (!isRegister) return;
    const supabase = createClient();
    if (!supabase) {
      setUniversitiesLoading(false);
      return;
    }
    let active = true;
    supabase
      .from("universities")
      .select("id,name_en")
      .eq("is_active", true)
      .order("name_en", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setUniversities((data || []) as University[]);
        setUniversitiesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isRegister]);



  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const supabase = createClient();
    if (!supabase) {
      setMessage("Connect Supabase in .env.local to enable authentication.");
      return;
    }

    if (isRegister) {
      if (!form.fullName.trim() || !form.phone.trim() || !form.universityId || !form.academicYear) {
        setMessage("Complete your student details before creating your account.");
        return;
      }
      const normalizedPhone = normalizeEgyptPhone(form.phone);
      if (!/^01[0125]\d{8}$/.test(normalizedPhone)) {
        setMessage("Enter a valid Egyptian mobile number, for example 01012345678.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setMessage("Your passwords do not match.");
        return;
      }
      if (form.password.length < 8) {
        setMessage("Use at least 8 characters for your password.");
        return;
      }
      if (!termsAccepted) {
        setMessage("Please accept the Terms and Privacy Policy to continue.");
        return;
      }

      const email = form.email.trim().toLowerCase();
      setSubmitting(true);
      try {
        const { data: uniquenessData, error: uniquenessError } = await supabase.rpc("check_registration_uniqueness", {
          p_email: email,
          p_phone: normalizedPhone,
        });
        if (uniquenessError) {
          setMessage(uniquenessError.message.includes("check_registration_uniqueness")
            ? "Registration checks are not ready yet. Run migration 004 in Supabase, then try again."
            : uniquenessError.message);
          return;
        }
        const uniqueness = Array.isArray(uniquenessData) ? uniquenessData[0] : uniquenessData;
        const emailExists = Boolean(uniqueness?.email_exists);
        const phoneExists = Boolean(uniqueness?.phone_exists);
        if (emailExists && phoneExists) {
          setMessage("This email and phone number are already registered. Sign in instead.");
          return;
        }
        if (emailExists) {
          setMessage("This email is already registered. Sign in or use a different email.");
          return;
        }
        if (phoneExists) {
          setMessage("This phone number is already registered. Use a different phone number.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password: form.password,
          options: {
            data: {
              full_name: form.fullName.trim(),
              phone: normalizedPhone,
              university_id: form.universityId,
              academic_year: Number(form.academicYear),
            },
          },
        });
        if (error) {
          const lower = error.message.toLowerCase();
          if (lower.includes("already") || lower.includes("registered")) {
            setMessage("This email is already registered. Sign in instead.");
          } else if (lower.includes("duplicate") && lower.includes("phone")) {
            setMessage("This phone number is already registered.");
          } else {
            setMessage(error.message);
          }
          return;
        }

        if (!data.session || !data.user) {
          setMessage("Account created, but Supabase did not start a session. In Supabase, disable Confirm email under Authentication → Sign In / Providers → Email, then try again.");
          return;
        }

        const requested = new URLSearchParams(window.location.search).get("next");
        const safeRequested = requested?.startsWith("/") && !requested.startsWith("//") && !requested.startsWith("/admin") ? requested : "/";
        window.location.replace(safeRequested);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (error) {
        setMessage(error.message);
        return;
      }

      const signedInUser = data.user;
      if (!signedInUser) {
        setMessage("Sign-in succeeded but no user session was returned. Please try again.");
        return;
      }

      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", signedInUser.id)
        .maybeSingle();

      const requested = new URLSearchParams(window.location.search).get("next");
      const safeRequested = requested?.startsWith("/") && !requested.startsWith("//") ? requested : null;
      const destination = adminRow
        ? (safeRequested?.startsWith("/admin") ? safeRequested : "/admin")
        : (safeRequested && !safeRequested.startsWith("/admin") ? safeRequested : "/");

      window.location.replace(destination);
    } finally {
      setSubmitting(false);
    }
  }


  const panelTitle = isRegister ? "Start with the supplies that fit your year." : "Your dental cart is waiting.";
  const panelCopy = isRegister
    ? "Create one student profile and DENTO HUB can organize products around your university, academic year and course needs."
    : "Sign in without losing your guest cart, then continue checkout, save your addresses and follow every order.";

  return (
    <section className={`premium-auth ${isRegister ? "premium-auth-register" : "premium-auth-login"}`}>
      <div className="auth-experience-panel">
        <Link href="/" className="auth-brand-card" aria-label="Back to DENTO HUB home">
          <img src="/dento-hub-logo.png" alt="DENTO HUB — Your Dental Supply Hub" />
        </Link>

        <div className="auth-experience-copy">
          <div className="auth-eyebrow"><Sparkles size={14} /> Built for dental students</div>
          <h1>{panelTitle}</h1>
          <p>{panelCopy}</p>

          <div className="auth-benefits-grid">
            <div>
              <span><ShoppingBag size={18} /></span>
              <strong>Keep your cart</strong>
              <small>Your guest cart follows you after sign-in.</small>
            </div>
            <div>
              <span><GraduationCap size={18} /></span>
              <strong>Student-first</strong>
              <small>Shop by university, year and dental course.</small>
            </div>
            <div>
              <span><PackageCheck size={18} /></span>
              <strong>Track orders</strong>
              <small>Follow every order from pending to delivered.</small>
            </div>
            <div>
              <span><ShieldCheck size={18} /></span>
              <strong>Secure checkout</strong>
              <small>Your account is protected through Supabase Auth.</small>
            </div>
          </div>
        </div>

        <div className="auth-aiu-note">
          <div className="auth-aiu-icon"><GraduationCap size={19} /></div>
          <div>
            <small>AIU STUDENT?</small>
            <strong>University delivery rates</strong>
          </div>
          <CheckCircle2 size={19} />
        </div>

        <div className="auth-panel-orb auth-panel-orb-one" />
        <div className="auth-panel-orb auth-panel-orb-two" />
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-topline">
          <Link href="/" className="auth-back-link">← Back to store</Link>
          <span className="auth-secure"><ShieldCheck size={14} /> Secure account</span>
        </div>

        <div className="auth-form-heading">
          <span>{isRegister ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</span>
          <h2>{isRegister ? "Join DENTO HUB" : "Sign in to DENTO HUB"}</h2>
          <p>
            {isRegister
              ? "Set up your student profile once. We check that your email and phone are not already registered, then sign you in immediately."
              : "Continue shopping, checkout faster and manage your dental supply orders."}
          </p>
        </div>

        <form className="premium-auth-form" onSubmit={submit}>
          <>
              {isRegister && (
                <div className="auth-field-grid two-col">
                  <label className="auth-field">
                    <span>Full name</span>
                    <div className="auth-input">
                      <UserRound size={18} />
                      <input
                        value={form.fullName}
                        onChange={(event) => update("fullName", event.target.value)}
                        placeholder="Your full name"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>Phone number</span>
                    <div className="auth-input">
                      <Phone size={18} />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(event) => update("phone", event.target.value)}
                        placeholder="01xxxxxxxxx"
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </label>
                </div>
              )}

              {isRegister && (
                <div className="auth-field-grid register-profile-row">
                  <label className="auth-field university-field">
                    <span>University</span>
                    <UniversityPicker
                      universities={universities}
                      value={form.universityId}
                      onChange={(id) => update("universityId", id)}
                      loading={universitiesLoading}
                    />
                  </label>

                  <label className="auth-field">
                    <span>Academic year</span>
                    <div className="auth-input auth-native-select">
                      <CalendarDays size={18} />
                      <select
                        value={form.academicYear}
                        onChange={(event) => update("academicYear", event.target.value)}
                        required
                      >
                        <option value="">Choose year</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                        <option value="5">Year 5</option>
                      </select>
                      <ChevronDown size={16} />
                    </div>
                  </label>
                </div>
              )}

              <label className="auth-field">
                <span>Email address</span>
                <div className="auth-input">
                  <Mail size={18} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    placeholder="student@example.com"
                    autoComplete="email"
                  />
                </div>
              </label>

              <div className={`auth-field-grid ${isRegister ? "two-col" : ""}`}>
                <label className="auth-field">
                  <span>Password</span>
                  <div className="auth-input">
                    <LockKeyhole size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      minLength={8}
                      required
                      value={form.password}
                      onChange={(event) => update("password", event.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete={isRegister ? "new-password" : "current-password"}
                    />
                    <button
                      type="button"
                      className="auth-eye-button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {isRegister && form.password && (
                    <div className="password-strength">
                      <div>{[1, 2, 3, 4].map((bar) => <span key={bar} className={strength >= bar ? "active" : ""} />)}</div>
                      <small>{strength <= 1 ? "Weak" : strength === 2 ? "Good" : strength === 3 ? "Strong" : "Excellent"}</small>
                    </div>
                  )}
                </label>

                {isRegister && (
                  <label className="auth-field">
                    <span>Confirm password</span>
                    <div className="auth-input">
                      <LockKeyhole size={18} />
                      <input
                        type={showConfirm ? "text" : "password"}
                        minLength={8}
                        required
                        value={form.confirmPassword}
                        onChange={(event) => update("confirmPassword", event.target.value)}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="auth-eye-button"
                        onClick={() => setShowConfirm((current) => !current)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </label>
                )}
              </div>

              {!isRegister && (
                <div className="auth-login-options">
                  <label className="auth-check-row">
                    <input type="checkbox" />
                    <span>Keep me signed in</span>
                  </label>
                  <Link href="/forgot-password">Forgot password?</Link>
                </div>
              )}

              {isRegister && (
                <label className="auth-check-row auth-terms">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                  />
                  <span>I agree to DENTO HUB&apos;s Terms of Service and Privacy Policy.</span>
                </label>
              )}

              {message && (
                <div className={"auth-message error"} role="alert">
                  <AlertCircle size={17} />
                  <span>{message}</span>
                </div>
              )}

              <button className="auth-submit" type="submit" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="spin" size={18} /> {isRegister ? "Checking details..." : "Signing in..."}</>
                ) : (
                  <>{isRegister ? "Create account" : "Sign in securely"}<ArrowRight size={18} /></>
                )}
              </button>

              <p className="auth-switch-premium">
                {isRegister ? (
                  <>Already have an account? <Link href="/login">Sign in</Link></>
                ) : (
                  <>New to DENTO HUB? <Link href="/register">Create an account</Link></>
                )}
              </p>
            
          </>
        </form>

        <div className="auth-trust-footer">
          <ShieldCheck size={14} />
          <span>Protected authentication · Your password is never visible to DENTO HUB staff</span>
        </div>
      </div>
    </section>
  );
}
