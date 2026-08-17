"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  IconFingerprint,
  IconKey,
  IconTrash,
  IconDeviceMobile,
  IconPlus,
  IconArrowRight,
} from "@tabler/icons-react";
import { toast } from "sonner";

function generatePasskeyName(email: string) {
  const prefix = email.split("@")[0] ?? "passkey";
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${prefix} — ${date}`;
}

export function ThroughPasskeyForm({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: passkeys,
    isPending: isLoadingPasskeys,
    refetch,
  } = authClient.useListPasskeys();

  async function handleAddPasskey() {
    setAddingPasskey(true);

    const { error } = await authClient.passkey.addPasskey({
      name: generatePasskeyName(userEmail),
      extensions: { credProps: true },
    });

    setAddingPasskey(false);

    if (error) {
      toast.error(
        "Couldn't create a passkey on this device. Try again or continue without one."
      );
      return;
    }

    toast.success("Passkey registered!");
    refetch();
  }

  async function handleDeletePasskey(id: string) {
    setDeletingId(id);
    try {
      const { error } = await authClient.passkey.deletePasskey({ id });
      if (error) {
        toast.error(error.message || "Failed to delete passkey");
        return;
      }
      toast.success("Passkey removed");
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete passkey";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  const hasPasskeys = passkeys && passkeys.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconKey className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Your passkeys
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {hasPasskeys
            ? "Continue with a registered passkey or manage your devices below."
            : "You don't have any passkeys yet. Create one for faster sign-ins, or continue without."}
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-6">
        {/* Passkey list */}
        <div className="space-y-3">
          {isLoadingPasskeys ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Loading passkeys...
            </div>
          ) : hasPasskeys ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {passkeys.map((pk: any) => (
                <div
                  key={pk.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-background border border-border/80 text-foreground shrink-0">
                      <IconDeviceMobile className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {pk.name || "Passkey"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added{" "}
                        {pk.createdAt
                          ? new Date(pk.createdAt).toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePasskey(pk.id)}
                    disabled={deletingId === pk.id}
                    className="size-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                    title="Delete passkey"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border p-4">
              No passkeys registered yet.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Continue — primary action */}
          <Button
            type="button"
            onClick={() => router.push("/home")}
            className="h-11 w-full cursor-pointer text-sm font-semibold tracking-wide"
          >
            <span className="flex items-center justify-center gap-2">
              <IconArrowRight className="size-5" />
              Continue
            </span>
          </Button>

          {/* Add new passkey — secondary */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddPasskey}
            disabled={addingPasskey}
            className="h-11 w-full cursor-pointer text-sm font-semibold tracking-wide"
          >
            <LoadingSwap isLoading={addingPasskey}>
              <span className="flex items-center justify-center gap-2">
                <IconPlus className="size-4" />
                <IconFingerprint className="size-5" />
                Add a new passkey
              </span>
            </LoadingSwap>
          </Button>
        </div>
      </div>
    </div>
  );
}
