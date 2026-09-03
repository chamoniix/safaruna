// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const sentryDsn =
  process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentryEnvironment =
  process.env.VERCEL_ENV === "production"
    ? "vercel-production"
    : process.env.VERCEL_ENV === "preview"
      ? "vercel-preview"
      : "local";
const isMonitoredVercelRuntime =
  Boolean(process.env.VERCEL_REGION) &&
  process.env.VERCEL_REGION !== "dev1" &&
  (process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview");

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn) && isMonitoredVercelRuntime,
  environment: sentryEnvironment,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
