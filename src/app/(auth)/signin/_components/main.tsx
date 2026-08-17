"use client";

import { useState, useEffect } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth-client";
import { IconFingerprint, IconMailCheck } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";

const signinSchema = z.object({
  email: z
    .string()
    .email({ message: "enter valid email" })
    .regex(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, {
      message: "enter valid email",
    }),
});

export type SigninSchema = z.infer<typeof signinSchema>;

export function SigninForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const [linkSent, setLinkSent] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const form = useForm<SigninSchema>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  // Silent background autofill — works only if THIS browser already has
  // a saved credential for this site (returning device).
  useEffect(() => {
    if (
      !window.PublicKeyCredential ||
      !PublicKeyCredential.isConditionalMediationAvailable
    ) {
      return;
    }

    PublicKeyCredential.isConditionalMediationAvailable().then((available) => {
      if (!available) return;
      void authClient.signIn.passkey({
        autoFill: true,
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/through-passkey";
          },
        },
      });
    });
  }, []);

  // Explicit button — triggers browser's native passkey picker
  async function handlePasskeyLogin() {
    form.clearErrors();
    setPasskeyLoading(true);
    const { error } = await authClient.signIn.passkey();
    setPasskeyLoading(false);

    if (error) {
      console.error("[Passkey sign-in error]:", error);
      form.setError("root", {
        message: error.message || "Couldn't sign in with passkey. You can use email instead.",
      });
      return;
    }
    window.location.href = "/through-passkey";
  }

  async function onSubmit(data: SigninSchema) {
    const { error } = await authClient.signIn.magicLink({
      email: data.email,
      callbackURL: "/through-passkey",
      newUserCallbackURL: "/add-passkey",
    });

    if (error) {
      form.setError("root", {
        message: error.message ?? "Something went wrong. Please try again.",
      });
      return;
    }

    setLinkSent(true);
  }

  if (linkSent) {
    const sentEmail = form.getValues("email");
    return (
      <div className="flex flex-col items-center justify-center py-2 space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Sign-in link sent to <span className="font-medium text-foreground">{sentEmail}</span>.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setLinkSent(false)}
          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Use a different email
        </Button>
      </div>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-3">
      {/* Passkey Button — Primary */}
      <Button
        type="button"
        variant="default"
        onClick={handlePasskeyLogin}
        disabled={isSubmitting || passkeyLoading}
        className="h-11 w-full cursor-pointer text-sm font-semibold tracking-wide"
      >
        <LoadingSwap isLoading={passkeyLoading}>
          <span className="flex items-center justify-center gap-2">
            <IconFingerprint className="size-5" />
            Sign in with passkey
          </span>
        </LoadingSwap>
      </Button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-0.5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          or
        </div>
      </div>

      {/* Magic Link Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
                Email
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                autoComplete="username webauthn"
                autoFocus
                aria-invalid={fieldState.invalid}
                className="h-10 rounded-lg text-sm"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Submit Button — Secondary */}
        <Button
          type="submit"
          variant="outline"
          disabled={isSubmitting || passkeyLoading}
          className="h-10 w-full cursor-pointer text-sm font-semibold tracking-wide"
        >
          <LoadingSwap isLoading={isSubmitting}>
            Continue
          </LoadingSwap>
        </Button>

        {/* Root-level error message — below Continue button */}
        {form.formState.errors.root && (
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
            {form.formState.errors.root.message}
          </div>
        )}
      </form>
    </div>
  );
}
