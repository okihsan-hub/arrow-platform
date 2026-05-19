"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { Button, Card, CardBody, CardHeader, Input, Label, Textarea } from "@/components/ui";
import { fmtDate } from "@/lib/format";

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [row, setRow] = useState<Customer | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Customer>(`/customers/${id}`)
      .then(setRow)
      .catch((e) => setError(e.message));
  }, [id]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const updated = await api<Customer>(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          company_name: String(fd.get("company_name")),
          contact_name: String(fd.get("contact_name") || "") || null,
          email: String(fd.get("email") || "") || null,
          phone: String(fd.get("phone") || "") || null,
          tax_number: String(fd.get("tax_number") || "") || null,
          notes: String(fd.get("notes") || "") || null,
        }),
      });
      setRow(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Güncelleme başarısız");
    } finally {
      setLoading(false);
    }
  }

  if (!row && !error) return <p className="text-slate-400">Yükleniyor…</p>;
  if (!row) return <p className="text-red-400">{error}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{row.company_name}</h1>
        <p className="text-sm text-slate-400">Oluşturulma: {fmtDate(row.created_at)}</p>
      </div>
      <Card>
        <CardHeader title="Düzenle" />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4" key={row.id}>
            <div>
              <Label htmlFor="company_name">Firma adı</Label>
              <Input id="company_name" name="company_name" defaultValue={row.company_name} required />
            </div>
            <div>
              <Label htmlFor="contact_name">Yetkili</Label>
              <Input id="contact_name" name="contact_name" defaultValue={row.contact_name || ""} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" defaultValue={row.email || ""} />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" name="phone" defaultValue={row.phone || ""} />
              </div>
            </div>
            <div>
              <Label htmlFor="tax_number">Vergi no</Label>
              <Input id="tax_number" name="tax_number" defaultValue={row.tax_number || ""} />
            </div>
            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea id="notes" name="notes" rows={3} defaultValue={row.notes || ""} />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                Güncelle
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/customers")}>
                Listeye dön
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
