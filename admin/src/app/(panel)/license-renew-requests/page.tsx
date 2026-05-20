"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { LicenseRenewRequest, LicenseRenewRequestStatus } from "@/lib/types";
import { Badge, Button, Card, CardBody, CardHeader } from "@/components/ui";
import { MobileListCard, MobileListRow } from "@/components/MobileList";
import { fmtDate } from "@/lib/format";

type Filter = "all" | LicenseRenewRequestStatus;

const PERIOD_LABEL: Record<string, string> = {
  "1_month": "1 ay",
  "3_months": "3 ay",
  "6_months": "6 ay",
  "1_year": "1 yıl",
};

const STATUS_LABEL: Record<LicenseRenewRequestStatus, string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

const STATUS_TONE: Record<LicenseRenewRequestStatus, "warn" | "success" | "danger" | "default"> = {
  pending: "warn",
  approved: "success",
  rejected: "danger",
};

function periodLabel(period: string, label: string | null) {
  return label || PERIOD_LABEL[period] || period;
}

export default function LicenseRenewRequestsPage() {
  const [rows, setRows] = useState<LicenseRenewRequest[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<LicenseRenewRequest | null>(null);

  const load = useCallback(async () => {
    setError("");
    const q = filter === "all" ? "all" : filter;
    const data = await api<LicenseRenewRequest[]>(`/admin/license-renew-requests?status=${q}`);
    setRows(data);
  }, [filter]);

  useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, [load]);

  const filtered = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      const rank = (s: string) => (s === "pending" ? 0 : 1);
      const d = rank(a.status) - rank(b.status);
      if (d !== 0) return d;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [rows]);

  async function openDetail(id: number) {
    setDetailId(id);
    setError("");
    try {
      const d = await api<LicenseRenewRequest>(`/admin/license-renew-requests/${id}`);
      setDetail(d);
    } catch (e) {
      setDetail(null);
      setError(e instanceof Error ? e.message : "Detay yüklenemedi");
    }
  }

  function closeDetail() {
    setDetailId(null);
    setDetail(null);
  }

  async function approve(id: number) {
    if (!window.confirm("Bu talebi onaylayıp lisans süresini uzatmak istiyor musunuz?")) return;
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api<LicenseRenewRequest>(`/admin/license-renew-requests/${id}/approve`, { method: "POST" });
      setSuccess("Talep onaylandı; lisans süresi uzatıldı.");
      await load();
      if (detailId === id) await openDetail(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Onay başarısız");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: number) {
    if (!window.confirm("Bu talebi reddetmek istiyor musunuz?")) return;
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api<LicenseRenewRequest>(`/admin/license-renew-requests/${id}/reject`, { method: "POST" });
      setSuccess("Talep reddedildi.");
      await load();
      if (detailId === id) await openDetail(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Red işlemi başarısız");
    } finally {
      setBusyId(null);
    }
  }

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setSuccess("Lisans anahtarı panoya kopyalandı.");
    } catch {
      setError("Kopyalama başarısız");
    }
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Tümü" },
    { id: "pending", label: "Bekleyen" },
    { id: "approved", label: "Onaylı" },
    { id: "rejected", label: "Reddedilen" },
  ];

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Yenileme Talepleri</h1>
        <p className="text-slate-400">Arrow Restaurant jsonl kayıtlarından senkronize edilir.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              filter === f.id
                ? "border-emerald-600 bg-emerald-600/20 text-emerald-300"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {f.label}
          </button>
        ))}
        <Button variant="secondary" className="min-h-10" onClick={() => load().catch((e) => setError(e.message))}>
          Yenile
        </Button>
      </div>

      {success ? (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">
          {success}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="admin-mobile-only block space-y-3 md:hidden">
        {filtered.map((r) => (
          <MobileListCard
            key={r.id}
            footer={
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-800 text-sm font-semibold"
                  onClick={() => openDetail(r.id)}
                >
                  Detay
                </button>
                {r.status === "pending" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="min-h-11 w-full"
                      disabled={busyId === r.id}
                      onClick={() => approve(r.id)}
                    >
                      Onayla
                    </Button>
                    <Button
                      variant="danger"
                      className="min-h-11 w-full"
                      disabled={busyId === r.id}
                      onClick={() => reject(r.id)}
                    >
                      Reddet
                    </Button>
                  </div>
                ) : null}
              </div>
            }
          >
            <MobileListRow label="Firma">{r.customer_name || "—"}</MobileListRow>
            <MobileListRow label="Anahtar">
              <span className="font-mono text-xs">{r.license_key_masked || "—"}</span>
            </MobileListRow>
            <MobileListRow label="Süre">{periodLabel(r.requested_period, r.requested_period_label)}</MobileListRow>
            <MobileListRow label="Durum">
              <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
            </MobileListRow>
            <MobileListRow label="Tarih">{fmtDate(r.created_at)}</MobileListRow>
          </MobileListCard>
        ))}
        {!filtered.length ? <p className="text-slate-500">Kayıt yok.</p> : null}
      </div>

      <Card className="hidden md:block">
        <CardHeader title="Talepler" desc={`${filtered.length} kayıt`} />
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Firma</th>
                <th className="px-4 py-3">Anahtar</th>
                <th className="px-4 py-3">Süre</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                  <td className="px-4 py-3">{r.customer_name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400/90">{r.license_key_masked || "—"}</td>
                  <td className="px-4 py-3">{periodLabel(r.requested_period, r.requested_period_label)}</td>
                  <td className="px-4 py-3">{r.contact_phone || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" onClick={() => openDetail(r.id)}>
                        Detay
                      </Button>
                      {r.status === "pending" ? (
                        <>
                          <Button disabled={busyId === r.id} onClick={() => approve(r.id)}>
                            Onayla
                          </Button>
                          <Button variant="danger" disabled={busyId === r.id} onClick={() => reject(r.id)}>
                            Reddet
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <p className="p-5 text-slate-500">Kayıt yok.</p> : null}
        </CardBody>
      </Card>

      {detail ? (
        <Card>
          <CardHeader
            title="Talep detayı"
            action={
              <Button variant="ghost" onClick={closeDetail}>
                Kapat
              </Button>
            }
          />
          <CardBody className="space-y-3 text-sm">
            <p>
              <span className="text-slate-500">Firma: </span>
              {detail.customer_name || "—"}
            </p>
            <p>
              <span className="text-slate-500">Süre: </span>
              {periodLabel(detail.requested_period, detail.requested_period_label)}
            </p>
            <p>
              <span className="text-slate-500">Not: </span>
              {detail.note || "—"}
            </p>
            <p>
              <span className="text-slate-500">Telefon: </span>
              {detail.contact_phone || "—"}
            </p>
            <p>
              <span className="text-slate-500">Tarih: </span>
              {fmtDate(detail.created_at)}
            </p>
            <p>
              <span className="text-slate-500">Durum: </span>
              <Badge tone={STATUS_TONE[detail.status]}>{STATUS_LABEL[detail.status]}</Badge>
            </p>
            {detail.license_key ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-emerald-400 break-all">{detail.license_key}</span>
                <Button variant="secondary" onClick={() => copyKey(detail.license_key!)}>
                  Kopyala
                </Button>
              </div>
            ) : (
              <p className="font-mono text-xs text-slate-400">{detail.license_key_masked || "—"}</p>
            )}
            {detail.status === "pending" ? (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button disabled={busyId === detail.id} onClick={() => approve(detail.id)}>
                  Onayla
                </Button>
                <Button variant="danger" disabled={busyId === detail.id} onClick={() => reject(detail.id)}>
                  Reddet
                </Button>
              </div>
            ) : null}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
