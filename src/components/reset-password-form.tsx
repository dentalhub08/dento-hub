"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");
  const [success,setSuccess]=useState(false);
  async function submit(e:React.FormEvent){
    e.preventDefault(); setMessage(""); setSuccess(false);
    if(password.length<8){setMessage("Use at least 8 characters for your new password.");return;}
    if(password!==confirm){setMessage("Your passwords do not match.");return;}
    const supabase=createClient(); if(!supabase){setMessage("Connect Supabase in .env.local to reset your password.");return;}
    setLoading(true);
    try{const {error}=await supabase.auth.updateUser({password}); if(error){setMessage(error.message);return;} setSuccess(true); setMessage("Password updated successfully. You can now sign in with your new password.");}
    finally{setLoading(false);}
  }
  return <section className="auth-recovery-shell"><div className="auth-recovery-brand"><Link href="/"><img src="/dento-hub-logo.png" alt="DENTO HUB"/></Link><div><ShieldCheck size={18}/><span>Secure password update</span></div></div><div className="auth-recovery-card"><span className="section-kicker">NEW PASSWORD</span><h1>Choose a new password.</h1><p>Make it at least 8 characters and different from passwords you use elsewhere.</p><form onSubmit={submit}><label className="auth-field"><span>New password</span><div className="auth-input"><LockKeyhole size={18}/><input type={show?"text":"password"} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button type="button" className="auth-eye-button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label><label className="auth-field"><span>Confirm password</span><div className="auth-input"><LockKeyhole size={18}/><input type={show?"text":"password"} minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat your password"/></div></label>{message&&<div className={`auth-message ${success?"success":"error"}`}>{success?<CheckCircle2 size={17}/>:<AlertCircle size={17}/>}<span>{message}</span></div>} {!success&&<button className="auth-submit" disabled={loading}>{loading?<><Loader2 className="spin" size={18}/>Updating...</>:<>Update password<ArrowRight size={18}/></>}</button>} {success&&<Link className="auth-submit" href="/login">Continue to sign in<ArrowRight size={18}/></Link>}</form></div></section>
}
