"use client";

import { FormEvent, useEffect, useState } from "react";
import type { UpdateRelease, UpdateReleaseInput } from "@/api/updates";
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
  is_active: true,
};

type Props = {
  editing: UpdateRelease | null;
  busy: boolean;
  onCancelEdit: () => void;
  onSubmit: (body: UpdateReleaseInput) => Promise<void>;
};

export function UpdateReleaseForm({ editing, busy, onCancelEdit, onSubmit }: Props) {
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
      is_active: editing.is_active,
    });
  }, [editing]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <Card>
      <CardHeader
        title={editing ? "Release Düzenle" : "Yeni Release"}
        desc={editing ? `Kayıt #${editing.id}` : "Arrow Restaurant sürüm metadata kaydı"}
        action={
          editing ? (
            <Button variant="ghost" onClick={onCancelEdit}>
              Yeni kayıt
            </Button>
          ) : null
        }
      />
      <CardBody>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
          <label className="flex min-h-10 items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600 bg-slate-950"
              checked={form.force_update}
              onChange={(e) => setForm((f) => ({ ...f, force_update: e.target.checked }))}
            />
            Force Update
          </label>
          <label className="flex min-h-10 items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600 bg-slate-950"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="submit" disabled={busy}>
              Kaydet
            </Button>
            {editing ? (
              <Button type="button" variant="secondary" disabled={busy} onClick={onCancelEdit}>
                İptal
              </Button>
            ) : null}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
