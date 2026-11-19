import crypto from "crypto";
import type { IAdmin } from "@/models/Admin";

// Razorpay Route-specific calls, deliberately isolated in this one file so
// that a post-credentials sandbox re-check (see createLinkedAccount's own
// comment) never has to touch the schema, routes, UI, or webhook logic that
// depend on it -- only this file's internals.

const ROUTE_API_BASE = "https://api.razorpay.com/v2";

function routeAuthHeader(): string {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new Error("Razorpay not configured.");
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

// Creates a Route "Linked Account" for a school and requests hosted
// onboarding, so the school's bank/KYC details are entered on Razorpay's
// own page -- never collected by this platform.
//
// IMPORTANT: this call is written against Razorpay's documented Route
// Accounts API (POST /v2/accounts, then requesting the "route" product),
// but has never been run against a real account -- Route isn't enabled on
// any account available to this codebase yet. The exact field Razorpay
// returns the hosted onboarding link under is the one real unknown here;
// this function checks every plausible field name and throws a clear,
// specific error if none match, rather than silently returning a wrong
// URL. The FIRST thing to do once sandbox credentials arrive is call this
// function once, log the raw response, and fix the extraction below if it
// throws -- everything else in this feature (schema, routes, UI, webhook
// signature verification) does not depend on this detail and needs no
// changes either way.
export async function createLinkedAccount(school: Pick<IAdmin, "_id" | "schoolName" | "schoolEmail" | "email" | "schoolPhone" | "phone">): Promise<{ accountId: string; onboardingUrl: string }> {
  const email = school.schoolEmail || school.email;
  const phone = (school.schoolPhone || school.phone || "").replace(/[\s\-+]/g, "");

  const accountRes = await fetch(`${ROUTE_API_BASE}/accounts`, {
    method: "POST",
    headers: { Authorization: routeAuthHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      phone,
      type: "route",
      reference_id: `school_${String(school._id)}`,
      legal_business_name: school.schoolName,
      business_type: "partnership",
      contact_name: school.schoolName,
      profile: {
        category: "education",
        subcategory: "school",
      },
    }),
  });
  const accountData = await accountRes.json();
  if (!accountRes.ok) {
    throw new Error(accountData?.error?.description || "Failed to create Razorpay linked account.");
  }
  const accountId: string = accountData.id;
  if (!accountId) throw new Error("Razorpay did not return an account id.");

  // Request the "route" product + hosted onboarding for this account.
  const productRes = await fetch(`${ROUTE_API_BASE}/accounts/${accountId}/products`, {
    method: "POST",
    headers: { Authorization: routeAuthHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      product_name: "route",
      tnc_accepted: true,
    }),
  });
  const productData = await productRes.json();
  if (!productRes.ok) {
    throw new Error(productData?.error?.description || "Failed to request the Route product for this account.");
  }

  const onboardingUrl: string | undefined =
    productData?.hosted_onboarding_url ||
    productData?.onboarding_url ||
    productData?.requirements?.[0]?.onboarding_url ||
    productData?.active_configuration?.settlements?.onboarding_url;
  if (!onboardingUrl) {
    throw new Error(
      "Razorpay did not return a hosted onboarding link in the expected field -- check the raw response shape (see this function's own comment) and fix the extraction.",
    );
  }

  return { accountId, onboardingUrl };
}

// Stable, documented part of Razorpay's API: every webhook request carries
// an X-Razorpay-Signature header, which is an HMAC-SHA256 of the exact raw
// request body using a secret set when the webhook URL is registered in
// the Razorpay dashboard (RAZORPAY_WEBHOOK_SECRET -- separate from the API
// key secret). Verify against the RAW body string, never the parsed JSON,
// since re-serializing JSON can change byte-for-byte formatting and break
// the signature.
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}
