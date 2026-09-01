import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata = { title: "Reset password" };

export default function ForgotPassword() {
  return <main className="auth-page-premium"><div className="shell"><ForgotPasswordForm /></div></main>;
}
