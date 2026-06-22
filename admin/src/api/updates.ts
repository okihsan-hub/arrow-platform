import { api } from "@/lib/api";

export type ReleaseStatus = "draft" | "published" | "archived";

export interface UpdateRelease {
  id: number;
  app_name: string;
  version: string;
  channel: string;
  force_update: boolean;
  min_supported_version: string;
  download_url: string | null;
  sha256: string | null;
  release_notes: string | null;
  uploaded_file_name: string | null;
  file_size_bytes: number | null;
  release_status: ReleaseStatus;
  published_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateReleaseInput {
  app_name: string;
  version: string;
  channel: string;
  force_update: boolean;
  min_supported_version: string;
  download_url: string;
  sha256: string;
  release_notes: string;
  uploaded_file_name: string;
  file_size_bytes: number | null;
}

export function listUpdateReleases() {
  return api<UpdateRelease[]>("/admin/updates/releases");
}

export function createUpdateRelease(body: UpdateReleaseInput) {
  return api<UpdateRelease>("/admin/updates/releases", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateUpdateRelease(id: number, body: Partial<UpdateReleaseInput>) {
  return api<UpdateRelease>(`/admin/updates/releases/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function publishUpdateRelease(id: number) {
  return api<UpdateRelease>(`/admin/updates/releases/${id}/publish`, { method: "POST" });
}

export function archiveUpdateRelease(id: number) {
  return api<UpdateRelease>(`/admin/updates/releases/${id}/archive`, { method: "POST" });
}

export function fmtFileSize(bytes: number | null | undefined) {
  if (bytes == null || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
