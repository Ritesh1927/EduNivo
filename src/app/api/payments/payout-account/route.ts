import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { Admin } from "@/models/Admin";
import { createLinkedAccount } from "@/lib/razorpayRoute";

function requireSchoolAdmin(req: Request) {
  const auth = getAuthUser(req);
  if (!auth || auth.role !== "schooladmin") return null;
  return auth;
}

// GET /api/payments/payout-account — the school's own Razorpay Route
// payout status, for the Settings > Payments tab.
export async function GET(req: Request) {
  const auth = requireSchoolAdmin(req);
  if (!auth) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  try {
    await connectDB();
    const admin = await Admin.findById(auth.id).select("settings.payments");
    if (!admin) return NextResponse.json({ success: false, message: "School not found." }, { status: 404 });
    return NextResponse.json({ success: true, data: admin.settings.payments });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to load payout account." },
      { status: 500 },
    );
  }
}

// POST /api/payments/payout-account — create (or re-request, for a
// rejected/expired link) the school's Razorpay Route linked account and
// hosted onboarding link. Never accepts bank/IFSC details directly -- see
// createLinkedAccount's own comment; the school enters those on Razorpay's
// own hosted page, not here.
export async function POST(req: Request) {
  const auth = requireSchoolAdmin(req);
  if (!auth) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  try {
    await connectDB();
    const admin = await Admin.findById(auth.id);
    if (!admin) return NextResponse.json({ success: false, message: "School not found." }, { status: 404 });

    if (admin.settings.payments.payoutStatus === "active") {
      return NextResponse.json({ success: false, message: "A payout account is already connected." }, { status: 400 });
    }

    const { accountId, onboardingUrl } = await createLinkedAccount(admin);

    admin.settings.payments.razorpayAccountId = accountId;
    admin.settings.payments.onboardingUrl = onboardingUrl;
    admin.settings.payments.payoutStatus = "pending";
    admin.settings.payments.rejectionReason = "";
    await admin.save();

    return NextResponse.json({ success: true, message: "Onboarding link ready.", data: admin.settings.payments });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to start payout onboarding." },
      { status: 500 },
    );
  }
}
