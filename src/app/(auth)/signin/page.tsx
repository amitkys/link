import type { Metadata } from "next";
import { Suspense } from "react";
import { SigninForm } from "./_components/main";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Link account to manage and organize your links.",
};

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pb-20 sm:pb-24">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <Suspense fallback={null}>
            <SigninForm />
          </Suspense>
        </div>

        {/* Footer legal */}
        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-muted-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-muted-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
