"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Search, History, AlertTriangle, CreditCard, Loader2, IndianRupee, CheckCircle2, Check,
} from "lucide-react";
import { getToken } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";
import { Combobox, ComboboxInputGroup, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxItem } from "@/components/ui/combobox";

type PaymentMode = "cash" | "online" | "cheque" | "dd";

interface MonthRow {
  month: string; paid: boolean; upcoming: boolean; amount: number; paidAmount: number;
  lateFee: number; concession: number; balance: number;
  receiptNo?: string | null; paidDate?: string | null; paymentMode?: string | null;
}
interface FeeHead {
  _id: string; title: string; amount: number; frequency: string;
  concession: { type: string; value: number; isPct: boolean } | null;
  months: MonthRow[];
}
interface OutstandingYear { year: string; balance: number }
interface StudentOption { _id: string; name: string; class: string; section: string; studentId: string; isActive?: boolean }

interface StudentsResponse { success: boolean; data: StudentOption[] }
interface FeeStatusResponse {
  success: boolean;
  data: {
    feeHeads: FeeHead[]; totalBalance: number; targetYear: string; isPastYear: boolean;
    message?: string; outstandingPastYears: OutstandingYear[];
  };
}
interface BrandingResponse { success: boolean; data: { settings?: { academicYear?: string; pastAcademicYears?: string[] } } }
interface PayMultiResponse { success: boolean; message?: string; data: { summary: { count: number } } }

const fmt = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function monthLabel(m: string) {
  if (m === "one-time") return "One-time";
  const [y, mo] = m.split("-");
  return `${MONTHS[parseInt(mo, 10) - 1]} ${y}`;
}

// Same order-lock rule as CollectFeeTab/ParentFeesTab (ported, not shared,
// since those are separate well-tested surfaces): a later unpaid month
// can't be selected while an earlier unpaid one is neither paid nor also
// selected in this same pass.
function isMonthLocked(sorted: MonthRow[], month: string, selected: Record<string, boolean>) {
  const firstUnpaidIdx = sorted.findIndex((m) => !m.paid);
  if (firstUnpaidIdx < 0) return false;
  const idx = sorted.findIndex((m) => m.month === month);
  if (sorted[idx]?.paid || idx === firstUnpaidIdx) return false;
  for (let i = firstUnpaidIdx; i < idx; i++) {
    if (!sorted[i].paid && !selected[sorted[i].month]) return true;
  }
  return false;
}

// Admin/staff-facing "browse any student's fee record across every
// educational year, and collect whatever's still outstanding" -- the real
// collection path (student-status + pay-multi), not the read-only Reports
// ledger, so a past year's unpaid fee stays payable after a year switch.
export default function StudentLookupTab({ canCollect }: { canCollect: boolean }) {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [pastYears, setPastYears] = useState<string[]>([]);
  const [year, setYear] = useState("");
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [outstandingPastYears, setOutstandingPastYears] = useState<OutstandingYear[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<Record<string, Record<string, boolean>>>({});
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [remarks, setRemarks] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiGet<StudentsResponse>("/students", token).then((res) => setStudents(res.data.filter((s) => s.isActive !== false))).catch(() => {});
    apiGet<BrandingResponse>("/school/branding", token)
      .then((res) => {
        setCurrentYear(res.data.settings?.academicYear || "");
        setPastYears(res.data.settings?.pastAcademicYears || []);
      })
      .catch(() => {});
  }, []);

  const load = (studentId: string, targetYear: string) => {
    const token = getToken();
    if (!token || !studentId) return;
    setLoading(true);
    const qs = targetYear ? `?academicYear=${encodeURIComponent(targetYear)}` : "";
    apiGet<FeeStatusResponse>(`/fees/student-status/${studentId}${qs}`, token)
      .then((res) => {
        setFeeHeads(res.data.feeHeads || []);
        setOutstandingPastYears(res.data.outstandingPastYears || []);
        setMessage(res.data.message || "");
        setSelectedMonths({});
      })
      .catch(() => toast.error("Failed to load fee data"))
      .finally(() => setLoading(false));
  };

  const selectStudent = (studentId: string) => {
    setSelectedStudent(studentId);
    setYear("");
    if (studentId) load(studentId, "");
    else { setFeeHeads([]); setOutstandingPastYears([]); setMessage(""); }
  };

  const changeYear = (y: string) => {
    setYear(y);
    if (selectedStudent) load(selectedStudent, y);
  };

  const toggleMonth = (feeHeadId: string, month: string) => {
    setSelectedMonths((prev) => {
      const fh = feeHeads.find((f) => f._id === feeHeadId);
      if (!fh) return prev;
      const current = prev[feeHeadId] || {};
      const sorted = [...fh.months].sort((a, b) => a.month.localeCompare(b.month));
      if (isMonthLocked(sorted, month, current) && !current[month]) return prev;
      const newSel = { ...current, [month]: !current[month] };
      // Unselecting an earlier month must also drop every later selection
      // that depended on it, same rule CollectFeeTab enforces.
      if (!newSel[month]) {
        const idx = sorted.findIndex((m) => m.month === month);
        for (let i = idx + 1; i < sorted.length; i++) delete newSel[sorted[i].month];
      }
      return { ...prev, [feeHeadId]: newSel };
    });
  };

  const isCurrentYear = !year || year === currentYear;
  const blocked = isCurrentYear && outstandingPastYears.length > 0;

  const selectedItems: { feeStructureId: string; months: string[] }[] = [];
  let total = 0;
  for (const fh of feeHeads) {
    const months = Object.entries(selectedMonths[fh._id] || {}).filter(([, v]) => v).map(([k]) => k);
    if (months.length === 0) continue;
    selectedItems.push({ feeStructureId: fh._id, months });
    for (const m of months) {
      const row = fh.months.find((x) => x.month === m);
      if (row) total += row.balance;
    }
  }

  const handleCollect = async () => {
    if (!selectedStudent || selectedItems.length === 0) return;
    const token = getToken();
    if (!token) return;
    setPaying(true);
    try {
      const res = await apiPost<PayMultiResponse>("/fees/pay-multi", { studentId: selectedStudent, items: selectedItems, paymentMode, remarks }, token);
      toast.success(`Payment recorded! ${res.data.summary.count} month(s) collected.`);
      setRemarks("");
      load(selectedStudent, year);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const getStudentLabel = (s: StudentOption) => `${s.name} — Class ${s.class}-${s.section} (${s.studentId})`;
  const selectedStudentData = students.find((s) => s._id === selectedStudent);
  const isRestingSelectedLabel = !!selectedStudentData && studentQuery === getStudentLabel(selectedStudentData);
  const filteredStudents = students
    .filter((s) => {
      if (!studentQuery || isRestingSelectedLabel) return true;
      const q = studentQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> Student Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Combobox<StudentOption | null>
              items={filteredStudents}
              value={selectedStudentData || null}
              onValueChange={(v) => selectStudent(v?._id || "")}
              itemToStringLabel={(s) => (s ? getStudentLabel(s) : "")}
              isItemEqualToValue={(a, b) => a?._id === b?._id}
              inputValue={studentQuery}
              onInputValueChange={(v) => setStudentQuery(v)}
            >
              <ComboboxInputGroup className="w-full sm:w-80">
                <ComboboxInput placeholder="Search any student by name or ID..." />
              </ComboboxInputGroup>
              <ComboboxContent>
                <ComboboxEmpty>No student found.</ComboboxEmpty>
                {filteredStudents.map((s) => (
                  <ComboboxItem key={s._id} value={s}>
                    <Check className={`size-4 ${selectedStudent === s._id ? "opacity-100" : "opacity-0"}`} />
                    {getStudentLabel(s)}
                  </ComboboxItem>
                ))}
              </ComboboxContent>
            </Combobox>

            {selectedStudent && pastYears.length > 0 && (
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <Select value={year || "current"} onValueChange={(v) => changeYear(v === "current" || !v ? "" : v)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">{currentYear || "Current"} (current)</SelectItem>
                    {pastYears.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedStudent && outstandingPastYears.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{fmt(outstandingPastYears[0].balance)} pending from {outstandingPastYears[0].year}. Clear it before this student&apos;s current-year fees become payable.</span>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-amber-800 hover:bg-amber-100 dark:text-amber-400" onClick={() => changeYear(outstandingPastYears[0].year)}>
            Go to {outstandingPastYears[0].year}
          </Button>
        </div>
      )}

      {selectedStudent && loading && <PageLoader compact label="Loading fee record..." />}

      {selectedStudent && !loading && feeHeads.length === 0 && (
        <EmptyState icon={Search} message={message || "No fee structures found for this student."} />
      )}

      {selectedStudent && !loading && feeHeads.length > 0 && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {feeHeads.map((fh) => {
              const sorted = [...fh.months].sort((a, b) => a.month.localeCompare(b.month));
              const sel = selectedMonths[fh._id] || {};
              return (
                <div key={fh._id} className="overflow-hidden rounded-[18px] bg-card shadow-[0_0_0_1px_rgba(15,23,42,0.07)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{fh.title}</h3>
                      <p className="text-xs text-muted-foreground">₹{fh.amount} · {fh.frequency}</p>
                    </div>
                    {fh.concession && (
                      <Badge className="border-0 bg-green-100 text-green-700">
                        {fh.concession.isPct ? `${fh.concession.value}% off` : `₹${fh.concession.value} off`}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-4">
                    {sorted.map((m) => {
                      const locked = !m.paid && isMonthLocked(sorted, m.month, sel);
                      const selected = !!sel[m.month];
                      const disabled = m.paid || locked || !canCollect || (blocked && isCurrentYear);
                      return (
                        <button
                          key={m.month}
                          type="button"
                          onClick={() => !disabled && toggleMonth(fh._id, m.month)}
                          disabled={disabled}
                          title={locked ? "Pay the earlier month(s) first." : blocked ? "Clear past-year dues first." : undefined}
                          className={`rounded-lg border p-2 text-center text-xs transition-all ${
                            m.paid
                              ? "cursor-not-allowed border-green-200 bg-green-50 text-green-700"
                              : locked || (blocked && isCurrentYear)
                                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                                : selected
                                  ? "border-primary bg-primary/10 font-semibold text-primary"
                                  : m.upcoming
                                    ? "border-blue-100 bg-blue-50/50 text-blue-500"
                                    : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          <p className="font-medium">{monthLabel(m.month)}</p>
                          {m.paid ? (
                            <Check className="mx-auto mt-1 h-3 w-3 text-green-600" />
                          ) : (
                            <>
                              <p className="mt-0.5">{fmt(m.balance)}</p>
                              {m.upcoming && <p className="text-[9px] text-blue-400">Upcoming</p>}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-4">
            <div className="overflow-hidden rounded-[18px] bg-card shadow-[0_0_0_1px_rgba(15,23,42,0.07)]">
              <div className="flex items-center gap-2.5 border-b border-border p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-semibold text-foreground">{canCollect ? "Collect Fee" : "Fee Summary"}</h3>
              </div>
              <div className="space-y-4 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Outstanding this year</span>
                  <span className="font-semibold">{fmt(feeHeads.reduce((s, fh) => s + fh.months.reduce((ms, m) => ms + m.balance, 0), 0))}</span>
                </div>
                {canCollect && (
                  <>
                    <div className="flex justify-between border-t border-border pt-3 text-sm">
                      <span className="font-semibold">Selected</span>
                      <span className="text-lg font-bold">{fmt(total)}</span>
                    </div>
                    <Select value={paymentMode} onValueChange={(v) => setPaymentMode((v || paymentMode) as PaymentMode)}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="dd">DD</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea placeholder="Remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="resize-y" />
                    <Button className="w-full gap-2" onClick={handleCollect} disabled={paying || selectedItems.length === 0 || (blocked && isCurrentYear)}>
                      {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <IndianRupee className="h-4 w-4" />}
                      {paying ? "Processing..." : `Collect ${fmt(total)}`}
                    </Button>
                    {blocked && isCurrentYear && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Clear past-year dues first — see the banner above.
                      </p>
                    )}
                    {!blocked && selectedItems.length > 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Ready to collect.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
