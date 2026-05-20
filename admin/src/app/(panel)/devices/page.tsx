"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { LicenseDevice } from "@/lib/types";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { MobileListCard, MobileListRow } from "@/components/MobileList";
import { fmtDate } from "@/lib/format";

export default function DevicesPage() {
  const [rows, setRows] = useState<LicenseDevice[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<LicenseDevice[]>("/devices")
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cihazlar</h1>
        <p className="text-slate-400">{rows.length} kayıt</p>
      </div>

      {error ? <p className="text-red-400">{error}</p> : null}

      <div className="admin-mobile-only block space-y-3 md:hidden">
        {rows.map((d) => (
          <MobileListCard key={d.id}>
            <MobileListRow label="Lisans">
              {d.license_key ? (
                <Link href={`/licenses/${encodeURIComponent(d.license_key)}`} className="break-license-key text-emerald-400">
                  {d.license_key}
                </Link>
              ) : (
                "—"
              )}
            </MobileListRow>
            <MobileListRow label="Cihaz ID">
              <span className="break-license-key font-mono text-xs">{d.device_id}</span>
            </MobileListRow>
            <MobileListRow label="Ad">{d.device_name}</MobileListRow>
            <MobileListRow label="Sürüm">{d.app_version || "—"}</MobileListRow>
            <MobileListRow label="Aktif">{d.is_active ? "Evet" : "Hayır"}</MobileListRow>
            <MobileListRow label="Son görülme">{fmtDate(d.last_seen_at)}</MobileListRow>
          </MobileListCard>
        ))}
      </div>

      <Card className="admin-table-desktop admin-desktop-only hidden md:block">
        <CardHeader title="Tüm cihazlar" />
        <CardBody className="overflow-x-hidden p-0">
          <table className="hidden w-full text-sm md:table">
            <thead className="border-b border-slate-800 text-left text-slate-400">
              <tr>
                <th className="px-5 py-3">Lisans</th>
                <th className="px-5 py-3">Cihaz ID</th>
                <th className="px-5 py-3">Ad</th>
                <th className="px-5 py-3">Sürüm</th>
                <th className="px-5 py-3">Aktif</th>
                <th className="px-5 py-3">Son görülme</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                  <td className="px-5 py-3 font-mono text-xs">
                    {d.license_key ? (
                      <Link href={`/licenses/${encodeURIComponent(d.license_key)}`} className="break-license-key text-emerald-400 hover:underline">
                        {d.license_key}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{d.device_id}</td>
                  <td className="px-5 py-3">{d.device_name}</td>
                  <td className="px-5 py-3">{d.app_version || "—"}</td>
                  <td className="px-5 py-3">{d.is_active ? "Evet" : "Hayır"}</td>
                  <td className="px-5 py-3 text-slate-400">{fmtDate(d.last_seen_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
