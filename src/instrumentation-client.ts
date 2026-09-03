// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const vercelEnvironment = process.env.NEXT_PUBLIC_VERCEL_ENV;
const sentryEnvironment =
  vercelEnvironment === "production"
    ? "vercel-production"
    : vercelEnvironment === "preview"
      ? "vercel-preview"
      : "local";
const localHostnames = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const isLocalHostname = localHostnames.has(window.location.hostname.toLowerCase());
const isMonitoredVercelDeployment =
  vercelEnvironment === "production" || vercelEnvironment === "preview";

Sentry.init({
  dsn: sentryDsn,
  enabled:
    Boolean(sentryDsn) && isMonitoredVercelDeployment && !isLocalHostname,
  environment: sentryEnvironment,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
