import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Link — Organize, Categorize & Share All Your Links",
  description:
    "Link is your modern link management and sharing platform. Easily categorize, organize, and explore curated platforms, bio links, and content in one sleek place.",
};

export default function Page() {
  redirect("/home");
}