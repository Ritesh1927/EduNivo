import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth-server";
import { SuperAdmin } from "@/models/SuperAdmin";

// DELETE /api/superadmin/admins/[id] — remove a Super Admin. Their access
// ends on their next request (requireSuperAdmin checks the account exists).
// Refuses removing yourself and removing the last one, so the platform can
// never be left with nobody able to sign in to it.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    if (id === String(auth.auth.id)) {
      return NextResponse.json({ success: false, message: "You can't remove your own account." }, { status: 400 });
    }

    await connectDB();
    const target = await SuperAdmin.findById(id).select("_id");
    if (!target) return NextResponse.json({ success: false, message: "Super Admin not found." }, { status: 404 });

    if ((await SuperAdmin.countDocuments({ isActive: true })) <= 1) {
      return NextResponse.json({ success: false, message: "At least one Super Admin must remain." }, { status: 400 });
    }

    await SuperAdmin.deleteOne({ _id: id });
    return NextResponse.json({ success: true, message: "Super Admin removed." });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to remove super admin." },
      { status: 500 },
    );
  }
}
