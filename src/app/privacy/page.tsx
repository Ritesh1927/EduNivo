import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/marketing/LegalPage";
import { BRAND } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: `Privacy Policy · ${BRAND.name}`,
  description: `How ${BRAND.name} collects, uses and protects personal data.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="19 November 2026">
      <LegalSection number={1} title="Scope">
        <p>
          This Privacy Policy explains how {BRAND.name}, operated by {BRAND.legalEntity}, a proprietorship owned by {BRAND.proprietor}{" "}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;), collects, uses, shares and protects personal data through the Platform. It applies to school
          administrators, staff, parents and students whose data is processed on a subscribing school&apos;s behalf, and to
          visitors of this website.
        </p>
        <p>
          A subscribing school remains the <strong>data controller</strong> for its own students&apos;, parents&apos; and
          staff&apos;s records — we act as a <strong>data processor</strong>, handling that data only to provide the Platform to
          the school.
        </p>
      </LegalSection>

      <LegalSection number={2} title="What We Collect">
        <ul>
          <li><strong>Account data:</strong> name, email, phone, role, and login credentials for school admins, teachers, non-teaching staff, parents and students.</li>
          <li><strong>Student records:</strong> admission details, class/section, attendance, academic performance, fee and payment history, and other records a school enters to run its operations.</li>
          <li><strong>Payment data:</strong> fee amounts, payment status and receipts. Card, UPI and bank account details are collected and processed directly by Razorpay, our payment gateway — we never receive or store them.</li>
          <li><strong>Files:</strong> documents, photos and attachments uploaded by schools/staff (e.g. student photos, homework attachments), stored via our cloud storage provider.</li>
          <li><strong>Technical data:</strong> IP address, browser/device information and usage logs, for security and to operate the Platform.</li>
          <li><strong>Website enquiries:</strong> name, email, phone and message when you request a demo, subscribe to updates, or use the contact form.</li>
        </ul>
      </LegalSection>

      <LegalSection number={3} title="How We Use It">
        <ul>
          <li>To provide, maintain and support the Platform for the subscribing school.</li>
          <li>To process online fee payments and send related receipts/notifications.</li>
          <li>To respond to enquiries, demo requests and support requests.</li>
          <li>To send product updates and service communications (and, where you&apos;ve opted in, marketing updates — you can unsubscribe anytime).</li>
          <li>To maintain the security, integrity and proper functioning of the Platform, including detecting abuse.</li>
        </ul>
      </LegalSection>

      <LegalSection number={4} title="Who We Share It With">
        <p>We share personal data only as needed to operate the Platform, with:</p>
        <ul>
          <li><strong>Razorpay</strong> — to process online fee payments and, where applicable, route payments to a school&apos;s own connected payout account.</li>
          <li><strong>Cloud infrastructure and storage providers</strong> — to host the Platform&apos;s database and uploaded files/images.</li>
          <li><strong>Email/SMS/notification providers</strong> — to deliver alerts, receipts and account communications.</li>
          <li>Law enforcement or regulators, where required by law.</li>
        </ul>
        <p>We do not sell personal data to third parties.</p>
      </LegalSection>

      <LegalSection number={5} title="Data Retention">
        <p>
          Data is retained for as long as a school&apos;s subscription is active and for a reasonable period afterward to comply
          with legal, accounting or regulatory requirements, or to resolve disputes. A school admin can request export or deletion
          of their school&apos;s data by contacting us, subject to any legal retention requirements.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Data of Minors">
        <p>
          The Platform necessarily processes data belonging to students who are minors. This is collected by the school (the data
          controller) in the course of normal school administration, and parents/guardians may contact their school, or us, with
          requests regarding their child&apos;s data.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Security">
        <p>
          We use industry-standard safeguards including encryption in transit, role-based access control (so a user only sees data
          relevant to their role), and secure cloud hosting with regular backups. No method of transmission or storage is 100%
          secure, but we work to protect personal data appropriately.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Your Rights">
        <p>
          Depending on your relationship with a school, you may request access to, correction of, or deletion of personal data by
          contacting your school administrator (who controls the underlying records) or us directly at{" "}
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Cookies">
        <p>
          This website and the Platform use essential cookies/local storage to keep you signed in and remember preferences. We do
          not use third-party advertising trackers.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Grievance Officer">
        <p>
          In accordance with the Information Technology Act, 2000 and the Information Technology (Intermediary Guidelines and
          Digital Media Ethics Code) Rules, 2021, the Grievance Officer for privacy-related concerns is:
        </p>
        <p>
          {BRAND.proprietor}
          <br />
          Email: <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          <br />
          Address: {BRAND.address}
        </p>
      </LegalSection>

      <LegalSection number={11} title="Changes to this Policy">
        <p>We may update this Privacy Policy from time to time; material changes will be notified to school administrators.</p>
      </LegalSection>

      <LegalSection number={12} title="Contact">
        <p>
          For any privacy question, write to <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or use our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
