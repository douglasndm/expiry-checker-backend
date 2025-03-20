import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Ensure to call this before importing any other modules!
Sentry.init({
	dsn: process.env.SENTRY_DSN,
	integrations: [nodeProfilingIntegration()],
	environment:
		process.env.DEV_MODE === 'false' ? 'production' : 'development',
	tracesSampleRate: 1.0, //  Capture 100% of the transactions
	profilesSampleRate: 1.0,
});
