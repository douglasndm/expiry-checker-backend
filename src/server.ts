import { Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import AppError from '@errors/AppError';
import App from './app';

import './Services/Database';

const { PORT } = process.env;
const { HOST } = process.env;

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
    console.log('Server is running at 3213');
});
