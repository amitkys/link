import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
              placeholder="you@example.com"
              aria-invalid={fieldState.invalid}
              className="h-10 rounded-lg text-sm"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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