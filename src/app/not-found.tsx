import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconArrowLeft, IconHome, IconLink } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 sm:py-24 bg-background">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Brand/Icon */}
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconLink className="size-8" />
        </div>

        {/* 404 Heading */}
        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            404 Error
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/home"
            className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto h-10 px-4 cursor-pointer font-semibold")}
          >
            <IconHome className="size-4 mr-2" />
            Go to Home
          </Link>

          <Link
            href="/signin"
            className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto h-10 px-4 cursor-pointer font-semibold")}
          >
            <IconArrowLeft className="size-4 mr-2" />
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
