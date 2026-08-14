"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Create a new QueryClient
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch immediately after hydration
        staleTime: 60 * 1000,
      },
    },
  });
}

// Reuse one QueryClient in the browser
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // Server: create a new QueryClient for every request
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  // Browser: reuse the same QueryClient
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

export default function QueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}