"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { Button, Card, CardBody, CardHeader } from "@/components/ui";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Müşteriler</h1>
          <p className="text-slate-400">{rows.length} kayıt</p>
        </div>
        <Link href="/customers/new">
          <Button>Yeni müşteri</Button>
        </Link>
      </div>

      {error ? <p className="text-red-400">{error}</p> : null}

      <Card>
        <CardHeader title="Liste" />
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full text-sm">
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
