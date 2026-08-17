import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ThroughPasskeyForm } from "./_components/main";

export const metadata: Metadata = {
  title: "Choose Passkey",
  description: "Select a passkey to continue or manage your registered passkeys.",
};

export default async function ThroughPasskeyPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="w-full max-w-lg">
        <ThroughPasskeyForm userEmail={session.user.email} />
      </div>
    </div>
  );
}
