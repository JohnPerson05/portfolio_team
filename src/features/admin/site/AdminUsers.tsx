"use client";

import { useState } from "react";

import {
  changeOwnPassword,
  createAdminUser,
  deleteAdminUser,
  resetAdminPassword,
  updateAdminUser,
} from "@/actions/admin-users";
import type { AdminUserRow } from "@/server/admin/queries";
import {
  AdminButton,
  AdminInput,
  AdminSelect,
  Badge,
  FormField,
  Icon,
  Panel,
  RowMenu,
  Sheet,
  Switch,
  fieldProps,
  timeAgo,
  useAdminAction,
  useAdminFeedback,
  useRecordForm,
} from "../ui";

interface UserForm {
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "EDITOR";
  password: string;
  isActive: boolean;
}

const EMPTY: UserForm = { name: "", email: "", role: "EDITOR", password: "", isActive: true };

export function AdminUsers({
  users,
  currentUserId,
  isSuperAdmin,
}: {
  users: AdminUserRow[];
  currentUserId: string;
  isSuperAdmin: boolean;
}) {
  const form = useRecordForm<UserForm>(EMPTY);
  const { run } = useAdminAction();
  const { confirm, toast } = useAdminFeedback();
  const { values, errors, set } = form;
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string[]>>({});
  const [pwSaving, setPwSaving] = useState(false);

  const save = () =>
    form.submit(
      (id, v) =>
        id
          ? updateAdminUser(id, { name: v.name, role: v.role, isActive: v.isActive })
          : createAdminUser({ name: v.name, email: v.email, role: v.role, password: v.password }),
      form.editingId ? "Admin updated" : "Admin added — share the password with them securely",
    );

  async function changePassword() {
    setPwSaving(true);
    const result = await changeOwnPassword(pw.current, pw.next).catch(() => null);
    setPwSaving(false);
    if (result?.success) {
      setPw({ current: "", next: "" });
      setPwErrors({});
      toast("Password changed");
    } else {
      setPwErrors(result && !result.success ? (result.fieldErrors ?? {}) : {});
      toast(result && !result.success ? (result.formError ?? "Couldn't change password.") : "Couldn't change password.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isSuperAdmin ? (
        <Panel
          title="Admins"
          description="Super admins can manage other admins. Editors can manage all content."
          actions={
            <AdminButton size="sm" variant="primary" onClick={() => form.openNew()}>
              <Icon.Plus size={14} /> Add admin
            </AdminButton>
          }
          bodyClassName="p-0 sm:p-0"
        >
          <ul className="divide-y divide-zinc-100">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-900">
                    {user.name}
                    {user.id === currentUserId ? <Badge tone="blue">You</Badge> : null}
                    {!user.isActive ? <Badge tone="red">Deactivated</Badge> : null}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {user.email} · last sign-in {user.lastLoginAt ? timeAgo(user.lastLoginAt) : "never"}
                  </p>
                </div>
                <Badge tone={user.role === "SUPER_ADMIN" ? "violet" : "neutral"}>
                  {user.role === "SUPER_ADMIN" ? "Super admin" : "Editor"}
                </Badge>
                <RowMenu
                  label={`Actions for ${user.name}`}
                  items={[
                    {
                      label: "Edit",
                      icon: <Icon.Pen size={14} />,
                      onSelect: () =>
                        form.openEdit(user.id, { name: user.name, email: user.email, role: user.role, password: "", isActive: user.isActive }),
                    },
                    {
                      label: "Reset password",
                      icon: <Icon.Settings size={14} />,
                      hidden: user.id === currentUserId,
                      onSelect: async () => {
                        const next = window.prompt(`New password for ${user.email} (at least 12 characters):`);
                        if (next) run(() => resetAdminPassword(user.id, next), { success: "Password reset", refresh: false });
                      },
                    },
                    {
                      label: "Remove",
                      icon: <Icon.Trash size={14} />,
                      tone: "danger",
                      hidden: user.id === currentUserId,
                      onSelect: async () => {
                        if (await confirm({ title: `Remove ${user.email}?`, description: "They lose access immediately.", confirmLabel: "Remove", tone: "danger" })) {
                          run(() => deleteAdminUser(user.id), { success: "Admin removed" });
                        }
                      },
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title="Change your password">
        <form
          className="grid max-w-md gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void changePassword();
          }}
        >
          <FormField id="pw-current" label="Current password" error={pwErrors.current}>
            <AdminInput {...fieldProps("pw-current", pwErrors.current)} type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} />
          </FormField>
          <FormField id="pw-next" label="New password" hint="At least 12 characters." error={pwErrors.next}>
            <AdminInput {...fieldProps("pw-next", pwErrors.next)} type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} />
          </FormField>
          <div>
            <AdminButton type="submit" variant="primary" loading={pwSaving} disabled={!pw.current || !pw.next}>
              Change password
            </AdminButton>
          </div>
        </form>
      </Panel>

      <Sheet
        open={form.open}
        onClose={form.close}
        title={form.editingId ? "Edit admin" : "Add admin"}
        onSubmit={save}
        submitting={form.submitting}
        submitLabel={form.editingId ? "Save" : "Add admin"}
      >
        <FormField id="u-name" label="Name" required error={errors.name}>
          <AdminInput {...fieldProps("u-name", errors.name)} value={values.name} onChange={(e) => set("name", e.target.value)} />
        </FormField>
        <FormField id="u-email" label="Email" required error={errors.email} hint={form.editingId ? "Email can't be changed." : undefined}>
          <AdminInput {...fieldProps("u-email", errors.email)} type="email" disabled={!!form.editingId} value={values.email} onChange={(e) => set("email", e.target.value)} />
        </FormField>
        <FormField id="u-role" label="Role" error={errors.role}>
          <AdminSelect {...fieldProps("u-role", errors.role)} value={values.role} onChange={(e) => set("role", e.target.value as UserForm["role"])}>
            <option value="EDITOR">Editor — manages content</option>
            <option value="SUPER_ADMIN">Super admin — also manages admins</option>
          </AdminSelect>
        </FormField>
        {form.editingId ? (
          <Switch
            label="Active"
            description="Deactivated admins are signed out and can't sign in."
            checked={values.isActive}
            onChange={(v) => set("isActive", v)}
            disabled={form.editingId === currentUserId}
          />
        ) : (
          <FormField id="u-pw" label="Temporary password" required error={errors.password} hint="At least 12 characters. They can change it after signing in.">
            <AdminInput {...fieldProps("u-pw", errors.password)} type="password" autoComplete="new-password" value={values.password} onChange={(e) => set("password", e.target.value)} />
          </FormField>
        )}
      </Sheet>
    </div>
  );
}
