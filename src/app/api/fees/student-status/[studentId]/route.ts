import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser, getNonTeachingStaffSections } from "@/lib/auth-server";
import { Parent } from "@/models/Parent";
import { getCurrentAcademicYear } from "@/lib/academicYear";
import { computeFeeHeadsForStudent, getOutstandingPastYears } from "@/lib/feeDues";

// GET /api/fees/student-status/[studentId]?academicYear= — per-fee-head,
// per-month status for the given academic session (defaults to the
// school's current one). Powers the month-grid collection UI for admin
// (CollectFeeTab/StudentLookupTab) and parent self-pay (ParentFeesTab), now
// year-aware so a past year's record stays reachable after a year switch
// (see computeFeeHeadsForStudent in src/lib/feeDues.ts, ported from the
// Student Ledger report). Always reports outstandingPastYears regardless of
// which year is being viewed, so a caller can show the "clear past dues
// first" banner even while looking at the current year.
export async function GET(req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const auth = getAuthUser(req);
  if (!auth || !["schooladmin", "teacher", "parent"].includes(auth.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { studentId } = await params;
    const requestedYear = new URL(req.url).searchParams.get("academicYear");
    await connectDB();
    const staffSections = await getNonTeachingStaffSections(auth);
    if (staffSections && !staffSections.fees?.open) {
      return NextResponse.json({ success: false, message: "You don't have permission to do this." }, { status: 403 });
    }

    if (auth.role === "parent") {
      const parentDoc = await Parent.findById(auth.id);
      const childIds = (parentDoc?.students || []).map((id) => String(id));
      if (!childIds.includes(studentId)) {
        return NextResponse.json({ success: false, message: "Access denied." }, { status: 403 });
      }
    }

    const currentYear = await getCurrentAcademicYear(auth.schoolId);
    const targetYear = requestedYear || currentYear;

    // Non-teaching staff need the fees extra specifically for a past year;
    // a genuine teacher's existing blanket canManageFees access (already
    // the only gate above) is untouched either way — same rule already
    // applied to the Student Ledger report.
    if (targetYear !== currentYear && staffSections && !staffSections.fees?.extras?.viewPastYears) {
      return NextResponse.json({ success: false, message: "You don't have permission to view past-year fee data." }, { status: 403 });
    }

    const result = await computeFeeHeadsForStudent(auth.schoolId, studentId, targetYear, currentYear);
    if (!result.student) return NextResponse.json({ success: false, message: "Student not found." }, { status: 404 });

    const outstandingPastYears = await getOutstandingPastYears(auth.schoolId, studentId, currentYear);

    return NextResponse.json({
      success: true,
      data: {
        student: result.student,
        feeHeads: result.feeHeads,
        lateFeeConfig: result.lateFeeConfig,
        totalBalance: result.totalBalance,
        targetYear: result.targetYear,
        isPastYear: result.isPastYear,
        message: result.message,
        outstandingPastYears,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to load fee status." },
      { status: 500 },
    );
  }
}
