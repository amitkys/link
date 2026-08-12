"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form"
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import { SignupOtherInput } from "./others-input";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingSwap } from "@/components/ui/loading-swap";

// type of signup
const signupSchema = z.object({
  name: z.string().min(1, { error: "enter your name" }),
  email: z.email({ message: "enter valid email" }).regex(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, { message: "enter valid email" }),
  password: z.string().min(8, { error: "password should be at least 8 character long" })
})

// infer type from signupSchema
export type SignupSchema = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter();

  // initalization react hook form with type
  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      name: "",
      password: ""
    },
  });

  async function onSubmit(SignupData: SignupSchema) {
    // on submit, do the signup
    const { data, error } = await signUp.email({
      email: SignupData.email,
      password: SignupData.password,
      name: SignupData.name,
    }, {
      onSuccess: () => {
        toast.success("signup successful", { position: "top-center" });
        router.push(`/signin?email=${encodeURIComponent(SignupData.email)}`);
      },
      onError: (ctx) => {
        form.setError("root", {
          message: ctx.error.message
        })
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Name field */}
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
              Name
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="text"
              autoComplete="name"
              aria-invalid={fieldState.invalid}
              className="h-10 rounded-lg text-sm"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Email & password fields */}
      <SignupOtherInput form={form} />

      {/* Root-level auth error */}
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

      {/* Submit */}
      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="mt-1 h-10 w-full cursor-pointer text-sm font-semibold tracking-wide"
      >
        <LoadingSwap isLoading={form.formState.isSubmitting}>
          Create Account
        </LoadingSwap>
      </Button>
    </form>
  )
}