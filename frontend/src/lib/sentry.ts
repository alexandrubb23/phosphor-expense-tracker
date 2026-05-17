import * as Sentry from "@sentry/react";
import { browserTracingIntegration, replayIntegration } from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

Sentry.init({
  dsn,
  environment: import.meta.env.MODE,
  enabled: !!dsn,
  integrations: [browserTracingIntegration(), replayIntegration()],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  // Capture 10% of sessions for replay in production, 100% on error
  replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0,
  replaysOnErrorSampleRate: 1.0,
});

export { Sentry };
