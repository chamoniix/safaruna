// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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
