import { Field, FieldError, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Controller, UseFormReturn } from "react-hook-form";
import { SignupSchema } from "./main";

export function SignupOtherInput({ form }: { form: UseFormReturn<SignupSchema> }) {

  return (
    <>
      {/* email */}
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
              Email
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              autoComplete="email"
              aria-invalid={fieldState.invalid}
              className="h-10 rounded-lg text-sm"
            />
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : (
              <FieldDescription className="text-xs font-semibold text-foreground/70">
                A fake mail won't help you in password recovery.
              </FieldDescription>
            )}
          </Field>
        )}
      />
      {/* password */}
      <Controller
        name="password"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
              Password
            </FieldLabel>
            <PasswordInput
              {...field}
              id={field.name}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={fieldState.invalid}
              className="h-10 rounded-lg text-sm"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  )
}