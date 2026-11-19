import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { verifyWebhookSignature } from "@/lib/razorpayRoute";

// POST /api/payments/webhook — Razorpay's callback for Route account
// events (account.activated / account.rejected / account.needs_clarification).
// No auth header (Razorpay itself calls this) -- it already passes through
// src/proxy.ts untouched today, since that proxy only ever inspects
// requests carrying a Bearer token. Must always respond quickly and must
// be idempotent, since Razorpay retries on anything but a prompt 2xx.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ success: false, message: "Invalid signature." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, message: "Invalid payload." }, { status: 400 });
  }

  try {
    const event = String(body.event || "");
    const payload = (body.payload as Record<string, unknown> | undefined) || {};
    const accountEntity = ((payload.account as Record<string, unknown> | undefined)?.entity as Record<string, unknown> | undefined) || {};
    const accountId = String(body.account_id || accountEntity.id || "");

    if (!accountId) {
      console.error("[payments/webhook] no account id in payload for event:", event);
      return NextResponse.json({ success: true }); // ack anyway -- nothing we can look up
    }
    if (!["account.activated", "account.rejected", "account.needs_clarification", "account.under_review"].includes(event)) {
      return NextResponse.json({ success: true }); // ack, nothing this feature acts on
    }

    await connectDB();
    const admin = await Admin.findOne({ "settings.payments.razorpayAccountId": accountId });
    if (!admin) {
      console.error("[payments/webhook] no school found for Razorpay account id:", accountId);
      return NextResponse.json({ success: true });
    }

    if (event === "account.activated") {
      admin.settings.payments.payoutStatus = "active";
      admin.settings.payments.connectedAt = new Date();
      admin.settings.payments.rejectionReason = "";
    } else if (event === "account.rejected") {
      admin.settings.payments.payoutStatus = "rejected";
      admin.settings.payments.rejectionReason =
        String(accountEntity.rejection_reason || accountEntity.status_reason || "Razorpay rejected this payout account.");
    } else {
      // needs_clarification / under_review -- still mid-review, not yet a
      // hard rejection; surfaced as "pending" with whatever detail is given.
      admin.settings.payments.payoutStatus = "pending";
    }
    await admin.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[payments/webhook] processing failed:", err);
    // Still ack 2xx -- an internal error here shouldn't make Razorpay spin
    // retrying indefinitely; the status just stays stale until it resolves.
    return NextResponse.json({ success: true });
  }
}
