import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safePath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = safePath(url.searchParams.get("next"));

  if (!code) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("oauth_error", "Google sign-in did not return an authorization code. Please try again.");
    return NextResponse.redirect(login);
  }

  const supabase = await createClient();
  if (!supabase) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("oauth_error", "Supabase is not configured for this environment.");
    return NextResponse.redirect(login);
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("oauth_error", exchangeError.message);
    return NextResponse.redirect(login);
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("oauth_error", "Google sign-in completed, but no DENTO HUB session was created.");
    return NextResponse.redirect(login);
  }

  const [{ data: adminRow }, { data: profile }] = await Promise.all([
    supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("phone,university_id,academic_year").eq("id", user.id).maybeSingle(),
  ]);

  if (adminRow) {
    const destination = requestedNext.startsWith("/admin") ? requestedNext : "/admin";
    return NextResponse.redirect(new URL(destination, url.origin));
  }

  const destination = requestedNext.startsWith("/admin") ? "/" : requestedNext;
  const profileComplete = Boolean(profile?.phone && profile?.university_id && profile?.academic_year);

  if (!profileComplete) {
    const completeProfile = new URL("/complete-profile", url.origin);
    completeProfile.searchParams.set("next", destination);
    return NextResponse.redirect(completeProfile);
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
