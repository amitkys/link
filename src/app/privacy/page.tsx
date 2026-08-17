import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Link — How we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft className="size-4" />
            Back to Sign In
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: August 17, 2026
          </p>
        </div>

        {/* Privacy Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground/90 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect minimal information necessary to deliver the Service:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Account Data:</strong> Email address provided during sign in or magic link requests.</li>
              <li><strong>Authentication Data:</strong> Passkey public keys and WebAuthn device identifiers (we never store private keys or biometrics).</li>
              <li><strong>User Content:</strong> Bookmarks, links, titles, category structures, and tags created in your account.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              Your information is used strictly to provide, maintain, and secure your account. We do not sell your personal data to advertisers or third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Security & Storage</h2>
            <p className="text-muted-foreground">
              We employ industry-standard encryption and security measures. Passkey authentications are cryptographically signed using WebAuthn standards, preventing password intercept attacks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Cookies & Session Storage</h2>
            <p className="text-muted-foreground">
              We use essential HTTP cookies solely for session management, authentication security, and WebAuthn challenge verification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Third-Party Service Providers</h2>
            <p className="text-muted-foreground">
              We use reliable third-party infrastructure to operate Link:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Resend:</strong> For delivering transactional sign-in magic links.</li>
              <li><strong>Upstash Redis:</strong> For secure session caching and rate-limiting.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Your Rights & Data Control</h2>
            <p className="text-muted-foreground">
              You retain full control over your data. You may delete saved links, categories, or passkeys at any time directly within your account settings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions or concerns regarding this Privacy Policy, please contact us at support@id0.uk.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
