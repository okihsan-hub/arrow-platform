"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Customer, License } from "@/lib/types";
import { Badge, Card, CardBody, CardHeader, statusTone } from "@/components/ui";
import { MobileListCard, MobileListRow } from "@/components/MobileList";
import { fmtDate } from "@/lib/format";

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api<Customer[]>("/customers"), api<License[]>("/licenses")])
      .then(([c, l]) => {
        setCustomers(c);
        setLicenses(l);
      })
      .catch((e) => setError(e.message));
  }, []);

  const active = licenses.filter((l) => l.status === "active").length;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400">Lisans platformu özeti</p>
      </div>

      {error ? <p className="text-red-400">{error}</p> : null}

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">Müşteri</p>
            <p className="text-3xl font-bold">{customers.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">Lisans</p>
            <p className="text-3xl font-bold">{licenses.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-400">Aktif lisans</p>
            <p className="text-3xl font-bold text-emerald-400">{active}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Son lisanslar" action={<Link href="/licenses" className="text-sm text-emerald-400">Tümü</Link>} />

        <div className="admin-mobile-only block space-y-3 p-4 md:hidden">
          {licenses.slice(0, 8).map((l) => (
            <MobileListCard
              key={l.id}
              footer={
                <Link
                  href={`/licenses/${encodeURIComponent(l.license_key)}`}
                  className="flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-100"
                >
                  Detay
                </Link>
              }
            >
              <MobileListRow label="Anahtar">
                <span className="break-license-key font-mono text-xs text-emerald-400">{l.license_key}</span>
              </MobileListRow>
              <MobileListRow label="Müşteri">{l.customer_name}</MobileListRow>
              <MobileListRow label="Durum">
                <Badge tone={statusTone(l.status)}>{l.status}</Badge>
              </MobileListRow>
              <MobileListRow label="Bitiş">{fmtDate(l.expires_at)}</MobileListRow>
            </MobileListCard>
          ))}
        </div>

        <CardBody className="admin-table-desktop admin-desktop-only hidden overflow-x-hidden p-0 md:block">
          <table className="hidden w-full text-sm md:table">
            <thead className="border-b border-slate-800 text-left text-slate-400">
              <tr>
                <th className="px-5 py-3">Anahtar</th>
                <th className="px-5 py-3">Müşteri</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Bitiş</th>
              </tr>
            </thead>
            <tbody>
              {licenses.slice(0, 8).map((l) => (
                <tr key={l.id} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                  <td className="px-5 py-3 font-mono text-xs">
                    <Link href={`/licenses/${encodeURIComponent(l.license_key)}`} className="break-license-key text-emerald-400 hover:underline">
                      {l.license_key}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{l.customer_name}</td>
                  <td className="px-5 py-3 uppercase">{l.plan}</td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone(l.status)}>{l.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{fmtDate(l.expires_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
