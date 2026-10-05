"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { login } from "@/actions/auth";
import { AdminButton, AdminInput, Icon } from "./ui";
import { ADMIN_DASHBOARD_HREF, LOGIN_GENERIC_ERROR } from "./config";

export interface LoginFormProps {
  className?: string;
}

/** Only return to CMS paths after sign-in (no open redirects). */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.startsWith("/admin/login")) {
    return ADMIN_DASHBOARD_HREF;
  }
  return next;
}

/**
 * CMS sign-in. Errors are always generic ("Invalid email or password.") so
 * the form never reveals which part was wrong.
 */
export function LoginForm({ className }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    if (remember) formData.set("remember", "on");

    setSubmitting(true);
    try {
      const result = await login(formData);
      if (result.success) {
        router.replace(safeNext(searchParams?.get("next")));
        router.refresh();
        return;
      }
      setError(result.formError ?? LOGIN_GENERIC_ERROR);
    } catch {
      setError(LOGIN_GENERIC_ERROR);
    }
    setSubmitting(false);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className={className} aria-describedby={error ? errorId : undefined}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-zinc-800">
            Email
          </label>
          <AdminInput
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
            placeholder="you@studio.com"
            className="h-10"
            aria-invalid={error ? true : undefined}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="text-[13px] font-medium text-zinc-800">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              aria-expanded={showHelp}
              className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <AdminInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(undefined);
              }}
              placeholder="••••••••••••"
              className="h-10 pr-10"
              aria-invalid={error ? true : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-zinc-400 hover:text-zinc-700"
            >
              {showPassword ? <Icon.EyeOff /> : <Icon.Eye />}
            </button>
          </div>
        </div>

        {showHelp ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[13px] leading-relaxed text-zinc-600">
            Ask a super admin to reset it from <strong>Admin users</strong>. If you&apos;re the only admin, run{" "}
            <code className="rounded bg-white px-1 text-[12px]">npm run admin:setup</code> on your machine to set a new one.
          </div>
        ) : null}

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-zinc-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 accent-zinc-900"
          />
          Remember me for 30 days
        </label>

        <div className="min-h-[1.25rem]" aria-live="assertive">
          {error ? (
            <p id={errorId} role="alert" className="flex items-center gap-1.5 text-[13px] font-medium text-red-600">
              <Icon.Alert size={14} /> {error}
            </p>
          ) : null}
        </div>

        <AdminButton type="submit" variant="primary" loading={submitting} className="h-10 w-full text-sm">
          {submitting ? "Signing in…" : "Sign in"}
        </AdminButton>
      </div>
    </form>
  );
}
