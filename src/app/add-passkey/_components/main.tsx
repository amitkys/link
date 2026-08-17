"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { IconFingerprint, IconShieldCheck } from "@tabler/icons-react";
import { toast } from "sonner";

function generatePasskeyName(email: string) {
  const prefix = email.split("@")[0] ?? "passkey";
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${prefix} — ${date}`;
}

export function AddPasskeyForm({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddPasskey() {
    setError(null);
    setLoading(true);

    const { error } = await authClient.passkey.addPasskey({
      name: generatePasskeyName(userEmail),
      extensions: { credProps: true },
    });

    setLoading(false);

    if (error) {
      setError(
        "Couldn't create a passkey on this device. You can add one later from settings."
      );
      return;
    }

    toast.success("Passkey registered successfully!");
    router.push("/home");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconShieldCheck className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Set up a passkey
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Sign in faster next time using Face ID, Touch ID, or your device PIN —
          no more waiting on emails.
        </p>
      </div>

      {/* Action Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-4">
        <Button
          type="button"
          onClick={handleAddPasskey}
          disabled={loading}
          className="h-11 w-full cursor-pointer text-sm font-semibold tracking-wide"
        >
          <LoadingSwap isLoading={loading}>
            <span className="flex items-center justify-center gap-2">
              <IconFingerprint className="size-5" />
              Create a passkey
            </span>
          </LoadingSwap>
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/home")}
          disabled={loading}
          className="w-full text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Skip for now
        </Button>

        {error && (
          <div
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
