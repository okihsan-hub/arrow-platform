import { AdminNav } from "@/components/admin/AdminNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-corporate-950 md:flex-row">
      <AdminNav />
      <div className="min-h-[calc(100vh-1px)] flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
