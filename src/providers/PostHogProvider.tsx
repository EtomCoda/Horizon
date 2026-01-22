import { ReactNode } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

// Handle different environment variable naming conventions
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

// Initialize PostHog
if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // Disable auto-capture, we will do it manually
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        console.log('PostHog Loaded. ID:', ph.get_distinct_id());
      }
    },
  });
} else if (import.meta.env.DEV) {
  console.warn('PostHog Key is missing. Analytics will not be tracked.');
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
