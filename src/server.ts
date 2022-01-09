import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import 'express-async-errors';

import AppError from '@errors/AppError';
import App from './app';

const { PORT } = process.env;
const { HOST } = process.env;

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

App.listen(Number(PORT), HOST || 'localhost', () => {
    console.log(`Server is running at ${HOST}:${PORT}`);
});
