"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, licensePath } from "@/lib/api";
import type { LicenseDetail } from "@/lib/types";
import { Badge, Button, Card, CardBody, CardHeader, Input, Label, statusTone } from "@/components/ui";
import { MobileListCard, MobileListRow } from "@/components/MobileList";
import { fmtDate, fmtDateInput } from "@/lib/format";

export default function LicenseDetailPage() {
  const params = useParams<{ key: string }>();
  const key = decodeURIComponent(params.key);
  const router = useRouter();
  const [lic, setLic] = useState<LicenseDetail | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<LicenseDetail>(licensePath(key))
      .then(setLic)
      .catch((e) => setError(e.message));
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  async function action(path: string, method = "POST", body?: object) {
    setBusy(true);
    setMsg("");
    setError("");
    try {
      await api(licensePath(key) + path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });
      load();
      setMsg("İşlem başarılı");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function onRenew(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const extend_days = fd.get("extend_days");
    const expires_at = fd.get("expires_at");
    const body: Record<string, unknown> = {};
    if (extend_days) body.extend_days = Number(extend_days);
    if (expires_at) body.expires_at = new Date(String(expires_at)).toISOString();
    await action("/renew", "POST", body);
  }

  if (!lic && !error) return <p className="text-slate-400">Yükleniyor…</p>;
  if (!lic) return <p className="text-red-400">{error}</p>;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-start">
        <div className="min-w-0">
          <p className="break-license-key font-mono text-sm text-emerald-400">{lic.license_key}</p>
          <h1 className="text-2xl font-bold">{lic.customer_name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone={statusTone(lic.status)}>{lic.status}</Badge>
            <Badge>{lic.plan}</Badge>
          </div>
        </div>
        <Button variant="secondary" className="w-full md:w-auto" onClick={() => router.push("/licenses")}>
          Listeye dön
        </Button>
      </div>

      {msg ? <p className="text-emerald-400">{msg}</p> : null}
      {error ? <p className="text-red-400">{error}</p> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Özet" />
          <CardBody className="space-y-2 text-sm">
            <p>
              <span className="text-slate-400">Başlangıç:</span> {fmtDate(lic.starts_at)}
            </p>
            <p>
              <span className="text-slate-400">Bitiş:</span> {fmtDate(lic.expires_at)}
            </p>
            <p>
              <span className="text-slate-400">Cihaz:</span> {lic.active_devices ?? 0} / {lic.max_devices}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="İşlemler" />
          <CardBody className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button variant="secondary" className="w-full sm:w-auto" disabled={busy} onClick={() => action("/suspend")}>
              Askıya al
            </Button>
            <Button variant="danger" className="w-full sm:w-auto" disabled={busy} onClick={() => action("/cancel")}>
              İptal et
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto" disabled={busy} onClick={() => action("/reset-device")}>
              Cihazları sıfırla
            </Button>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Yenile" />
        <CardBody>
          <form onSubmit={onRenew} className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
            <div className="w-full md:w-auto">
              <Label htmlFor="extend_days">Gün ekle</Label>
              <Input id="extend_days" name="extend_days" type="number" min={1} placeholder="30" className="w-full md:w-28" />
            </div>
            <div className="w-full md:w-auto">
              <Label htmlFor="expires_at">Yeni bitiş</Label>
              <Input
                id="expires_at"
                name="expires_at"
                type="datetime-local"
                defaultValue={fmtDateInput(lic.expires_at)}
                className="w-full md:w-56"
              />
            </div>
            <Button type="submit" className="w-full md:w-auto" disabled={busy}>
              Yenile
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Cihazlar" desc={`${lic.devices.length} kayıt`} />
        <div className="admin-mobile-only block space-y-3 p-4 md:hidden">
          {lic.devices.map((d) => (
            <MobileListCard key={d.id}>
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
        <CardBody className="admin-table-desktop admin-desktop-only hidden overflow-x-hidden p-0 md:block">
          <table className="hidden w-full text-sm md:table">
            <thead className="border-b border-slate-800 text-left text-slate-400">
              <tr>
                <th className="px-5 py-3">Cihaz ID</th>
                <th className="px-5 py-3">Ad</th>
                <th className="px-5 py-3">Sürüm</th>
                <th className="px-5 py-3">Aktif</th>
                <th className="px-5 py-3">Son görülme</th>
              </tr>
            </thead>
            <tbody>
              {lic.devices.map((d) => (
                <tr key={d.id} className="border-b border-slate-800/80">
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
