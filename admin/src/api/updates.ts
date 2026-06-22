import { clearToken, getToken } from "@/lib/auth";
import { api, API_BASE, ApiError } from "@/lib/api";

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

export interface UpdateReleaseUploadResult {
  uploaded: boolean;
  file_name: string;
  file_size_bytes: number;
  sha256: string;
  download_url: string;
}

async function parseApiError(res: Response): Promise<string> {
  let detail = res.statusText;
  try {
    const body = await res.json();
    if (typeof body.detail === "string") detail = body.detail;
  } catch {
    /* ignore */
  }
  return detail;
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

export async function uploadUpdateReleasePackage(id: number, file: File): Promise<UpdateReleaseUploadResult> {
  const form = new FormData();
  form.append("file", file);

  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}/admin/updates/releases/${id}/upload`, {
    method: "POST",
    headers,
    body: form,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError("Oturum geçersiz", 401);
  }

  if (!res.ok) {
    throw new ApiError(await parseApiError(res), res.status);
  }

  return res.json() as Promise<UpdateReleaseUploadResult>;
}

export function fmtFileSize(bytes: number | null | undefined) {
  if (bytes == null || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
