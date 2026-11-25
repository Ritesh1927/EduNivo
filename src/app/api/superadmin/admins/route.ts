import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth-server";
import { SuperAdmin } from "@/models/SuperAdmin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

// GET /api/superadmin/admins — every Super Admin account (no secrets).
export async function GET(req: Request) {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return auth.error;

  try {
    await connectDB();
    const admins = await SuperAdmin.find().select("name email phone isActive createdAt").sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: admins });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to load super admins." },
      { status: 500 },
    );
  }
}

// POST /api/superadmin/admins — add another Super Admin. They sign in with
// this email + password, then a one-time code sent to the email, so the
// address must be an inbox they actually read.
export async function POST(req: Request) {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");

    if (name.length < 2) return NextResponse.json({ success: false, message: "Enter a name." }, { status: 400 });
    if (!EMAIL_REGEX.test(email)) return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    if (password.length < MIN_PASSWORD) {
      return NextResponse.json({ success: false, message: `Password must be at least ${MIN_PASSWORD} characters.` }, { status: 400 });
    }

    await connectDB();
    if (await SuperAdmin.exists({ email })) {
      return NextResponse.json({ success: false, message: "A Super Admin with this email already exists." }, { status: 409 });
    }

    // Plain password in: the model's pre-save hook hashes it.
    const created = await SuperAdmin.create({ name, email, phone, password, isActive: true, isVerified: true });
    return NextResponse.json(
      {
        success: true,
        message: "Super Admin added.",
        data: { _id: created._id, name: created.name, email: created.email, phone: created.phone, isActive: created.isActive, createdAt: created.get("createdAt") },
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to add super admin." },
      { status: 500 },
    );
  }
}
