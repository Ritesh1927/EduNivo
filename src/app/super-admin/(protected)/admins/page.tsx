"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Mail, Plus, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatDate, saRequest } from "@/lib/superAdminApi";
import { getSuperAdminUser } from "@/lib/superAdminAuth";
import { AdminPageHeader, AdminPanel, EmptyBlock, PRIMARY_CTA, StatusPill } from "@/components/super-admin/ui";

interface AdminRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", confirm: "" };

// Super Admin > Platform > Super Admins: who can run the whole platform.
export default function SuperAdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AdminRow | null>(null);
  const [removing, setRemoving] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);

  const load = async () => {
    try {
      const json = await saRequest<{ data: AdminRow[] }>("/superadmin/admins");
      setAdmins(json.data || []);
    } catch (err) {
      toast.error("Error", { description: err instanceof Error ? err.message : "Failed to load super admins." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: reads the signed-in Super Admin from localStorage once on mount.
    setMeId(getSuperAdminUser()?.id ?? null);
    load();
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setDialogOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await saRequest("/superadmin/admins", {
        method: "POST",
        body: { name: form.name, email: form.email, phone: form.phone, password: form.password },
      });
      toast.success("Super Admin added", { description: `${form.email} can now sign in.` });
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error("Couldn't add Super Admin", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await saRequest(`/superadmin/admins/${removeTarget._id}`, { method: "DELETE" });
      toast.success("Super Admin removed", { description: `${removeTarget.email} no longer has access.` });
      setRemoveTarget(null);
      await load();
    } catch (err) {
      toast.error("Couldn't remove Super Admin", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setRemoving(false);
    }
  };

  const onlyOne = admins.length <= 1;

  return (
    <div>
      <AdminPageHeader
        title="Super Admins"
        description="People who can manage every school, plan and setting on the platform."
        icon={ShieldCheck}
        actions={
          <Button onClick={openAdd} className={PRIMARY_CTA}>
            <Plus className="h-4 w-4" /> Add Super Admin
          </Button>
        }
      />

      <AdminPanel>
        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : admins.length === 0 ? (
          <EmptyBlock icon={ShieldCheck} title="No Super Admins found" />
        ) : (
          <ul className="divide-y divide-border/60">
            {admins.map((a) => {
              const isMe = a._id === meId;
              return (
                <li key={a._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[13px] font-bold text-primary">
                      {a.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                        {a.name}
                        {isMe && <StatusPill tone="info" label="You" />}
                        {!a.isActive && <StatusPill tone="neutral" label="Inactive" />}
                      </p>
                      <p className="flex items-center gap-1.5 truncate text-[13px] text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" /> {a.email}
                        {a.phone && <span className="ml-2">· {a.phone}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <span className="text-[12.5px] text-muted-foreground">Added {formatDate(a.createdAt)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isMe || onlyOne}
                      title={isMe ? "You can't remove your own account" : onlyOne ? "At least one Super Admin must remain" : undefined}
                      onClick={() => setRemoveTarget(a)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AdminPanel>

      <Dialog open={dialogOpen} onOpenChange={(o) => !saving && setDialogOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/25">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="font-heading text-[17px] font-bold">Add Super Admin</DialogTitle>
              <DialogDescription className="text-[12.5px]">
                They&apos;ll sign in with this email and password, then a one-time code sent to the email — so use an inbox they check.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={submit} className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sa-name">Full name</Label>
              <Input id="sa-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sa-email">Email</Label>
              <Input id="sa-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sa-phone">Phone <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="sa-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sa-password">Password</Label>
              <div className="relative">
                <Input
                  id="sa-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[12px] text-muted-foreground">At least 8 characters. Share it with them privately.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sa-confirm">Confirm password</Label>
              <Input id="sa-confirm" type={showPassword ? "text" : "password"} value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} minLength={8} required autoComplete="new-password" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" className={PRIMARY_CTA} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Add Super Admin
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title={removeTarget ? `Remove ${removeTarget.name}?` : "Remove Super Admin?"}
        description={removeTarget ? `${removeTarget.email} will lose access to the Super Admin panel immediately.` : undefined}
        confirmLabel="Remove"
        loading={removing}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
