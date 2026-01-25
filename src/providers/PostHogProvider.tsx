import { ReactNode, useEffect, useState } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
// Set to the local proxy path defined in vercel.json
const POSTHOG_HOST = "/ph";

// Track if PostHog has been initialized
let isInitialized = false;

// Lazy initialization function - called after first render
const initPostHog = () => {
  if (isInitialized || !POSTHOG_KEY) return;
  
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://us.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false, // Disable auto-capture, we will do it manually
    // Performance optimizations
    autocapture: false, // Disable autocapture to reduce overhead
    disable_session_recording: true, // Disable unless explicitly needed
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        console.log("PostHog Loaded. ID:", ph.get_distinct_id());
      }
    },
  });
  
  isInitialized = true;
};

export function PostHogProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer PostHog initialization until after first paint
    // Use requestIdleCallback for non-critical initialization
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
        initPostHog();
        setMounted(true);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        initPostHog();
        setMounted(true);
      }, 100);
    }
  }, []);

  // Render children immediately, PostHog provider wraps after initialization
  if (!mounted || !POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
