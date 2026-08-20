/**
 * Navigates client-side by updating the browser URL and search parameters
 * without triggering Next.js App Router Server Component (RSC) re-renders.
 */
export function navigateClient(href: string) {
  if (typeof window === "undefined") return;
  window.history.pushState(null, "", href);
  window.dispatchEvent(new Event("popstate"));
}
