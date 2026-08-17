import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AddPasskeyForm } from "./_components/main";

export const metadata: Metadata = {
  title: "Set up a Passkey",
  description: "Sign in faster using Face ID, Touch ID, or your device PIN.",
};

export default async function AddPasskeyPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="w-full max-w-lg">
        <AddPasskeyForm userEmail={session.user.email} />
      </div>
    </div>
  );
}
