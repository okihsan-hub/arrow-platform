"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { Button, Card, CardBody, CardHeader } from "@/components/ui";
import { MobileListCard, MobileListRow } from "@/components/MobileList";
import { fmtDate } from "@/lib/format";

export default function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Customer[]>("/customers")
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Müşteriler</h1>
          <p className="text-slate-400">{rows.length} kayıt</p>
        </div>
        <Link href="/customers/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">Yeni müşteri</Button>
        </Link>
      </div>

      {error ? <p className="text-red-400">{error}</p> : null}

      <div className="admin-mobile-only block space-y-3 md:hidden">
        {rows.map((c) => (
          <MobileListCard
            key={c.id}
            footer={
              <Link
                href={`/customers/${c.id}`}
                className="flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-sm font-semibold"
              >
                Detay
              </Link>
            }
          >
            <MobileListRow label="Firma">{c.company_name}</MobileListRow>
            <MobileListRow label="İletişim">{c.contact_name || "—"}</MobileListRow>
            <MobileListRow label="E-posta">{c.email || "—"}</MobileListRow>
            <MobileListRow label="Telefon">{c.phone || "—"}</MobileListRow>
            <MobileListRow label="Güncelleme">{fmtDate(c.updated_at)}</MobileListRow>
          </MobileListCard>
        ))}
      </div>

      <Card className="admin-table-desktop admin-desktop-only hidden md:block">
        <CardHeader title="Liste" />
        <CardBody className="overflow-x-hidden p-0">
          <table className="hidden w-full text-sm md:table">
            <thead className="border-b border-slate-800 text-left text-slate-400">
              <tr>
                <th className="px-5 py-3">Firma</th>
                <th className="px-5 py-3">İletişim</th>
                <th className="px-5 py-3">E-posta</th>
                <th className="px-5 py-3">Telefon</th>
                <th className="px-5 py-3">Güncelleme</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                  <td className="px-5 py-3">
                    <Link href={`/customers/${c.id}`} className="font-medium text-emerald-400 hover:underline">
                      {c.company_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{c.contact_name || "—"}</td>
                  <td className="px-5 py-3">{c.email || "—"}</td>
                  <td className="px-5 py-3">{c.phone || "—"}</td>
                  <td className="px-5 py-3 text-slate-400">{fmtDate(c.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
