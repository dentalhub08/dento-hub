"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    const supabase = createClient();
    if (!supabase) {
      setMessage("Connect Supabase in .env.local to enable password recovery.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      setSuccess(true);
      setMessage("Recovery link sent. Check your inbox and follow the secure reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-recovery-shell">
      <div className="auth-recovery-brand">
        <Link href="/" aria-label="DENTO HUB home"><img src="/dento-hub-logo.png" alt="DENTO HUB" /></Link>
        <div><ShieldCheck size={18} /><span>Secure account recovery</span></div>
      </div>
      <div className="auth-recovery-card">
        <Link href="/login" className="auth-back-link"><ArrowLeft size={14} /> Back to sign in</Link>
        <span className="section-kicker">ACCOUNT RECOVERY</span>
        <h1>Reset your password.</h1>
        <p>Enter the email linked to your DENTO HUB account. We’ll send you a secure recovery link.</p>
        <form onSubmit={submit}>
          <label className="auth-field">
            <span>Email address</span>
            <div className="auth-input"><Mail size={18} /><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com" autoComplete="email" /></div>
          </label>
          {message && <div className={`auth-message ${success ? "success" : "error"}`}>{success?<CheckCircle2 size={17}/>:<AlertCircle size={17}/>}<span>{message}</span></div>}
          <button className="auth-submit" disabled={loading}>{loading?<><Loader2 className="spin" size={18}/>Sending...</>:<>Send recovery link<ArrowRight size={18}/></>}</button>
        </form>
        <small className="auth-recovery-help">Need help? Contact dentalhub08@outlook.com</small>
      </div>
    </section>
  );
}
