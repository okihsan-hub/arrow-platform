import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Arrow Platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <div className="nav">
            <div className="row" style={{ gap: 10 }}>
              <strong>Arrow Platform</strong>
              <span className="muted">•</span>
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/admin">Admin</Link>
            </div>
            <div className="row">
              <Link href="/login">Login</Link>
              <form action="/api/auth/logout" method="post">
                <button className="button" type="submit">
                  Logout
                </button>
              </form>
            </div>
          </div>
          <div style={{ paddingTop: 18 }}>{children}</div>
        </div>
      </body>
    </html>
  );
}

