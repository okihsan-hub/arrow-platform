"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { DeploymentMode, LicenseRequest, LicenseRenewRequestStatus } from "@/lib/types";
import { Badge, Button, Card, CardBody, CardHeader, Label, Textarea } from "@/components/ui";
import { MobileListCard, MobileListRow } from "@/components/MobileList";
import { fmtDate } from "@/lib/format";

type Filter = "all" | LicenseRenewRequestStatus;

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

const DEPLOYMENT_LABEL: Record<DeploymentMode, string> = {
  server: "Sunucu",
  client: "İstemci",
};

export default function LicenseRequestsPage() {
  const [rows, setRows] = useState<LicenseRequest[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<LicenseRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const load = useCallback(async () => {
    setError("");
    const q = filter === "all" ? "all" : filter;
    const data = await api<LicenseRequest[]>(`/admin/license-requests?status=${q}`);
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
    setShowRejectForm(false);
    setRejectReason("");
    setError("");
    try {
      const d = await api<LicenseRequest>(`/admin/license-requests/${id}`);
      setDetail(d);
    } catch (e) {
      setDetail(null);
      setError(e instanceof Error ? e.message : "Detay yüklenemedi");
    }
  }

  function closeDetail() {
    setDetailId(null);
    setDetail(null);
    setShowRejectForm(false);
    setRejectReason("");
  }

  async function approve(id: number) {
    if (!window.confirm("Bu talebi onaylayıp yeni lisans oluşturmak istiyor musunuz?")) return;
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api<LicenseRequest>(`/admin/license-requests/${id}/approve`, { method: "POST" });
      setSuccess("Talep onaylandı; lisans oluşturuldu.");
      await load();
      if (detailId === id) await openDetail(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Onay başarısız");
    } finally {
      setBusyId(null);
    }
  }

  async function submitReject(id: number) {
    const reason = rejectReason.trim();
    if (!reason) {
      setError("Red nedeni zorunludur.");
      return;
    }
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api<LicenseRequest>(`/admin/license-requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejection_reason: reason }),
      });
      setSuccess("Talep reddedildi.");
      setShowRejectForm(false);
      setRejectReason("");
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
        <h1 className="text-2xl font-bold">Lisans Talepleri</h1>
        <p className="text-slate-400">İlk kurulum ve yeni müşteri lisans talepleri.</p>
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
                    <Button className="min-h-11 w-full" disabled={busyId === r.id} onClick={() => approve(r.id)}>
                      Onayla
                    </Button>
                    <Button
                      variant="danger"
                      className="min-h-11 w-full"
                      disabled={busyId === r.id}
                      onClick={() => {
                        openDetail(r.id);
                        setShowRejectForm(true);
                      }}
                    >
                      Reddet
                    </Button>
                  </div>
                ) : null}
              </div>
            }
          >
            <MobileListRow label="Talep Kodu">
              <span className="font-mono text-xs">{r.request_code}</span>
            </MobileListRow>
            <MobileListRow label="Firma">{r.company_name}</MobileListRow>
            <MobileListRow label="Kurulum">{DEPLOYMENT_LABEL[r.deployment_mode]}</MobileListRow>
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
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Talep Kodu</th>
                <th className="px-4 py-3">Firma</th>
                <th className="px-4 py-3">Yetkili</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Kurulum Tipi</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400/90">{r.request_code}</td>
                  <td className="px-4 py-3">{r.company_name}</td>
                  <td className="px-4 py-3">{r.contact_name}</td>
                  <td className="px-4 py-3">{r.phone}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">{DEPLOYMENT_LABEL[r.deployment_mode]}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.created_at)}</td>
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
                          <Button
                            variant="danger"
                            disabled={busyId === r.id}
                            onClick={() => {
                              openDetail(r.id);
                              setShowRejectForm(true);
                            }}
                          >
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
              <span className="text-slate-500">Talep kodu: </span>
              <span className="font-mono text-xs text-emerald-400">{detail.request_code}</span>
            </p>
            <p>
              <span className="text-slate-500">Firma: </span>
              {detail.company_name}
            </p>
            <p>
              <span className="text-slate-500">Yetkili: </span>
              {detail.contact_name}
              {detail.contact_position ? ` (${detail.contact_position})` : ""}
            </p>
            <p>
              <span className="text-slate-500">Telefon: </span>
              {detail.phone}
            </p>
            <p>
              <span className="text-slate-500">E-posta: </span>
              {detail.email}
            </p>
            {detail.tax_number ? (
              <p>
                <span className="text-slate-500">Vergi no: </span>
                {detail.tax_number}
              </p>
            ) : null}
            <p>
              <span className="text-slate-500">Kurulum: </span>
              {DEPLOYMENT_LABEL[detail.deployment_mode]}
            </p>
            <p>
              <span className="text-slate-500">Cihaz: </span>
              {detail.device_name} ({detail.machine_code})
            </p>
            <p>
              <span className="text-slate-500">Uygulama: </span>
              {detail.app_version}
            </p>
            {detail.requested_plan ? (
              <p>
                <span className="text-slate-500">İstenen plan: </span>
                {detail.requested_plan}
              </p>
            ) : null}
            {detail.notes ? (
              <p>
                <span className="text-slate-500">Not: </span>
                {detail.notes}
              </p>
            ) : null}
            <p>
              <span className="text-slate-500">Tarih: </span>
              {fmtDate(detail.created_at)}
            </p>
            <p>
              <span className="text-slate-500">Durum: </span>
              <Badge tone={STATUS_TONE[detail.status]}>{STATUS_LABEL[detail.status]}</Badge>
            </p>
            {detail.rejection_reason ? (
              <p>
                <span className="text-slate-500">Red nedeni: </span>
                {detail.rejection_reason}
              </p>
            ) : null}
            {detail.license_key ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-emerald-400 break-all">{detail.license_key}</span>
                <Button variant="secondary" onClick={() => copyKey(detail.license_key!)}>
                  Kopyala
                </Button>
              </div>
            ) : null}
            {detail.status === "pending" ? (
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap gap-2">
                  <Button disabled={busyId === detail.id} onClick={() => approve(detail.id)}>
                    Onayla
                  </Button>
                  <Button
                    variant="danger"
                    disabled={busyId === detail.id}
                    onClick={() => setShowRejectForm((v) => !v)}
                  >
                    Reddet
                  </Button>
                </div>
                {showRejectForm ? (
                  <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <Label htmlFor="reject_reason">Red nedeni *</Label>
                    <Textarea
                      id="reject_reason"
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Red gerekçesini yazın"
                    />
                    <Button
                      variant="danger"
                      disabled={busyId === detail.id}
                      onClick={() => submitReject(detail.id)}
                    >
                      Reddet ve kaydet
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
