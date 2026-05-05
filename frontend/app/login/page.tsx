import { Suspense } from "react";

import { LoginForm } from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm text-slate-500">Yükleniyor…</div>}>
      <LoginForm />
    </Suspense>
  );
}
