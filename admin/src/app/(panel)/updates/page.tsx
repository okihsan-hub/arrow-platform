"use client";

import { useCallback, useEffect, useState } from "react";
import {
  archiveUpdateRelease,
  createUpdateRelease,
  fmtFileSize,
  listUpdateReleases,
  publishUpdateRelease,
  updateUpdateRelease,
  uploadUpdateReleasePackage,
  type ReleaseStatus,
  type UpdateRelease,
  type UpdateReleaseInput,
} from "@/api/updates";
import { UpdateReleaseForm } from "@/components/updates/UpdateReleaseForm";
import { Badge, Button, Card, CardBody, CardHeader } from "@/components/ui";
import { MobileListCard, MobileListRow } from "@/components/MobileList";
import { fmtDate } from "@/lib/format";

const STATUS_TONE: Record<ReleaseStatus, "default" | "success" | "warn" | "danger"> = {
  draft: "warn",
  published: "success",
  archived: "default",
};

const STATUS_LABEL: Record<ReleaseStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

function rowHighlight(release: UpdateRelease) {
  return release.release_status === "published" && release.is_active
    ? "border-emerald-600/60 bg-emerald-950/25"
    : undefined;
}

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

  async function persistDraft(body: UpdateReleaseInput, releaseId?: number) {
    if (releaseId) {
      return updateUpdateRelease(releaseId, body);
    }
    return createUpdateRelease(body);
  }

  async function handleDraftSave(body: UpdateReleaseInput) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const saved = await persistDraft(body, editing?.id);
      setSuccess(`Release ${body.version} draft olarak kaydedildi.`);
      setEditing(saved);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız");
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish(body: UpdateReleaseInput) {
    if (!editing) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await persistDraft(body, editing.id);
      const published = await publishUpdateRelease(editing.id);
      setSuccess(`Release ${published.version} yayınlandı.`);
      setEditing(published);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish başarısız");
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive(releaseId: number) {
    if (!window.confirm("Bu release arşivlensin mi?")) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const archived = await archiveUpdateRelease(releaseId);
      setSuccess(`Release ${archived.version} arşivlendi.`);
      setEditing(archived);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Archive başarısız");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(file: File) {
    if (!editing) {
      throw new Error("Önce draft kaydedin.");
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const uploaded = await uploadUpdateReleasePackage(editing.id, file);
      setEditing({
        ...editing,
        uploaded_file_name: uploaded.file_name,
        file_size_bytes: uploaded.file_size_bytes,
        sha256: uploaded.sha256,
        download_url: uploaded.download_url,
      });
      setSuccess(`Paket yüklendi: ${uploaded.file_name}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız");
      throw e;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Update Management</h1>
        <p className="text-slate-400">Kurulum paketi metadata ve release yaşam döngüsü.</p>
      </div>

      <UpdateReleaseForm
        editing={editing}
        busy={busy}
        onCancelEdit={() => setEditing(null)}
        onDraftSave={handleDraftSave}
        onPublish={handlePublish}
        onArchive={handleArchive}
        onUpload={handleUpload}
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
            className={rowHighlight(r)}
            footer={
              <Button className="min-h-11 w-full" variant="secondary" onClick={() => setEditing(r)}>
                Düzenle
              </Button>
            }
          >
            <MobileListRow label="App">{r.app_name}</MobileListRow>
            <MobileListRow label="Version">{r.version}</MobileListRow>
            <MobileListRow label="Channel">{r.channel}</MobileListRow>
            <MobileListRow label="Status">
              <Badge tone={STATUS_TONE[r.release_status]}>{STATUS_LABEL[r.release_status]}</Badge>
            </MobileListRow>
            <MobileListRow label="File Name">{r.uploaded_file_name || "—"}</MobileListRow>
            <MobileListRow label="File Size">{fmtFileSize(r.file_size_bytes)}</MobileListRow>
            <MobileListRow label="Published At">{fmtDate(r.published_at)}</MobileListRow>
            <MobileListRow label="Active">
              {r.is_active ? <Badge tone="success">Active</Badge> : <Badge>Passive</Badge>}
            </MobileListRow>
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
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">App</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">File Size</th>
                <th className="px-4 py-3">Published At</th>
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
                    r.release_status === "published" && r.is_active
                      ? "border-b border-emerald-900/50 bg-emerald-950/25 hover:bg-emerald-950/35"
                      : "border-b border-slate-800/80 hover:bg-slate-800/30"
                  }
                >
                  <td className="px-4 py-3 font-medium">{r.app_name}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400/90">{r.version}</td>
                  <td className="px-4 py-3 uppercase tracking-wide text-slate-300">{r.channel}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[r.release_status]}>{STATUS_LABEL[r.release_status]}</Badge>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3" title={r.uploaded_file_name ?? undefined}>
                    {r.uploaded_file_name || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtFileSize(r.file_size_bytes)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.published_at)}</td>
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
