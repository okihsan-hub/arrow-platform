export type OfflineLicenseCache = {
  license_key: string;
  device_id: string;
  expires_at: string; // ISO datetime
  last_validated_at: string; // ISO datetime
};

export type ValidationResponse =
  | {
      valid: true;
      reason?: null;
      product_name?: string;
      expires_at: string;
      max_devices?: number;
      device_count?: number;
    }
  | { valid: false; reason: string };

const STORAGE_KEY = "arrow:license:last_validation_v1";
const OFFLINE_GRACE_MS = 24 * 60 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

function ms(d: string) {
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : NaN;
}

export function readOfflineCache(): OfflineLicenseCache | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OfflineLicenseCache;
    if (!parsed?.license_key || !parsed?.device_id || !parsed?.expires_at || !parsed?.last_validated_at) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeOfflineCache(entry: OfflineLicenseCache) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
}

export async function validateLicenseOnline(license_key: string, device_id: string): Promise<ValidationResponse> {
  const res = await fetch("/api/licenses/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ license_key, device_id })
  });
  return (await res.json()) as ValidationResponse;
}

/**
 * Offline fallback rules:
 * - If server is unreachable (network error), allow usage for up to 24h since last_validated_at,
 *   and only if cached license/device match and cached expires_at is still in the future.
 * - After 24h, block usage (valid=false).
 */
export async function validateWithOfflineFallback(
  license_key: string,
  device_id: string
): Promise<ValidationResponse & { offline?: boolean }> {
  try {
    const online = await validateLicenseOnline(license_key, device_id);
    if (online.valid && online.expires_at) {
      writeOfflineCache({
        license_key,
        device_id,
        expires_at: online.expires_at,
        last_validated_at: nowIso()
      });
    }
    return online;
  } catch {
    const cached = readOfflineCache();
    if (!cached) return { valid: false, reason: "offline_no_cache", offline: true };
    if (cached.license_key !== license_key || cached.device_id !== device_id) {
      return { valid: false, reason: "offline_cache_mismatch", offline: true };
    }

    const now = Date.now();
    const last = ms(cached.last_validated_at);
    const exp = ms(cached.expires_at);
    if (!Number.isFinite(last) || !Number.isFinite(exp)) {
      return { valid: false, reason: "offline_cache_invalid", offline: true };
    }
    if (exp <= now) return { valid: false, reason: "license_expired", offline: true };
    if (now - last > OFFLINE_GRACE_MS) return { valid: false, reason: "offline_grace_expired", offline: true };

    return {
      valid: true,
      reason: null,
      expires_at: cached.expires_at,
      offline: true
    };
  }
}

/**
 * Activation must be online (no offline fallback).
 */
export async function activateLicenseOnline(payload: {
  license_key: string;
  device_id: string;
  device_name: string;
  app_version: string;
  headers: { "X-Timestamp": string; "X-Nonce": string; "X-Signature": string; "User-Agent"?: string };
}): Promise<ValidationResponse> {
  const res = await fetch("/api/licenses/activate", {
    method: "POST",
    headers: { "content-type": "application/json", ...payload.headers },
    body: JSON.stringify({
      license_key: payload.license_key,
      device_id: payload.device_id,
      device_name: payload.device_name,
      app_version: payload.app_version
    })
  });
  return (await res.json()) as ValidationResponse;
}

