import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to DENTO HUB to continue checkout, manage your orders and saved dental supplies.",
};

export default function Login() {
  return (
    <main className="auth-page-premium">
      <div className="shell">
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
