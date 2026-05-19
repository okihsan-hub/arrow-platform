"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { Button, Card, CardBody, CardHeader, Input, Label, Textarea } from "@/components/ui";

export default function NewCustomerPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const body = {
        company_name: String(fd.get("company_name")),
        contact_name: String(fd.get("contact_name") || "") || null,
        email: String(fd.get("email") || "") || null,
        phone: String(fd.get("phone") || "") || null,
        tax_number: String(fd.get("tax_number") || "") || null,
        notes: String(fd.get("notes") || "") || null,
      };
      const row = await api<Customer>("/customers", { method: "POST", body: JSON.stringify(body) });
      router.push(`/customers/${row.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Yeni müşteri</h1>
      <Card>
        <CardHeader title="Bilgiler" />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="company_name">Firma adı *</Label>
              <Input id="company_name" name="company_name" required />
            </div>
            <div>
              <Label htmlFor="contact_name">Yetkili</Label>
              <Input id="contact_name" name="contact_name" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" name="phone" />
              </div>
            </div>
            <div>
              <Label htmlFor="tax_number">Vergi no</Label>
              <Input id="tax_number" name="tax_number" />
            </div>
            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                Kaydet
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
