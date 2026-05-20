import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean" | "tags" | "url" | "image" | "gallery";
  placeholder?: string;
};

export function CrudManager({
  title,
  table,
  fields,
  display,
  defaults,
}: {
  title: string;
  table: string;
  fields: Field[];
  display: (row: any) => { primary: string; secondary?: string };
  defaults: Record<string, any>;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: [table, "admin"],
    queryFn: async () => ((await supabase.from(table as any).select("*").order("created_at", { ascending: false })).data ?? []) as any[],
  });

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: [table, "admin"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <button onClick={() => setEditing({ ...defaults })} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="mt-8 space-y-2">
        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No items yet — create your first.</div>
        )}
        {rows.map((r) => {
          const d = display(r);
          return (
            <div key={r.id} className="glass flex items-center justify-between gap-4 rounded-2xl p-4">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{d.primary}</div>
                {d.secondary && <div className="truncate text-xs text-muted-foreground">{d.secondary}</div>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(r)} className="rounded-full p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(r.id)} className="rounded-full p-2 hover:bg-destructive/20 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <EditDialog
          table={table}
          fields={fields}
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: [table, "admin"] })}
        />
      )}
    </div>
  );
}

function EditDialog({ table, fields, row, onClose, onSaved }: { table: string; fields: Field[]; row: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>(row);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const isNew = !row.id;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(key);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${table}/${fileName}`;

      const bucketName = "public-assets";
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      if (isGallery) {
        const current = form[key] || [];
        setForm({ ...form, [key]: [...current, publicUrl] });
      } else {
        setForm({ ...form, [key]: publicUrl });
      }
      toast.success("Uploaded");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    setSaving(true);
    const payload = { ...form };
    delete payload.created_at;
    delete payload.updated_at;
    const { error } = isNew ? await supabase.from(table as any).insert(payload) : await supabase.from(table as any).update(payload).eq("id", row.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur" onClick={onClose}>
      <div className="glass-strong max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">{isNew ? "New" : "Edit"}</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea rows={4} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="mt-1.5 w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary" />
              ) : f.type === "boolean" ? (
                <div className="mt-1.5">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} /> Enabled
                  </label>
                </div>
              ) : f.type === "tags" ? (
                <input
                  value={(form[f.key] ?? []).join(", ")}
                  placeholder="comma, separated"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [f.key]: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              ) : f.type === "image" ? (
                <div className="mt-1.5 space-y-2">
                  {form[f.key] && (
                    <div className="relative aspect-video w-32 overflow-hidden rounded-xl border border-border">
                      <img src={form[f.key]} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => setForm({ ...form, [f.key]: null })} className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground backdrop-blur">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={(e) => handleUpload(e, f.key)} className="absolute inset-0 cursor-pointer opacity-0" disabled={uploading === f.key} />
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      {uploading === f.key ? "Uploading..." : "Click to upload image"}
                    </div>
                  </div>
                </div>
              ) : f.type === "gallery" ? (
                <div className="mt-1.5 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(form[f.key] || []).map((url: string, i: number) => (
                      <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() =>
                            setForm({
                              ...form,
                              [f.key]: form[f.key].filter((_: any, idx: number) => idx !== i),
                            })
                          }
                          className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground backdrop-blur"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={(e) => handleUpload(e, f.key, true)} className="absolute inset-0 cursor-pointer opacity-0" disabled={uploading === f.key} />
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      {uploading === f.key ? "Uploading..." : "Add to gallery"}
                    </div>
                  </div>
                </div>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  placeholder={f.placeholder}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: f.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-full border border-border py-2.5 text-sm">
            Cancel
          </button>
          <button disabled={saving || !!uploading} onClick={save} className="flex-1 rounded-full bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
