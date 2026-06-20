import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="size-6 animate-spin rounded-full border-2 border-border border-t-accent" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
