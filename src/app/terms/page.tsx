import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Link — Please read these terms before using our platform.",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: August 17, 2026
          </p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground/90 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Link (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not access or use the Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Link is a modern link management, organization, and sharing platform. We provide tools to store, organize into categories and tags, and share digital bookmarks and content links.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. User Accounts & Security</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the security of your account, including passkeys and magic link credentials. You agree to notify us immediately of any unauthorized access to or use of your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Acceptable Use</h2>
            <p className="text-muted-foreground">
              You agree not to use the Service for any unlawful purpose, to distribute malicious software or spam, or to store links to illegal content. We reserve the right to suspend or terminate accounts that violate these rules.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, trademarks, and code comprising the Service remain the exclusive property of Link. You retain ownership of the links and metadata you submit to the Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              The Service is provided &quot;as is&quot; without warranties of any kind. Link shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to update these terms at any time. Continued use of the Service following modifications indicates your acceptance of the updated terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at support@id0.uk.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
