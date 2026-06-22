"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createUpdateRelease,
  listUpdateReleases,
  updateUpdateRelease,
  type UpdateRelease,
  type UpdateReleaseInput,
} from "@/api/updates";
import { UpdateReleaseForm } from "@/components/updates/UpdateReleaseForm";
import { Badge, Button, Card, CardBody, CardHeader } from "@/components/ui";
import { MobileListCard, MobileListRow } from "@/components/MobileList";
import { fmtDate } from "@/lib/format";

export default function UpdateManagementPage() {
  const [rows, setRows] = useState<UpdateRelease[]>([]);
  const [editing, setEditing] = useState<UpdateRelease | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    const data = await listUpdateReleases();
    setRows(data);
  }, []);

  useEffect(() => {
    load().catch((e: Error) => setError(e.message));
  }, [load]);

  async function handleSubmit(body: UpdateReleaseInput) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      if (editing) {
        await updateUpdateRelease(editing.id, body);
        setSuccess(`Release ${body.version} güncellendi.`);
      } else {
        await createUpdateRelease(body);
        setSuccess(`Release ${body.version} oluşturuldu.`);
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Update Management</h1>
        <p className="text-slate-400">Arrow Restaurant sürüm release kayıtları.</p>
      </div>

      <UpdateReleaseForm
        editing={editing}
        busy={busy}
        onCancelEdit={() => setEditing(null)}
        onSubmit={handleSubmit}
      />

      {success ? (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">
          {success}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="admin-mobile-only block space-y-3 md:hidden">
        {rows.map((r) => (
          <MobileListCard
            key={r.id}
            className={r.is_active ? "border-emerald-600/60 bg-emerald-950/20" : undefined}
            footer={
              <Button className="min-h-11 w-full" variant="secondary" onClick={() => setEditing(r)}>
                Düzenle
              </Button>
            }
          >
            <MobileListRow label="App">{r.app_name}</MobileListRow>
            <MobileListRow label="Version">{r.version}</MobileListRow>
            <MobileListRow label="Channel">{r.channel}</MobileListRow>
            <MobileListRow label="Active">
              {r.is_active ? <Badge tone="success">Active</Badge> : <Badge>Passive</Badge>}
            </MobileListRow>
            <MobileListRow label="Force Update">{r.force_update ? "Evet" : "Hayır"}</MobileListRow>
            <MobileListRow label="Created At">{fmtDate(r.created_at)}</MobileListRow>
          </MobileListCard>
        ))}
        {!rows.length ? <p className="text-slate-500">Kayıt yok.</p> : null}
      </div>

      <Card className="hidden md:block">
        <CardHeader
          title="Release Listesi"
          desc={`${rows.length} kayıt`}
          action={
            <Button variant="secondary" onClick={() => load().catch((e) => setError(e.message))}>
              Yenile
            </Button>
          }
        />
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">App</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Force Update</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={
                    r.is_active
                      ? "border-b border-emerald-900/50 bg-emerald-950/25 hover:bg-emerald-950/35"
                      : "border-b border-slate-800/80 hover:bg-slate-800/30"
                  }
                >
                  <td className="px-4 py-3 font-medium">{r.app_name}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400/90">{r.version}</td>
                  <td className="px-4 py-3 uppercase tracking-wide text-slate-300">{r.channel}</td>
                  <td className="px-4 py-3">
                    {r.is_active ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="default">Passive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">{r.force_update ? "Evet" : "Hayır"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" onClick={() => setEditing(r)}>
                      Düzenle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? <p className="p-5 text-slate-500">Kayıt yok.</p> : null}
        </CardBody>
      </Card>
    </div>
  );
}
