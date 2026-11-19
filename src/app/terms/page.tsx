import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/marketing/LegalPage";
import { BRAND } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: `Terms & Conditions · ${BRAND.name}`,
  description: `Terms and conditions for using ${BRAND.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" lastUpdated="19 November 2026">
      <LegalSection number={1} title="Agreement to these Terms">
        <p>
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern access to and use of {BRAND.name} (the &ldquo;Platform&rdquo;), a school management
          system operated by {BRAND.legalEntity}, a proprietorship owned by {BRAND.proprietor} (GSTIN: {BRAND.gstin}) (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By creating an
          account, accessing, or using the Platform, a school, its staff, parents or students (&ldquo;you&rdquo;, &ldquo;User&rdquo;) agree to be bound by
          these Terms. If you do not agree, do not use the Platform.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Description of Service">
        <p>
          {BRAND.name} is a cloud-based ERP for schools covering admissions, attendance, academics, fee management, examinations,
          timetables, communication and related administrative functions. The Platform is made available to a school on a
          subscription basis; that school in turn invites its own staff, parents and students as Users under its account.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Accounts &amp; Eligibility">
        <ul>
          <li>A school&apos;s administrator is responsible for the accuracy of data entered and for managing access for staff, parents and students under their account.</li>
          <li>Each User is responsible for keeping their login credentials confidential and for all activity under their account.</li>
          <li>You must provide accurate information when creating or updating an account.</li>
        </ul>
      </LegalSection>

      <LegalSection number={4} title="Subscription Fees &amp; Online Fee Payments">
        <p>
          Two separate kinds of payment happen on the Platform, and they are governed differently:
        </p>
        <ul>
          <li><strong>Platform subscription fees</strong> — what a school pays us for use of the Platform, per the plan shown on our <a href="/pricing">Pricing</a> page or as separately agreed.</li>
          <li><strong>School fee payments</strong> — what a parent pays their school (tuition, transport, exam fees, etc.) through the Platform&apos;s integrated payment gateway. We act solely as the technology that facilitates this payment on the school&apos;s behalf; the school, not us, is the recipient of these funds and is responsible for the goods/services the fee relates to. See our <a href="/refund-policy">Refund Policy</a> for how refunds on this category are handled.</li>
        </ul>
      </LegalSection>

      <LegalSection number={5} title="Payment Processing (Razorpay)">
        <p>
          Online fee payments are processed through Razorpay, a third-party licensed payment aggregator/gateway. When you make or
          receive a payment through the Platform, you also agree to Razorpay&apos;s own terms of service and privacy policy. We do
          not store your card, UPI or bank account credentials — these are collected and processed directly by Razorpay.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Acceptable Use">
        <p>You agree not to:</p>
        <ul>
          <li>Use the Platform for any unlawful purpose or to upload false, defamatory or infringing content.</li>
          <li>Attempt to gain unauthorized access to another school&apos;s, user&apos;s or student&apos;s data.</li>
          <li>Reverse-engineer, resell, or use the Platform to build a competing product.</li>
          <li>Interfere with the Platform&apos;s normal operation, including through automated scraping or denial-of-service activity.</li>
        </ul>
      </LegalSection>

      <LegalSection number={7} title="Data &amp; Privacy">
        <p>
          Our collection and use of personal data (including student, parent and staff data) is described in our{" "}
          <a href="/privacy">Privacy Policy</a>, which forms part of these Terms. A school remains the data controller for its own
          students&apos;/parents&apos;/staff&apos;s data; we process it on the school&apos;s behalf to provide the Platform.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Intellectual Property">
        <p>
          The Platform, its software, design and branding are owned by us or our licensors. Subscribing to the Platform grants a
          school a limited, non-exclusive, non-transferable right to use it for its own operations — it does not transfer any
          ownership of the underlying software.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Limitation of Liability">
        <p>
          The Platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the maximum extent permitted by law, we are not
          liable for indirect, incidental or consequential damages arising from use of the Platform, including any dispute between
          a school and a parent/student over fees, admissions or academic matters, which remain the school&apos;s own
          responsibility.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Suspension &amp; Termination">
        <p>
          We may suspend or terminate access to the Platform for a school or User that breaches these Terms, fails to pay
          subscription fees, or where required by law. A school may stop using the Platform by not renewing its subscription;
          relevant data-retention terms are described in the Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Changes to these Terms">
        <p>
          We may update these Terms from time to time. Continued use of the Platform after an update constitutes acceptance of the
          revised Terms. Material changes will be notified to school administrators.
        </p>
      </LegalSection>

      <LegalSection number={12} title="Governing Law">
        <p>
          These Terms are governed by the laws of India, and any dispute is subject to the exclusive jurisdiction of the courts of Delhi.
        </p>
      </LegalSection>

      <LegalSection number={13} title="Contact">
        <p>
          Questions about these Terms can be sent to{" "}
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or via our <a href="/contact">Contact page</a>. Registered address:{" "}
          {BRAND.address}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
