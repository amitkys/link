import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Link — Organize, Categorize & Share All Your Links",
  description:
    "Link is your modern link management and sharing platform. Easily categorize, organize, and explore curated platforms, bio links, and content in one sleek place.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/home");
  }

  redirect("/signin");
}