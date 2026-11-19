"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, Wallet } from "lucide-react";
import { getToken } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface PayoutAccount {
  razorpayAccountId: string;
  payoutStatus: "not_connected" | "pending" | "active" | "rejected";
  onboardingUrl: string;
  rejectionReason: string;
  connectedAt: string | null;
}
interface PayoutAccountResponse { success: boolean; data: PayoutAccount }

// Self-contained widget (fetches/saves on its own, like YearSwitchWizard
// elsewhere on this page) for the school admin to connect a Razorpay Route
// payout account. The school enters bank/KYC details on Razorpay's own
// hosted page -- this platform only ever stores the returned account id
// and status, never raw banking details. See src/lib/razorpayRoute.ts.
export function PayoutAccountPanel() {
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const load = () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    apiGet<PayoutAccountResponse>("/payments/payout-account", token)
      .then((res) => setAccount(res.data))
      .catch(() => toast.error("Failed to load payout account status"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: initial data load on mount.
    load();
  }, []);

  const connect = () => {
    const token = getToken();
    if (!token) return;
    setConnecting(true);
    apiPost<PayoutAccountResponse>("/payments/payout-account", {}, token)
      .then((res) => {
        setAccount(res.data);
        if (res.data.onboardingUrl) window.open(res.data.onboardingUrl, "_blank", "noopener,noreferrer");
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to start onboarding"))
      .finally(() => setConnecting(false));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading payout account status...
      </div>
    );
  }
  if (!account) {
    return <p className="text-sm text-muted-foreground">Failed to load payout account status.</p>;
  }

  if (account.payoutStatus === "active") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-500/20 dark:bg-green-500/10">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-400">Payout account connected</p>
            <p className="text-xs text-green-700/80 dark:text-green-400/70">
              Account {account.razorpayAccountId} · online fee payments now go directly to your bank.
              {account.connectedAt && ` Connected ${new Date(account.connectedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">To change bank details, contact Razorpay support directly.</p>
      </div>
    );
  }

  if (account.payoutStatus === "pending") {
    return (
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
        <div className="flex items-center gap-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Waiting on Razorpay to verify your details</p>
        </div>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
          If you haven&apos;t finished the form yet, resume it below. This usually takes a little while to review once submitted.
        </p>
        <div className="flex flex-wrap gap-2">
          {account.onboardingUrl && (
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(account.onboardingUrl, "_blank", "noopener,noreferrer")}>
              <ExternalLink className="h-3.5 w-3.5" /> Resume onboarding
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh status
          </Button>
        </div>
      </div>
    );
  }

  if (account.payoutStatus === "rejected") {
    return (
      <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/10">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <p className="text-sm font-semibold text-red-800 dark:text-red-400">Payout account setup was rejected</p>
        </div>
        <p className="text-xs text-red-700/80 dark:text-red-400/70">{account.rejectionReason || "Razorpay didn't approve this account."}</p>
        <Button type="button" size="sm" className="gap-1.5" onClick={connect} disabled={connecting}>
          {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />} Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-border px-4 py-5 text-center">
      <Wallet className="mx-auto h-8 w-8 text-muted-foreground/40" />
      <div>
        <p className="text-sm font-medium text-foreground">No payout account connected yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Connect your bank account through Razorpay to start collecting online fee payments. You&apos;ll enter your bank details on Razorpay&apos;s own secure page — never here.
        </p>
      </div>
      <Button type="button" className="gap-1.5" onClick={connect} disabled={connecting}>
        {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />} Connect payout account
      </Button>
    </div>
  );
}
