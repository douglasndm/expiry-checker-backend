import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

if (process.env.DEV_MODE === 'false') {
    // Ensure to call this before importing any other modules!
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [nodeProfilingIntegration()],
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        profilesSampleRate: 1.0,
    });
}
