"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Customer, License, LicensePlan } from "@/lib/types";
import { Button, Card, CardBody, CardHeader, Input, Label, Select } from "@/components/ui";

const PLANS: LicensePlan[] = ["demo", "standard", "pro", "enterprise"];

export default function NewLicensePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Customer[]>("/customers").then(setCustomers).catch((e) => setError(e.message));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    const plan = String(fd.get("plan")) as LicensePlan;
    const body: Record<string, unknown> = {
      customer_id: Number(fd.get("customer_id")),
      plan,
      max_devices: Number(fd.get("max_devices") || 1),
    };
    const expires = String(fd.get("expires_at") || "");
    if (expires) body.expires_at = new Date(expires).toISOString();
    try {
      const lic = await api<License>("/licenses", { method: "POST", body: JSON.stringify(body) });
      router.push(`/licenses/${encodeURIComponent(lic.license_key)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Oluşturulamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Yeni lisans</h1>
      <Card>
        <CardHeader title="Bilgiler" desc="Demo planında süre otomatik 7 gündür." />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customer_id">Müşteri *</Label>
              <Select id="customer_id" name="customer_id" required defaultValue="">
                <option value="" disabled>
                  Seçin
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="plan">Plan *</Label>
                <Select id="plan" name="plan" defaultValue="demo">
                  {PLANS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="max_devices">Max cihaz</Label>
                <Input id="max_devices" name="max_devices" type="number" min={1} defaultValue={1} />
              </div>
            </div>
            <div>
              <Label htmlFor="expires_at">Bitiş (demo dışı / opsiyonel)</Label>
              <Input id="expires_at" name="expires_at" type="datetime-local" />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                Oluştur
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                İptal
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
