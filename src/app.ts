import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import cors from 'cors';

import rateLimiter from './App/Middlewares/RateLimiter';

import Routes from './Routes/index.routes';

import './Functions/Auth/Firebase';

import './Services/Database';
import './Services/Cron';

import App from './start';

if (process.env.DEV_MODE === 'false') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            new Sentry.Integrations.Http({ tracing: true }),
            new Tracing.Integrations.Express({
                app: App,
            }),
        ],
        tracesSampleRate: 0.1,
    });
    App.use(Sentry.Handlers.requestHandler());
    App.use(Sentry.Handlers.tracingHandler());
}

App.use(rateLimiter);

App.use(cors());

App.use(Routes);

export default App;
