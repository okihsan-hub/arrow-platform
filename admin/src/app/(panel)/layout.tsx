import { AuthGuard } from "@/components/AuthGuard";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
