import { FeeStructure, type IFeeStructure } from "@/models/FeeStructure";
import { FeePayment, type IFeePayment } from "@/models/FeePayment";
import { Student } from "@/models/Student";
import { Concession, type IConcession } from "@/models/Concession";
import { Admin } from "@/models/Admin";
import { AttendanceYearSummary } from "@/models/AttendanceYearSummary";
import {
  generateSessionMonths,
  filterMonthsByAdmission,
  resolveFeeMonths,
  concessionAppliesToMonth,
  concessionAmount,
  isMonthUpcoming,
  dueDateForMonth,
  calcProjectedLateFee,
} from "@/lib/feeEngine";

export interface FeeDueEntry {
  month: string;
  dueDate: Date | null;
  amount: number;
  // Class name of the student the entry is for — optional so existing
  // consumers stay type-compatible; used to group dues per class in
  // /api/fees/analytics (class snapshot on Reports → Overview).
  class?: string;
  // Student the entry belongs to — optional for the same compatibility
  // reason; /api/fees/analytics groups by it to rank top defaulters.
  studentId?: string;
}

export interface ComputeFeeDuesOptions {
  // Session (financial-year) start year — e.g. 2026 for an April-start
  // FY 2026-2027. Defaults to the current calendar year, which is exactly
  // what every existing caller gets today.
  year?: number;
  // Also emit entries for session months that haven't started yet — used
  // by /api/fees/analytics to show the "Upcoming" bucket on the Fees
  // dashboard. Off by default so pending totals elsewhere never include
  // not-yet-due periods.
  includeUpcoming?: boolean;
}

export async function computeFeeDues(schoolId: string, opts: ComputeFeeDuesOptions = {}): Promise<FeeDueEntry[]> {
  const [students, structures, paid, concessions, school] = await Promise.all([
    Student.find({ school: schoolId, isActive: true })
      .select("_id class admissionDate")
      .lean<{ _id: unknown; class: string; admissionDate: Date | string | null }[]>(),
    FeeStructure.find({ school: schoolId, isActive: true }).lean<IFeeStructure[]>(),
    FeePayment.find({ school: schoolId, status: "paid" })
      .select("student feeStructure month")
      .lean<{ student: unknown; feeStructure: unknown; month: string | null }[]>(),
    Concession.find({ school: schoolId }).lean<IConcession[]>(),
    Admin.findById(schoolId).select("settings"),
  ]);

  const paidKeys = new Set(paid.map((p) => `${String(p.student)}|${String(p.feeStructure)}|${p.month || "one-time"}`));
  const hasPaid = (student: unknown, fs: unknown, month: string) => paidKeys.has(`${String(student)}|${String(fs)}|${month}`);

  const conByStudent = new Map<string, IConcession[]>();
  for (const c of concessions) {
    const key = String(c.student);
    const list = conByStudent.get(key) || [];
    list.push(c);
    conByStudent.set(key, list);
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const sessionMonths = generateSessionMonths(school?.settings?.sessionStartMonth || "April", opts.year ?? now.getFullYear());

  const entries: FeeDueEntry[] = [];

  for (const st of students) {
    const applicable = filterMonthsByAdmission(sessionMonths, st.admissionDate);
    const stuCons = conByStudent.get(String(st._id)) || [];
    for (const fs of structures) {
      if (fs.class !== st.class) continue;

      const headCons = stuCons.filter((c) => !c.feeStructure || String(c.feeStructure) === String(fs._id));
      let oneTimeConUsed = false;
      const netAmount = (monthKey: string) => {
        const con = headCons.find((c) => {
          if (!concessionAppliesToMonth(c, monthKey)) return false;
          if (c.duration === "one-time") {
            if (oneTimeConUsed) return false;
            oneTimeConUsed = true;
          }
          return true;
        });
        return Math.max(0, fs.amount - (con ? concessionAmount(fs.amount, con) : 0));
      };

      if (fs.frequency === "quarterly") {
        // Admission-aware: pass `applicable` (not the raw session) so a
        // student who joined mid-session never owes quarters before joining.
        const quarters = resolveFeeMonths("quarterly", applicable, sessionMonths, fs.dueDate);
        for (const q of quarters) {
          if (hasPaid(st._id, fs._id, q) || (isMonthUpcoming(fs.dueDate, q, now) && !opts.includeUpcoming)) continue;
          entries.push({ month: q, dueDate: dueDateForMonth(fs.dueDate, q), amount: netAmount(q), class: st.class, studentId: String(st._id) });
        }
      } else if (fs.frequency === "one-time") {
        if (hasPaid(st._id, fs._id, "one-time")) continue;
        entries.push({ month: "one-time", dueDate: fs.dueDate ? new Date(fs.dueDate) : null, amount: netAmount("one-time"), class: st.class, studentId: String(st._id) });
      } else if (fs.frequency === "yearly") {
        const dueMonth = fs.dueDate
          ? `${new Date(fs.dueDate).getFullYear()}-${String(new Date(fs.dueDate).getMonth() + 1).padStart(2, "0")}`
          : applicable[0] || currentMonth;
        // Admission-aware like monthly: the yearly fee only counts when its
        // month falls within the student's applicable window (after joining,
        // inside this session).
        if (!applicable.includes(dueMonth)) continue;
        if (hasPaid(st._id, fs._id, dueMonth) || (isMonthUpcoming(fs.dueDate, dueMonth, now) && !opts.includeUpcoming)) continue;
        entries.push({ month: dueMonth, dueDate: dueDateForMonth(fs.dueDate, dueMonth), amount: netAmount(dueMonth), class: st.class, studentId: String(st._id) });
      } else {
        // Monthly: every applicable month whose period has started (not
        // just the current one) counts as due until paid, so a student
        // who's fallen behind shows the whole backlog, not just this month.
        for (const monthKey of applicable) {
          if (hasPaid(st._id, fs._id, monthKey) || (isMonthUpcoming(fs.dueDate, monthKey, now) && !opts.includeUpcoming)) continue;
          entries.push({ month: monthKey, dueDate: dueDateForMonth(fs.dueDate, monthKey), amount: netAmount(monthKey), class: st.class, studentId: String(st._id) });
        }
      }
    }
  }

  return entries;
}

export interface FeeHeadMonthRow {
  month: string;
  paid: boolean;
  upcoming: boolean;
  dueDate: Date | null;
  amount: number;
  paidAmount: number;
  lateFee: number;
  concession: number;
  // What's actually still owed for this row, net of concession, and 0 for
  // any row that hasn't become due yet -- unlike `amount` (kept as-is for
  // backward compatibility with existing renderers), this is the figure the
  // past-year payment gate and the outstanding-dues banner both sum.
  balance: number;
  paymentId: unknown;
  receiptNo: string | null;
  paidDate: Date | null;
  paymentMode: string | null;
}

export interface FeeHeadWithBalance {
  _id: unknown;
  title: string;
  amount: number;
  frequency: string;
  dueDate: Date | string;
  concession: { type: string; value: number; isPct: boolean; duration: string } | null;
  months: FeeHeadMonthRow[];
}

export interface StudentFeeYearResult {
  student: { _id: unknown; name: string; class: string; section: string } | null;
  feeHeads: FeeHeadWithBalance[];
  lateFeeConfig: Record<string, unknown>;
  totalBalance: number;
  targetYear: string;
  isPastYear: boolean;
  message?: string;
}

// The one place that resolves "what does this student owe for year X" --
// shared by GET /api/fees/student-status (the live collection grid, any
// year) and getOutstandingPastYears below (summed across every past year,
// for the payment gate). A past year resolves the student's class AT THAT
// YEAR from AttendanceYearSummary rather than their current (possibly
// since-promoted) Student.class, and drops the isActive filter on
// FeeStructure so a head deactivated since still shows for the year it was
// actually collected -- same reasoning as the Student Ledger report, which
// this ports from (src/app/api/fees/reports/student-ledger/[studentId]/route.ts).
export async function computeFeeHeadsForStudent(
  schoolId: string,
  studentId: string,
  targetYear: string,
  currentYear: string,
): Promise<StudentFeeYearResult> {
  const student = await Student.findOne({ _id: studentId, school: schoolId });
  if (!student) {
    return { student: null, feeHeads: [], lateFeeConfig: {}, totalBalance: 0, targetYear, isPastYear: targetYear !== currentYear };
  }

  const isPastYear = targetYear !== currentYear;
  let targetClass = student.class;
  if (isPastYear) {
    const summary = await AttendanceYearSummary.findOne({ school: schoolId, studentId, academicYear: targetYear }).lean();
    if (!summary) {
      return {
        student: { _id: student._id, name: student.name, class: student.class, section: student.section },
        feeHeads: [],
        lateFeeConfig: {},
        totalBalance: 0,
        targetYear,
        isPastYear,
        message: `No fee record found for ${student.name} in ${targetYear}.`,
      };
    }
    targetClass = summary.classAtYearEnd;
  }

  const structureQuery: Record<string, unknown> = {
    school: schoolId,
    class: targetClass,
    academicYear: { $in: [targetYear, ""] },
  };
  if (!isPastYear) structureQuery.isActive = true;

  const [structures, payments, concessions, school] = await Promise.all([
    FeeStructure.find(structureQuery).lean<IFeeStructure[]>(),
    FeePayment.find({ school: schoolId, student: studentId }).lean<IFeePayment[]>(),
    Concession.find({ school: schoolId, student: studentId }).lean<IConcession[]>(),
    Admin.findById(schoolId).select("settings"),
  ]);

  const lateFeeConfig = school?.settings?.lateFee || {};
  const now = new Date();
  const sessionMonths = generateSessionMonths(school?.settings?.sessionStartMonth || "April", parseInt(targetYear.slice(0, 4), 10) || now.getFullYear());
  const applicableMonths = filterMonthsByAdmission(sessionMonths, student.admissionDate);

  const paidMap = new Map<string, IFeePayment>();
  for (const p of payments) {
    if (p.status === "paid" && p.feeStructure) {
      paidMap.set(`${String(p.feeStructure)}|${p.month || "one-time"}`, p);
    }
  }

  let totalBalance = 0;

  const buildStatus = (fs: IFeeStructure, month: string, concessionAmt: number): FeeHeadMonthRow => {
    const key = `${String(fs._id)}|${month}`;
    const paid = paidMap.get(key) || null;
    const dueDate = dueDateForMonth(fs.dueDate, month);
    const upcoming = !paid && month !== "one-time" && isMonthUpcoming(fs.dueDate, month, now);
    const projectedLateFee = paid || upcoming || fs.frequency !== "monthly" ? 0 : calcProjectedLateFee(lateFeeConfig, fs.amount, dueDate);
    const balance = paid
      ? Math.max(0, paid.amount - paid.paidAmount)
      : upcoming
        ? 0
        : Math.max(0, fs.amount + projectedLateFee - concessionAmt);
    totalBalance += balance;
    return {
      month,
      paid: !!paid,
      upcoming,
      dueDate,
      amount: paid ? paid.amount : fs.amount + projectedLateFee,
      paidAmount: paid ? paid.paidAmount : 0,
      lateFee: paid ? paid.lateFee : projectedLateFee,
      concession: paid ? paid.concession || 0 : concessionAmt,
      balance,
      paymentId: paid ? paid._id : null,
      receiptNo: paid ? paid.receiptNo : null,
      paidDate: paid ? paid.paidDate : null,
      paymentMode: paid ? paid.paymentMode : null,
    };
  };

  const feeHeads: FeeHeadWithBalance[] = structures.map((fs) => {
    const headCons = concessions.filter((c) => !c.feeStructure || String(c.feeStructure) === String(fs._id));

    let monthStatus: FeeHeadMonthRow[];
    if (fs.frequency === "one-time") {
      const applicable = headCons.find((c) => concessionAppliesToMonth(c, "one-time"));
      const concessionAmt = applicable ? concessionAmount(fs.amount, applicable) : 0;
      monthStatus = [buildStatus(fs, "one-time", concessionAmt)];
    } else if (fs.frequency === "yearly") {
      const dueMonth = fs.dueDate
        ? `${new Date(fs.dueDate).getFullYear()}-${String(new Date(fs.dueDate).getMonth() + 1).padStart(2, "0")}`
        : applicableMonths[0] || `${now.getFullYear()}-04`;
      const applicable = headCons.find((c) => concessionAppliesToMonth(c, dueMonth));
      const concessionAmt = applicable ? concessionAmount(fs.amount, applicable) : 0;
      monthStatus = [buildStatus(fs, dueMonth, concessionAmt)];
    } else {
      const targetMonths = resolveFeeMonths(fs.frequency, applicableMonths, sessionMonths, fs.dueDate);
      let oneTimeConUsed = false;
      monthStatus = targetMonths.map((month) => {
        const applicable = headCons.find((c) => {
          if (!concessionAppliesToMonth(c, month)) return false;
          if (c.duration === "one-time") {
            if (oneTimeConUsed) return false;
            oneTimeConUsed = true;
          }
          return true;
        });
        const concessionAmt = applicable ? concessionAmount(fs.amount, applicable) : 0;
        return buildStatus(fs, month, concessionAmt);
      });
    }

    const displayConcession = headCons.find((c) => c.duration !== "one-time" || !(c.appliedMonths && c.appliedMonths.length > 0));

    return {
      _id: fs._id,
      title: fs.title,
      amount: fs.amount,
      frequency: fs.frequency,
      dueDate: fs.dueDate,
      concession: displayConcession
        ? { type: displayConcession.type, value: displayConcession.value, isPct: displayConcession.isPct, duration: displayConcession.duration }
        : null,
      months: monthStatus,
    };
  });

  return {
    student: { _id: student._id, name: student.name, class: student.class, section: student.section },
    feeHeads,
    lateFeeConfig,
    totalBalance,
    targetYear,
    isPastYear,
  };
}

export interface OutstandingYear {
  year: string;
  balance: number;
}

// Every past year (school.settings.pastAcademicYears) with a student-level
// balance still > 0 -- the single rule both the Student Lookup/Parent Fees
// banners and the pay-multi payment gate consult, so "has this student
// cleared every past year" is never computed two different ways.
export async function getOutstandingPastYears(schoolId: string, studentId: string, currentYear: string): Promise<OutstandingYear[]> {
  const school = await Admin.findById(schoolId).select("settings.pastAcademicYears").lean();
  const pastYears: string[] = (school?.settings?.pastAcademicYears || []).filter((y: string) => y && y !== currentYear);
  if (pastYears.length === 0) return [];

  const results: OutstandingYear[] = [];
  for (const year of pastYears) {
    const { totalBalance } = await computeFeeHeadsForStudent(schoolId, studentId, year, currentYear);
    if (totalBalance > 0) results.push({ year, balance: totalBalance });
  }
  // Oldest first (pastAcademicYears is stored most-recent-first, see
  // $position: 0 in POST /api/school/year-switch) -- callers that only need
  // "the one to clear next" read results[0].
  return results.reverse();
}
