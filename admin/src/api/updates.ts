import { api } from "@/lib/api";

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
  is_active: boolean;
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
