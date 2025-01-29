import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'express-async-errors';
import * as Sentry from '@sentry/node';

import './loadEnv';

import '@services/Sentry';

import rateLimiter from './App/Middlewares/RateLimiter';

import Routes from './Routes/index.routes';

import AppError from './Errors/AppError';

import App from './start';

App.use(rateLimiter);
App.use(cors());

App.use(Routes);

Sentry.setupExpressErrorHandler(App);

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
