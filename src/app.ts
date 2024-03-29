import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import 'express-async-errors';

import rateLimiter from './App/Middlewares/RateLimiter';

import Routes from './Routes/index.routes';

import AppError from './Errors/AppError';

import App from './start';

if (process.env.DEV_MODE !== 'true') {
    console.log('Sentry is enabled');
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
    App.use(
        Sentry.Handlers.requestHandler({
            ip: true,
        }),
    );
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
