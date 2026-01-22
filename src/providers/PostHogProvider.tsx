import { ReactNode } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

// Handle different environment variable naming conventions
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
// Use reverse proxy to avoid ad blockers - falls back to direct PostHog if not set
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "/ingest";

// Initialize PostHog
if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://us.posthog.com", // Required when using reverse proxy
    person_profiles: "identified_only",
    capture_pageview: false, // Disable auto-capture, we will do it manually
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        console.log("PostHog Loaded. ID:", ph.get_distinct_id());
      }
    },
  });
} else if (import.meta.env.DEV) {
  console.warn("PostHog Key is missing. Analytics will not be tracked.");
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
