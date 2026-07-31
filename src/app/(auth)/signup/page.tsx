"use client";
import { signUp } from "@/lib/auth-client"
import { SignupForm } from "./_components/main";
export default function Page() {

  const handleSignup = async () => {
    const { data, error } = await signUp.email({
      email: "amitkys59@gmail.com",
      password: "12345678",
      name: "amit"
    }, {
      onSuccess: (ctx) => {
        alert("signup successful")
      },
      onError: (ctx) => {
        alert("signup failed")
      }
    })
  }

  return (
    <SignupForm />
  )
}