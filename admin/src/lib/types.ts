export type LicensePlan = "demo" | "standard" | "pro" | "enterprise";
export type LicenseStatus = "active" | "suspended" | "expired" | "cancelled";

export interface Customer {
  id: number;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  tax_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface License {
  id: number;
  license_key: string;
  customer_id: number;
  plan: LicensePlan;
  status: LicenseStatus;
  starts_at: string;
  expires_at: string;
  max_devices: number;
  features: Record<string, unknown> | unknown[] | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  active_devices: number | null;
}

export interface LicenseDevice {
  id: number;
  license_id: number;
  license_key: string | null;
  device_id: string;
  device_name: string;
  app_version: string | null;
  first_activated_at: string;
  last_seen_at: string;
  is_active: boolean;
}

export interface LicenseDetail extends License {
  devices: LicenseDevice[];
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export type LicenseRenewRequestStatus = "pending" | "approved" | "rejected";

export type DeploymentMode = "server" | "client";

export interface LicenseRequest {
  id: number;
  request_code: string;
  status: LicenseRenewRequestStatus;
  company_name: string;
  contact_name: string;
  contact_position: string | null;
  email: string;
  phone: string;
  tax_number: string | null;
  machine_code: string;
  device_name: string;
  app_version: string;
  deployment_mode: DeploymentMode;
  requested_plan: string | null;
  notes: string | null;
  license_key: string | null;
  customer_id: number | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}

export interface LicenseRenewRequest {
  id: number;
  external_id: string;
  status: LicenseRenewRequestStatus;
  created_at: string;
  requested_period: string;
  requested_period_label: string | null;
  note: string | null;
  contact_phone: string | null;
  license_key_masked: string | null;
  license_key: string | null;
  license_id: number | null;
  customer_name: string | null;
  device_name: string | null;
  device_id: string | null;
  client_license_status: string | null;
  plan: string | null;
  imported_at: string;
  processed_at: string | null;
}
