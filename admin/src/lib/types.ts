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
