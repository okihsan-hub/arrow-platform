"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { License } from "@/lib/types";
import { Badge, Button, Card, CardBody, CardHeader, statusTone } from "@/components/ui";
import { MobileListCard, MobileListRow } from "@/components/MobileList";
import { fmtDate } from "@/lib/format";

export default function LicensesPage() {
  const [rows, setRows] = useState<License[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<License[]>("/licenses")
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Lisanslar</h1>
          <p className="text-slate-400">{rows.length} kayıt</p>
        </div>
        <Link href="/licenses/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">Yeni lisans</Button>
        </Link>
      </div>

      {error ? <p className="text-red-400">{error}</p> : null}

      <div className="admin-mobile-only block space-y-3 md:hidden">
        {rows.map((l) => (
          <MobileListCard
            key={l.id}
            footer={
              <Link
                href={`/licenses/${encodeURIComponent(l.license_key)}`}
                className="flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-sm font-semibold"
              >
                Detay
              </Link>
            }
          >
            <MobileListRow label="Anahtar">
              <span className="break-license-key font-mono text-xs text-emerald-400">{l.license_key}</span>
            </MobileListRow>
            <MobileListRow label="Müşteri">{l.customer_name}</MobileListRow>
            <MobileListRow label="Plan">{l.plan}</MobileListRow>
            <MobileListRow label="Durum">
              <Badge tone={statusTone(l.status)}>{l.status}</Badge>
            </MobileListRow>
            <MobileListRow label="Cihaz">
              {l.active_devices ?? 0} / {l.max_devices}
            </MobileListRow>
            <MobileListRow label="Bitiş">{fmtDate(l.expires_at)}</MobileListRow>
          </MobileListCard>
        ))}
      </div>

      <Card className="admin-table-desktop admin-desktop-only hidden md:block">
        <CardHeader title="Liste" />
        <CardBody className="overflow-x-hidden p-0">
          <table className="hidden w-full text-sm md:table">
            <thead className="border-b border-slate-800 text-left text-slate-400">
              <tr>
                <th className="px-5 py-3">Anahtar</th>
                <th className="px-5 py-3">Müşteri</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3">Cihaz</th>
                <th className="px-5 py-3">Bitiş</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
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
                  <td className="px-5 py-3">
                    {l.active_devices ?? 0} / {l.max_devices}
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
