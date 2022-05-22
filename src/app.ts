import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import cors from 'cors';
import 'express-async-errors';

import rateLimiter from './App/Middlewares/RateLimiter';

import Routes from './Routes/index.routes';

import './Services/Firebase';
import './Services/Redis';
import './Services/Database';
import './Services/Cron';

import AppError from './Errors/AppError';

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

App.use(Sentry.Handlers.errorHandler());
App.use((err: Error, request: Request, response: Response, _: NextFunction) => {
    if (err instanceof AppError) {
        return response.status(err.statusCode).json({
            status: 'error',
            errorCode: err.errorCode,
            message: err.message,
        });
    }

    console.error(err);

    return response.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
});

export default App;
