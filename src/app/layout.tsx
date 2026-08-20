import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CustomeToast } from "@/components/toast-provider";
import QueryProvider from "@/components/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ['latin'], weight: ["500", "600", "700", "800", "900"], variable: '--font-sans' });

const geistMono = Geist_Mono({
  variable: "--font-mono",
  weight: ["500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Link — Organize, Categorize & Share All Your Links",
    template: "%s | Link",
  },
  description:
    "Link is your modern link management and sharing platform. Easily categorize, organize, and explore curated platforms, bio links, and content in one sleek place.",
  keywords: [
    "link in bio",
    "social links",
    "link manager",
    "link organizer",
    "link sharing",
    "bookmarks",
    "category links",
    "Link",
  ],
  authors: [{ name: "Link Team" }],
  creator: "Link",
  publisher: "Link",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Link — Organize, Categorize & Share All Your Links",
    description:
      "Link is your modern link management and sharing platform. Easily categorize, organize, and explore curated platforms, bio links, and content in one sleek place.",
    siteName: "Link",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Link — Organize, Categorize & Share All Your Links",
    description:
      "Link is your modern link management and sharing platform. Easily categorize, organize, and explore curated platforms, bio links, and content in one sleek place.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <main>
          <QueryProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </QueryProvider>
        </main>
        <CustomeToast />
      </body>
    </html>
  );
}
