"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ReleaseStatus, UpdateRelease, UpdateReleaseInput } from "@/api/updates";
import { Button, Card, CardBody, CardHeader, Input, Label, Select, Textarea } from "@/components/ui";

const EMPTY_FORM: UpdateReleaseInput = {
  app_name: "arrow-restaurant",
  version: "",
  channel: "stable",
  force_update: false,
  min_supported_version: "1.0.0",
  download_url: "",
  sha256: "",
  release_notes: "",
  uploaded_file_name: "",
  file_size_bytes: null,
};

const STATUS_LABEL: Record<ReleaseStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

type Props = {
  editing: UpdateRelease | null;
  busy: boolean;
  onCancelEdit: () => void;
  onDraftSave: (body: UpdateReleaseInput) => Promise<void>;
  onPublish: (body: UpdateReleaseInput) => Promise<void>;
  onArchive: (releaseId: number) => Promise<void>;
};

export function UpdateReleaseForm({
  editing,
  busy,
  onCancelEdit,
  onDraftSave,
  onPublish,
  onArchive,
}: Props) {
  const [form, setForm] = useState<UpdateReleaseInput>(EMPTY_FORM);

  useEffect(() => {
    if (!editing) {
      setForm(EMPTY_FORM);
      return;
    }
    setForm({
      app_name: editing.app_name,
      version: editing.version,
      channel: editing.channel,
      force_update: editing.force_update,
      min_supported_version: editing.min_supported_version,
      download_url: editing.download_url ?? "",
      sha256: editing.sha256 ?? "",
      release_notes: editing.release_notes ?? "",
      uploaded_file_name: editing.uploaded_file_name ?? "",
      file_size_bytes: editing.file_size_bytes,
    });
  }, [editing]);

  async function handleDraftSave(e: FormEvent) {
    e.preventDefault();
    await onDraftSave(form);
  }

  const currentStatus: ReleaseStatus = editing?.release_status ?? "draft";
  const canPublish = editing != null && currentStatus !== "archived";
  const canArchive = editing != null && currentStatus !== "archived";

  return (
    <Card>
      <CardHeader
        title={editing ? "Release Düzenle" : "Yeni Release"}
        desc={editing ? `Kayıt #${editing.id}` : "Kurulum paketi metadata kaydı (draft olarak başlar)"}
        action={
          editing ? (
            <Button variant="ghost" onClick={onCancelEdit}>
              Yeni kayıt
            </Button>
          ) : null
        }
      />
      <CardBody>
        <form onSubmit={handleDraftSave} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="app_name">App Name</Label>
            <Input
              id="app_name"
              value={form.app_name}
              onChange={(e) => setForm((f) => ({ ...f, app_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={form.version}
              onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="channel">Channel</Label>
            <Select
              id="channel"
              value={form.channel}
              onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
            >
              <option value="stable">stable</option>
              <option value="beta">beta</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="min_supported_version">Minimum Supported Version</Label>
            <Input
              id="min_supported_version"
              value={form.min_supported_version}
              onChange={(e) => setForm((f) => ({ ...f, min_supported_version: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="uploaded_file_name">Uploaded File Name</Label>
            <Input
              id="uploaded_file_name"
              value={form.uploaded_file_name}
              onChange={(e) => setForm((f) => ({ ...f, uploaded_file_name: e.target.value }))}
              placeholder="ArrowRestaurant-1.0.2-setup.exe"
            />
          </div>
          <div>
            <Label htmlFor="file_size_bytes">File Size (bytes)</Label>
            <Input
              id="file_size_bytes"
              type="number"
              min={0}
              value={form.file_size_bytes ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  file_size_bytes: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="download_url">Download URL</Label>
            <Input
              id="download_url"
              value={form.download_url}
              onChange={(e) => setForm((f) => ({ ...f, download_url: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="sha256">SHA256</Label>
            <Input
              id="sha256"
              value={form.sha256}
              onChange={(e) => setForm((f) => ({ ...f, sha256: e.target.value }))}
              placeholder="64 karakter hex"
              className="font-mono text-xs"
            />
          </div>
          <div>
            <Label htmlFor="release_status">Status</Label>
            <Input
              id="release_status"
              value={STATUS_LABEL[currentStatus]}
              readOnly
              className="bg-slate-900 text-slate-300"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="release_notes">Release Notes</Label>
            <Textarea
              id="release_notes"
              rows={4}
              value={form.release_notes}
              onChange={(e) => setForm((f) => ({ ...f, release_notes: e.target.value }))}
            />
          </div>
          <label className="flex min-h-10 items-center gap-2 text-sm text-slate-200 md:col-span-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600 bg-slate-950"
              checked={form.force_update}
              onChange={(e) => setForm((f) => ({ ...f, force_update: e.target.checked }))}
            />
            Force Update
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="submit" disabled={busy || currentStatus === "archived"}>
              Draft Kaydet
            </Button>
            {editing && canPublish ? (
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => onPublish(form)}
              >
                Publish
              </Button>
            ) : null}
            {editing && canArchive ? (
              <Button
                type="button"
                variant="danger"
                disabled={busy}
                onClick={() => onArchive(editing.id)}
              >
                Archive
              </Button>
            ) : null}
            {editing ? (
              <Button type="button" variant="ghost" disabled={busy} onClick={onCancelEdit}>
                İptal
              </Button>
            ) : null}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
