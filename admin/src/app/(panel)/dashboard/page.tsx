"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Customer, License } from "@/lib/types";
import { Badge, Card, CardBody, CardHeader, statusTone } from "@/components/ui";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400">Lisans platformu özeti</p>
      </div>

      {error ? <p className="text-red-400">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
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
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full text-sm">
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
                    <Link href={`/licenses/${encodeURIComponent(l.license_key)}`} className="text-emerald-400 hover:underline">
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
