"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail, MessageSquare, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { BTN_PRIMARY } from "./styles";

type ContactFormState = { name: string; email: string; phone: string; message: string; website: string };
const EMPTY: ContactFormState = { name: "", email: "", phone: "", message: "", website: "" };

function validate(f: ContactFormState): Partial<Record<keyof ContactFormState, string>> {
  const e: Partial<Record<keyof ContactFormState, string>> = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.message.trim().length < 5) e.message = "Please enter a message.";
  return e;
}

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (k: keyof ContactFormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const found = validate(form);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "contact", contactPerson: form.name, email: form.email, phone: form.phone, message: form.message, website: form.website }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/12 text-success ring-8 ring-success/[0.06]">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-5 font-heading text-[20px] font-bold">Thanks, {form.name.split(" ")[0]}!</h3>
        <p className="mt-2 max-w-sm text-[15px] text-muted-foreground">We&apos;ve received your message and will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="contact-name" label="Your name" icon={User} error={errors.name}>
        <input id="contact-name" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" placeholder="Full name" />
      </Field>
      <Field id="contact-email" label="Email" icon={Mail} error={errors.email}>
        <input id="contact-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" placeholder="you@school.edu.in" />
      </Field>
      <Field id="contact-phone" label="Phone (optional)" icon={User} error={errors.phone}>
        <input id="contact-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 15))} autoComplete="tel" placeholder="98765 43210" />
      </Field>
      <Field id="contact-message" label="Message" icon={MessageSquare} error={errors.message} textarea>
        <textarea id="contact-message" value={form.message} onChange={(e) => set("message", e.target.value)} rows={4} placeholder="How can we help?" />
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" aria-hidden />
      {serverError && <p role="alert" className="rounded-xl bg-destructive/8 px-4 py-3 text-[14px] text-destructive ring-1 ring-destructive/50">{serverError}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className={cn(BTN_PRIMARY, "w-full")}
      >
        {status === "sending" ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
        {status === "sending" ? "Sending…" : "Send Message"}
        {status !== "sending" && <ArrowRight className="h-4.5 w-4.5" />}
      </button>
    </form>
  );
}

function Field({ id, label, icon: Icon, error, children, textarea }: { id: string; label: string; icon: typeof User; error?: string; children: ReactNode; textarea?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-foreground/80">{label}</label>
      <div
        className={cn(
          "relative flex rounded-xl bg-[#F8F8FE] ring-1 transition-shadow focus-within:bg-white focus-within:ring-2 focus-within:ring-primary",
          textarea ? "items-start" : "items-center",
          error ? "ring-destructive" : "ring-foreground/10",
          "[&_input]:h-12 [&_input]:w-full [&_input]:bg-transparent [&_input]:pr-3 [&_input]:pl-10 [&_input]:text-[15px] [&_input]:text-foreground [&_input]:outline-none [&_input]:placeholder:text-muted-foreground/70",
          "[&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:bg-transparent [&_textarea]:py-3 [&_textarea]:pr-3 [&_textarea]:pl-10 [&_textarea]:text-[15px] [&_textarea]:text-foreground [&_textarea]:outline-none [&_textarea]:placeholder:text-muted-foreground/70",
        )}
        aria-invalid={!!error}
      >
        <Icon className={cn("pointer-events-none absolute left-3.5 h-4.5 w-4.5 text-muted-foreground/70", textarea ? "top-3.5" : "")} />
        {children}
      </div>
      {error && <p role="alert" className="text-[12.5px] text-destructive">{error}</p>}
    </div>
  );
}
