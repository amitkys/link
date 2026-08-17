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
    const { error } = await authClient.signIn.passkey({
      extensions: { credProps: true },
    });
    setPasskeyLoading(false);

    if (error) {
      form.setError("root", {
        message: "Couldn't sign in with passkey. You can use email instead.",
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
      <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconMailCheck className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Check your email
          </h2>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">{sentEmail}</span>. It
            expires shortly.
          </p>
        </div>
      </div>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-6">
      {/* Passkey Button */}
      <Button
        type="button"
        variant="outline"
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
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
          or
        </div>
      </div>

      {/* Magic Link Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
                aria-invalid={fieldState.invalid}
                className="h-10 rounded-lg text-sm"
                placeholder="name@example.com"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Root-level error message */}
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || passkeyLoading}
          className="mt-1 h-10 w-full cursor-pointer text-sm font-semibold tracking-wide"
        >
          <LoadingSwap isLoading={isSubmitting}>
            Email me a sign-in link
          </LoadingSwap>
        </Button>
      </form>
    </div>
  );
}
