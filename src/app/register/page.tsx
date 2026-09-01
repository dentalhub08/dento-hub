import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Create account",
  description: "Create your DENTO HUB student account and personalize dental supplies by university and academic year.",
};

export default function Register() {
  return (
    <main className="auth-page-premium">
      <div className="shell">
        <AuthForm mode="register" />
      </div>
    </main>
  );
}
