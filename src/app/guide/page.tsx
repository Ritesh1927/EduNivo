import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "@/components/marketing/marketing.css";
import {
  BookOpen, CalendarCheck, CheckCircle2, ClipboardList, CreditCard, GraduationCap, IndianRupee, Landmark, Lock,
  LogIn, MessageSquare, Receipt, RefreshCw, School, Settings, ShieldCheck, Timer, UserPlus, Users, Wallet, XCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/CtaAndFooter";
import { Eyebrow, GradientText } from "@/components/marketing/ui";
import { BRAND } from "@/components/marketing/content";
import { FlowChart, DecisionFlow } from "@/components/guide/Flow";

export const metadata: Metadata = {
  title: `User Guide · ${BRAND.name}`,
  description: `How ${BRAND.name} works, step by step, for super admins, school admins, teachers and parents.`,
};

const TOC = [
  { id: "overview", label: "How it fits together" },
  { id: "roles", label: "Roles at a glance" },
  { id: "super-admin", label: "Super Admin" },
  { id: "setup", label: "School Admin: setup" },
  { id: "daily", label: "School Admin: daily work" },
  { id: "fees", label: "Fees & payments" },
  { id: "year", label: "The educational year" },
  { id: "past-dues", label: "Past-year fees rule" },
  { id: "teacher", label: "Teacher" },
  { id: "parent", label: "Parent" },
  { id: "faq", label: "FAQ" },
];

export default function GuidePage() {
  return (
    <div className="ms-landing min-h-screen bg-[#F8F8FE] font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <header className="mx-auto max-w-3xl text-center">
            <Eyebrow className="mx-auto">User Guide</Eyebrow>
            <h1 className="mt-4 font-heading text-[32px] leading-[1.15] font-extrabold tracking-tight sm:text-[44px]">
              How {BRAND.name} works, <GradientText>step by step</GradientText>
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
              Find your role below and follow the flowcharts. Each one shows what to do, in order, and what happens next.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                { href: "#super-admin", label: "I'm a Super Admin" },
                { href: "#setup", label: "I'm a School Admin" },
                { href: "#teacher", label: "I'm a Teacher" },
                { href: "#parent", label: "I'm a Parent" },
              ].map((c) => (
                <a key={c.href} href={c.href} className="rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-primary ring-1 ring-primary/25 transition-colors hover:bg-primary/10">
                  {c.label}
                </a>
              ))}
            </div>
          </header>

          <div className="mt-14 grid gap-10 xl:grid-cols-[220px_1fr]">
            <nav aria-label="Guide contents" className="hidden xl:block">
              <div className="sticky top-28 rounded-2xl bg-white p-4 ring-1 ring-foreground/[0.06]">
                <p className="px-2 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">On this page</p>
                <ul className="mt-2 space-y-0.5">
                  {TOC.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="block rounded-lg px-2 py-1.5 text-[13.5px] text-foreground/75 transition-colors hover:bg-primary/10 hover:text-primary">
                        {t.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div className="min-w-0 space-y-8">
              <Section id="overview" title="How it fits together" lead="Each role hands off to the next. Super Admin sets a school up, the School Admin runs it, teachers run classes, and parents follow along and pay fees.">
                <FlowChart
                  numbered={false}
                  steps={[
                    { title: "Super Admin", text: "Registers the school, picks its plan and its educational year.", icon: ShieldCheck, tone: "primary" },
                    { title: "School Admin", text: "Sets up classes, staff, students, fees and settings.", icon: School, tone: "primary" },
                    { title: "Teachers & staff", text: "Mark attendance, set homework, enter marks, collect fees.", icon: GraduationCap, tone: "primary" },
                    { title: "Parents", text: "Follow their child's progress and pay fees online.", icon: Users, tone: "good" },
                  ]}
                />
              </Section>

              <Section id="roles" title="Roles at a glance" lead="Everyone logs in at the same Login page. What you see after that depends on your role.">
                <div className="overflow-x-auto rounded-2xl ring-1 ring-foreground/[0.08]">
                  <table className="w-full min-w-[560px] border-collapse bg-white text-left text-[14px]">
                    <thead className="bg-primary/[0.06] text-[13px] text-foreground">
                      <tr>
                        <th className="px-4 py-3 font-bold">Role</th>
                        <th className="px-4 py-3 font-bold">Who</th>
                        <th className="px-4 py-3 font-bold">Main job</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/[0.06] text-muted-foreground">
                      <Row role="Super Admin" who="Platform owner" job="Registers schools, manages plans and licenses, answers support tickets" />
                      <Row role="School Admin" who="Principal or school office" job="Full control of one school: people, academics, fees and settings" />
                      <Row role="Teacher" who="Teaching staff" job="Attendance, homework and exam marks for their own classes" />
                      <Row role="Non-teaching staff" who="Front office, accountant, etc." job="Only the parts the School Admin allows under Roles & Permissions" />
                      <Row role="Parent" who="A student's family" job="Views attendance, homework and progress, and pays fees" />
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section id="super-admin" title="Super Admin: registering a school" lead="A new school goes live in four steps.">
                <FlowChart
                  steps={[
                    { title: "Add the school", text: "Schools → Add School. Enter the school's details and the School Admin's login.", icon: School },
                    { title: "Set the educational year", text: "Pick the session's start month (e.g. April) and its starting year (e.g. 2026-2027).", icon: CalendarCheck, tone: "warn" },
                    { title: "Assign a plan", text: "Choose a plan and any extra users. This becomes the school's license.", icon: CreditCard },
                    { title: "School Admin logs in", text: "They take over from here and set the school up.", icon: LogIn, tone: "good" },
                  ]}
                />
                <Note>
                  The educational year can only be set here, at registration. After that, only the school&apos;s own School Admin can change the start month (Settings → Academic), and the year only moves forward when they switch it.
                </Note>
                <Bullets
                  items={[
                    ["Plans", "Create or edit plans: price per extra user per month, free users included, and features. The public Pricing page always shows the current plans."],
                    ["Tickets", "Answer support requests sent by schools."],
                    ["Login Activity", "See who logged in, and when, across every school."],
                  ]}
                />
              </Section>

              <Section id="setup" title="School Admin: first-time setup" lead="Do these once, in this order. Each step depends on the one before it.">
                <StepGrid
                  steps={[
                    ["School profile", "Settings → School Profile: logo, address, contact details.", Settings],
                    ["Academic settings", "Settings → Academic: grading scale, pass mark, term structure.", BookOpen],
                    ["Classes", "Create every class and section you run, e.g. 5-A and 5-B.", School],
                    ["Staff", "Add teachers and non-teaching staff. Set what each can see in Roles & Permissions.", UserPlus],
                    ["Students & parents", "Add students to their class. Their parents get accounts too.", Users],
                    ["Fee rules", "Settings → Fees: late-fee grace period and charge.", IndianRupee],
                    ["Holidays", "Settings → Holidays: weekly offs and holiday dates.", CalendarCheck],
                    ["Online payments", "Settings → Payments: connect your payout account (see Fees below).", Landmark],
                  ]}
                />
              </Section>

              <Section id="daily" title="School Admin: daily work" lead="Once set up, these are the pages you'll use most.">
                <Bullets
                  items={[
                    ["Students & Classes", "Add or edit students. Move students up a class with Promote on the Classes page."],
                    ["Attendance", "Mark daily attendance by class. Editing a submitted day needs Settings → Academic → Allow Attendance Edit."],
                    ["Exams", "Create tests and scheduled exams, enter marks, publish results. Filter by educational year."],
                    ["Homework & Study Materials", "Set work with due dates and attachments; share notes and files."],
                    ["Timetable", "Build each class's week. Teachers and parents see their own part."],
                    ["Notices & Communication", "Post announcements to the whole school or one class; chat with staff and parents."],
                    ["Reports", "Attendance, academic and fee reports for the whole school."],
                    ["Roles & Permissions", "Decide exactly which pages each staff member can open."],
                  ]}
                />
              </Section>

              <Section id="fees" title="Fees & payments" lead="Fees are set up once per class. Dues are then created for every student automatically.">
                <h3 className="font-heading text-[16px] font-bold">From fee setup to receipt</h3>
                <FlowChart
                  className="mt-3"
                  steps={[
                    { title: "Create fee structure", text: "Fees → Fee Structure. Per class: tuition, transport and so on, charged monthly, quarterly, yearly or once.", icon: ClipboardList },
                    { title: "Dues appear", text: "Every student in that class now has those fees pending.", icon: Timer, tone: "warn" },
                    { title: "Fee is paid", text: "At the office (Collect Fee: cash, cheque, DD) or online by the parent.", icon: Wallet },
                    { title: "Receipt & reports", text: "A receipt is issued and the payment shows in Reports.", icon: Receipt, tone: "good" },
                  ]}
                />

                <h3 className="mt-8 font-heading text-[16px] font-bold">Turning on online payments (one time)</h3>
                <FlowChart
                  className="mt-3"
                  steps={[
                    { title: "Connect payout account", text: "Settings → Payments → Connect. Opens Razorpay's own secure page.", icon: Landmark },
                    { title: "Enter bank details on Razorpay", text: "Your bank details go to Razorpay only. EduNivo never sees them.", icon: Lock },
                    { title: "Status: Pending", text: "Razorpay verifies your details.", icon: Timer, tone: "warn" },
                    { title: "Status: Active", text: "Parents can now pay online. Money goes straight to your bank.", icon: CheckCircle2, tone: "good" },
                  ]}
                />
                <Note>Until the status shows Active, parents can&apos;t pay online. The office can still collect fees in person at any time.</Note>

                <Bullets
                  items={[
                    ["Concessions", "Give a student a discount on one or all fee heads."],
                    ["Student Lookup", "Search any student, pick any educational year, see what they owe, and collect it."],
                    ["Reports", "Collection, outstanding dues, class-wise totals, and a full ledger per student per year."],
                  ]}
                />
              </Section>

              <Section id="year" title="The educational year" lead="Every school runs on a fixed year, for example April 2026 to March 2027. The School Admin must switch to the next year before the last day.">
                <DecisionFlow
                  before={[
                    { title: "Year runs normally", text: "Use everything as usual.", icon: CalendarCheck },
                    { title: "Countdown starts", text: "2 weeks before the last day, a banner on the School Admin's dashboard counts down the days.", icon: Timer, tone: "warn" },
                  ]}
                  question="Did the School Admin switch the year before the last day?"
                  yes={[
                    { title: "Next year begins", text: "Same start month, year + 1. Everything keeps working.", icon: CheckCircle2, tone: "good" },
                  ]}
                  no={[
                    { title: "All changes freeze", text: "Nobody can add, edit or delete anything. Viewing still works.", icon: Lock, tone: "bad" },
                    { title: "School Admin switches", text: "Settings → Academic → Switch Educational Year.", icon: RefreshCw },
                    { title: "Next year begins", text: "The freeze lifts at once.", icon: CheckCircle2, tone: "good" },
                  ]}
                  footnote="This repeats every year."
                />

                <h3 className="mt-10 font-heading text-[16px] font-bold">What a year switch does</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="flex items-center gap-2 font-heading font-bold text-red-800"><XCircle className="h-4.5 w-4.5" /> Cleared for the old year</p>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] text-red-900/80">
                      <li>Homework and study materials</li>
                      <li>Notices</li>
                      <li>Standalone tests and their results</li>
                      <li>Daily attendance (kept as one yearly % per student)</li>
                      <li>Leaderboard points</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <p className="flex items-center gap-2 font-heading font-bold text-emerald-800"><CheckCircle2 className="h-4.5 w-4.5" /> Always kept</p>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] text-emerald-900/80">
                      <li>Every fee record, paid or unpaid</li>
                      <li>Students, staff, parents and classes</li>
                      <li>Scheduled exams and report history</li>
                      <li>Each student&apos;s yearly attendance %</li>
                    </ul>
                  </div>
                </div>
                <Note>Switching can&apos;t be undone, so finish all edits for the year first. After switching, move students up from Classes → Promote. During the switch you can also allow class teachers to promote their own classes.</Note>
              </Section>

              <Section id="past-dues" title="The past-year fees rule" lead="Unpaid fees never disappear when the year changes. They must be cleared before this year's fees can be paid.">
                <DecisionFlow
                  question="Does the student owe anything from a past year?"
                  yes={[
                    { title: "A banner shows the old balance", text: "On Student Lookup (office) and on the parent's Fees page.", icon: Timer, tone: "warn" },
                    { title: "Pay the past year first", text: "Pick that year in the year selector and pay or collect it.", icon: Wallet },
                    { title: "This year's fees unlock", text: "Current-year payment is allowed again.", icon: CheckCircle2, tone: "good" },
                  ]}
                  noLabel="No"
                  no={[
                    { title: "Pay this year's fees as normal", icon: CheckCircle2, tone: "good" },
                  ]}
                />
              </Section>

              <Section id="teacher" title="Teacher: a typical day" lead="You only see your own classes and subjects.">
                <FlowChart
                  steps={[
                    { title: "Check timetable", text: "See today's classes.", icon: CalendarCheck },
                    { title: "Mark attendance", text: "For each class you teach.", icon: ClipboardList },
                    { title: "Set or grade homework", text: "Add due dates and attachments.", icon: BookOpen },
                    { title: "Enter exam marks", text: "For tests you're responsible for.", icon: GraduationCap },
                    { title: "Message parents", text: "Through Communication.", icon: MessageSquare, tone: "good" },
                  ]}
                />
                <Note>Missing a page in your menu? Your School Admin controls what each teacher can open, under Roles & Permissions.</Note>
              </Section>

              <Section id="parent" title="Parent: following your child and paying fees" lead="With more than one child at the school, use the switcher at the top to change child.">
                <FlowChart
                  steps={[
                    { title: "Open Overview", text: "Attendance, homework and fees at a glance.", icon: Users },
                    { title: "Check progress", text: "Attendance, homework, exams and timetable.", icon: GraduationCap },
                    { title: "Open Fees", text: "See what's due this month.", icon: IndianRupee },
                    { title: "Pay online", text: "Choose months, then pay through Razorpay.", icon: CreditCard },
                    { title: "Get your receipt", text: "Download it any time from Payment History.", icon: Receipt, tone: "good" },
                  ]}
                />
                <Note>If a past year&apos;s fee is unpaid, you&apos;ll see a banner. Pay that first using the year selector on the Fees page.</Note>
              </Section>

              <Section id="faq" title="Frequently asked questions">
                <div className="space-y-3">
                  <Faq q="Nobody can add or edit anything any more. Why?">
                    The educational year has ended without being switched. The School Admin should go to Settings → Academic → Switch Educational Year. Everything works again straight away. Viewing data is never blocked.
                  </Faq>
                  <Faq q="A parent can't pay this year's fee. Why?">
                    They still owe money from a past year. Open Fees → Student Lookup, find the student, and collect the old balance first.
                  </Faq>
                  <Faq q={"It says \"Online payments aren't set up for this school yet.\""}>
                    The school hasn&apos;t finished connecting its payout account. School Admin: Settings → Payments.
                  </Faq>
                  <Faq q="A teacher can't see a page they need.">
                    The School Admin can turn it on under Roles & Permissions.
                  </Faq>
                  <Faq q="Who do I contact for help?">
                    Use the Report a Bug button inside the app, or our <Link href="/contact" className="font-medium text-primary underline underline-offset-2">Contact page</Link>. Policies: <Link href="/terms" className="font-medium text-primary underline underline-offset-2">Terms</Link>, <Link href="/privacy" className="font-medium text-primary underline underline-offset-2">Privacy</Link>, <Link href="/refund-policy" className="font-medium text-primary underline underline-offset-2">Refunds</Link>.
                  </Faq>
                </div>
              </Section>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-[22px] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_40px_-24px_rgba(80,72,229,0.28)] ring-1 ring-foreground/[0.06] sm:p-8">
      <h2 className="font-heading text-[22px] font-extrabold tracking-tight text-foreground sm:text-[26px]">{title}</h2>
      {lead && <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">{lead}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Row({ role, who, job }: { role: string; who: string; job: string }) {
  return (
    <tr>
      <td className="px-4 py-3 font-semibold text-foreground">{role}</td>
      <td className="px-4 py-3">{who}</td>
      <td className="px-4 py-3">{job}</td>
    </tr>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 rounded-xl border-l-4 border-primary bg-primary/[0.05] px-4 py-3 text-[14px] leading-relaxed text-foreground/80">{children}</p>
  );
}

function Bullets({ items }: { items: [string, string][] }) {
  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map(([title, text]) => (
        <li key={title} className="rounded-xl bg-[#F8F8FE] p-4 ring-1 ring-foreground/[0.05]">
          <p className="font-heading text-[14.5px] font-bold text-foreground">{title}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{text}</p>
        </li>
      ))}
    </ul>
  );
}

function StepGrid({ steps }: { steps: [string, string, typeof School][] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(([title, text, Icon], i) => (
        <li key={title} className="relative rounded-2xl border border-foreground/10 bg-white p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-[13px] font-bold text-white">{i + 1}</span>
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <p className="mt-3 font-heading text-[15px] font-bold text-foreground">{title}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{text}</p>
        </li>
      ))}
    </ol>
  );
}

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl bg-[#F8F8FE] px-4 py-3 ring-1 ring-foreground/[0.05] open:bg-white open:ring-primary/25">
      <summary className="cursor-pointer list-none font-heading text-[15px] font-bold text-foreground marker:hidden">
        <span className="mr-2 inline-block text-primary transition-transform group-open:rotate-90">›</span>
        {q}
      </summary>
      <p className="mt-2 pl-5 text-[14px] leading-relaxed text-muted-foreground">{children}</p>
    </details>
  );
}
