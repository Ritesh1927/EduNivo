import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/marketing/LegalPage";
import { BRAND } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: `Refund Policy · ${BRAND.name}`,
  description: `Refund policy for school fee payments made through ${BRAND.name}.`,
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" lastUpdated="19 November 2026">
      <LegalSection number={1} title="Scope">
        <p>
          This Refund Policy applies specifically to <strong>fee payments made by a parent or student to a school</strong>{" "}
          through the {BRAND.name} Platform&apos;s integrated payment gateway (Razorpay) — for example tuition, transport,
          examination or admission fees. It does not cover a school&apos;s own subscription to the Platform, which is governed
          separately.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Who Decides a Refund">
        <p>
          When a fee payment succeeds, the amount is routed directly to the receiving school&apos;s own connected bank account —
          we do not hold or collect this money ourselves. Because of this, <strong>the decision to approve a fee refund (e.g. for
          an overpayment, an incorrectly charged fee, or a student&apos;s withdrawal) rests with the school</strong>, under its own
          fee policy, not with us. We facilitate the technical processing of a refund once the school authorizes it.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Failed or Duplicate Payments">
        <p>
          If an amount was deducted from a parent&apos;s payment method but the payment doesn&apos;t show as successful on the
          Platform, or the same fee was accidentally charged twice, contact us immediately (see below). We will investigate with
          Razorpay and, where a genuine failed/duplicate transaction is confirmed, coordinate a refund to the original payment
          method. These technical-failure refunds do not require the school&apos;s separate approval, since no fee was actually
          due for the failed/duplicate attempt.
        </p>
      </LegalSection>

      <LegalSection number={4} title="How to Request a Refund">
        <ul>
          <li>For a fee-policy refund (overpayment, withdrawal, incorrect fee): contact your school&apos;s administration office directly — they control the decision and timeline.</li>
          <li>For a failed/duplicate payment: contact us at <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> with the payment date, amount, and the student/receipt details, or use our <a href="/contact">Contact page</a>.</li>
        </ul>
      </LegalSection>

      <LegalSection number={5} title="Refund Timeline">
        <p>
          Once a refund is approved (by the school, or by us for a confirmed technical failure) and initiated through Razorpay,
          it typically reflects in the original payment method within 5–7 business days, depending on the parent&apos;s bank or
          card issuer.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Contact">
        <p>
          Questions about this Refund Policy can be sent to <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or via our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
