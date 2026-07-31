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
        toast.success("signup successful");
        router.push("/signin");
      },
      onError: (ctx) => {
        form.setError("root", {
          message: ctx.error.message
        })
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="text"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

          </Field>
        )}
      />
      <SignupOtherInput form={form} />
      {form.formState.errors.root && (
        <p className="text-red-500 text-sm font-medium my-2" role="alert">{form.formState.errors.root.message}</p>
      )}
      <Button type="submit">Create Account</Button>
    </form>
  )

}